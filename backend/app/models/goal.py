from datetime import date
from typing import Optional

from sqlalchemy import Integer, Float, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    calories_goal: Mapped[float] = mapped_column(Float, nullable=False)
    protein_goal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    carbs_goal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fat_goal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
