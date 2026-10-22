"""add units and food portions

Revision ID: 65c6ca84cb65
Revises: 353632f16727
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "65c6ca84cb65"
down_revision: Union[str, None] = "353632f16727"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UNITS = ("g", "kg", "oz", "lb", "ml", "l", "tsp", "tbsp", "fl_oz", "cup", "portion", "serving")
_UNIT_SQL = ", ".join("'{}'".format(u) for u in UNITS)


def upgrade() -> None:
    # --- foods: provenance + how to interpret the macro columns ---------------
    op.add_column(
        "foods",
        sa.Column(
            "basis", sa.String(), nullable=False, server_default="per_serving"
        ),
    )
    op.add_column("foods", sa.Column("density_g_per_ml", sa.Float(), nullable=True))
    op.add_column("foods", sa.Column("source", sa.String(), nullable=True))
    op.add_column("foods", sa.Column("external_id", sa.String(), nullable=True))
    op.create_check_constraint(
        "ck_foods_basis", "foods", "basis IN ('per_100g', 'per_serving')"
    )
    op.create_unique_constraint(
        "uq_foods_source_external_id", "foods", ["source", "external_id"]
    )

    # --- food_portions --------------------------------------------------------
    op.create_table(
        "food_portions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("food_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column("gram_weight", sa.Float(), nullable=False),
        sa.Column(
            "is_default", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.ForeignKeyConstraint(["food_id"], ["foods.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("food_id", "label", name="uq_food_portions_food_id_label"),
    )
    op.create_index("ix_food_portions_food_id", "food_portions", ["food_id"])

    # --- food_logs: quantity -> amount + unit + portion + grams ---------------
    op.alter_column("food_logs", "quantity", new_column_name="amount")
    op.add_column(
        "food_logs",
        sa.Column("unit", sa.String(), nullable=False, server_default="serving"),
    )
    op.add_column("food_logs", sa.Column("portion_id", sa.Integer(), nullable=True))
    op.add_column("food_logs", sa.Column("grams", sa.Float(), nullable=True))
    op.create_foreign_key(
        "fk_food_logs_portion_id", "food_logs", "food_portions", ["portion_id"], ["id"]
    )
    op.create_check_constraint(
        "ck_food_logs_unit", "food_logs", "unit IN ({})".format(_UNIT_SQL)
    )
    op.create_check_constraint(
        "ck_food_logs_portion_required",
        "food_logs",
        "(unit <> 'portion') OR (portion_id IS NOT NULL)",
    )
    op.create_check_constraint(
        "ck_food_logs_amount_positive", "food_logs", "amount > 0"
    )

    # Existing rows predate units: their `quantity` was a multiplier over the
    # food's macro row, which is exactly what 'serving' means. The server_default
    # already wrote 'serving' into every existing row, so no data UPDATE is
    # needed -- and their snapshotted macros are untouched, so history holds.


def downgrade() -> None:
    op.drop_constraint("ck_food_logs_amount_positive", "food_logs", type_="check")
    op.drop_constraint("ck_food_logs_portion_required", "food_logs", type_="check")
    op.drop_constraint("ck_food_logs_unit", "food_logs", type_="check")
    op.drop_constraint("fk_food_logs_portion_id", "food_logs", type_="foreignkey")
    op.drop_column("food_logs", "grams")
    op.drop_column("food_logs", "portion_id")
    op.drop_column("food_logs", "unit")
    op.alter_column("food_logs", "amount", new_column_name="quantity")

    op.drop_index("ix_food_portions_food_id", table_name="food_portions")
    op.drop_table("food_portions")

    op.drop_constraint("uq_foods_source_external_id", "foods", type_="unique")
    op.drop_constraint("ck_foods_basis", "foods", type_="check")
    op.drop_column("foods", "external_id")
    op.drop_column("foods", "source")
    op.drop_column("foods", "density_g_per_ml")
    op.drop_column("foods", "basis")
