from datetime import date
from typing import List, Optional

from pydantic import BaseModel


class DailyTotals(BaseModel):
    date: date
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    entry_count: int


class DayBreakdown(BaseModel):
    date: date
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float


class MacroDay(BaseModel):
    date: date
    protein: float
    carbs: float
    fat: float


class GoalProgressDay(BaseModel):
    date: date
    actual_calories: float
    goal_calories: Optional[float] = None
    actual_protein: float
    goal_protein: Optional[float] = None
    actual_carbs: float
    goal_carbs: Optional[float] = None
    actual_fat: float
    goal_fat: Optional[float] = None


class WeeklyResponse(BaseModel):
    days: List[DayBreakdown]


class MacrosTrendResponse(BaseModel):
    days: List[MacroDay]


class GoalProgressResponse(BaseModel):
    days: List[GoalProgressDay]
