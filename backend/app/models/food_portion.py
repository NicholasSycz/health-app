from typing import Optional

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FoodPortion(Base):
    """A named serving of a food, with its weight in grams.

    Mirrors the `foodPortions` array USDA FoodData Central returns, and is what
    makes count/volume units ("1 medium", "1 cup, chopped") resolvable: the
    gram weight is food-specific and cannot be derived from the unit alone.
    """

    __tablename__ = "food_portions"
    __table_args__ = (
        UniqueConstraint("food_id", "label", name="uq_food_portions_food_id_label"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String, nullable=False)
    gram_weight: Mapped[float] = mapped_column(Float, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    food = relationship("Food", back_populates="portions")
