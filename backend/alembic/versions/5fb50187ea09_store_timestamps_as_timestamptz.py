"""store timestamps as timestamptz

Existing values were written by datetime.utcnow(), i.e. they are naive UTC
readings. The USING clauses below label them as UTC rather than reinterpreting
them in the server's local zone, which would shift every historical row.

Revision ID: 5fb50187ea09
Revises: 65c6ca84cb65
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "5fb50187ea09"
down_revision: Union[str, None] = "65c6ca84cb65"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "food_logs",
        "consumed_at",
        type_=sa.DateTime(timezone=True),
        existing_type=sa.DateTime(),
        existing_nullable=False,
        postgresql_using="consumed_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "users",
        "created_at",
        type_=sa.DateTime(timezone=True),
        existing_type=sa.DateTime(),
        existing_nullable=True,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    # Back to naive UTC readings, matching what the old code wrote.
    op.alter_column(
        "users",
        "created_at",
        type_=sa.DateTime(),
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=True,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "food_logs",
        "consumed_at",
        type_=sa.DateTime(),
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
        postgresql_using="consumed_at AT TIME ZONE 'UTC'",
    )
