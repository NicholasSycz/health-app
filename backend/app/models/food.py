from typing import List, Optional

from sqlalchemy import (
    CheckConstraint,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

BASIS_PER_100G = "per_100g"
BASIS_PER_SERVING = "per_serving"
BASES = (BASIS_PER_100G, BASIS_PER_SERVING)


class Food(Base):
    __tablename__ = "foods"
    __table_args__ = (
        CheckConstraint(
            "basis IN ('per_100g', 'per_serving')", name="ck_foods_basis"
        ),
        UniqueConstraint("source", "external_id", name="uq_foods_source_external_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein: Mapped[float] = mapped_column(Float, nullable=False)
    carbs: Mapped[float] = mapped_column(Float, nullable=False)
    fat: Mapped[float] = mapped_column(Float, nullable=False)
    serving_size: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )

    # Whether the macro columns above describe 100 g of this food or one serving.
    # Legacy rows predate unit support and have no recorded serving weight, so
    # they stay 'per_serving' and are only loggable in 'serving' units.
    basis: Mapped[str] = mapped_column(
        String, nullable=False, server_default=BASIS_PER_SERVING
    )
    # Grams per millilitre; lets volume units resolve to mass. NULL means this
    # food has no known density and volume units must go through a portion.
    density_g_per_ml: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    # Provenance for externally sourced foods ('usda', 'off'); NULL for user foods.
    source: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    external_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    portions: Mapped[List["FoodPortion"]] = relationship(
        "FoodPortion",
        back_populates="food",
        cascade="all, delete-orphan",
        order_by="FoodPortion.gram_weight",
    )
