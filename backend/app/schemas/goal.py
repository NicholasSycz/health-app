from datetime import date
from typing import Optional

from pydantic import BaseModel


class GoalCreate(BaseModel):
    calories_goal: float
    protein_goal: Optional[float] = None
    carbs_goal: Optional[float] = None
    fat_goal: Optional[float] = None
    start_date: date
    end_date: Optional[date] = None


class GoalResponse(BaseModel):
    id: int
    user_id: int
    calories_goal: float
    protein_goal: Optional[float] = None
    carbs_goal: Optional[float] = None
    fat_goal: Optional[float] = None
    start_date: date
    end_date: Optional[date] = None

    model_config = {"from_attributes": True}
