from datetime import datetime
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.services.units import LOG_UNITS

_UNIT_LIST = ", ".join("'{}'".format(u) for u in LOG_UNITS)


class FoodLog(Base):
    __tablename__ = "food_logs"
    __table_args__ = (
        CheckConstraint(
            "unit IN ({})".format(_UNIT_LIST), name="ck_food_logs_unit"
        ),
        CheckConstraint(
            "(unit <> 'portion') OR (portion_id IS NOT NULL)",
            name="ck_food_logs_portion_required",
        ),
        CheckConstraint("amount > 0", name="ck_food_logs_amount_positive"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    food_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("foods.id"), nullable=True
    )
    # Macros are snapshotted at write time so edits to the food never rewrite history.
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein: Mapped[float] = mapped_column(Float, nullable=False)
    carbs: Mapped[float] = mapped_column(Float, nullable=False)
    fat: Mapped[float] = mapped_column(Float, nullable=False)

    amount: Mapped[float] = mapped_column(Float, nullable=False, default=1)
    unit: Mapped[str] = mapped_column(String, nullable=False, server_default="serving")
    portion_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("food_portions.id"), nullable=True
    )
    # Resolved mass for the entry. NULL when the unit is 'serving', which carries
    # no recorded gram weight.
    grams: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # timestamptz: stored as an absolute instant, never a wall-clock reading.
    consumed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    food = relationship("Food", lazy="joined")
    portion = relationship("FoodPortion", lazy="joined")

    @property
    def food_name(self) -> Optional[str]:
        return self.food.name if self.food else None

    @property
    def unit_label(self) -> str:
        """Human-readable unit for display ('1.5 cup, chopped')."""
        if self.unit == "portion" and self.portion is not None:
            return self.portion.label
        return self.unit
