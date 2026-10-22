from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.models.food import BASES, BASIS_PER_SERVING
from app.services.units import LOG_UNITS, PORTION_UNIT, SERVING_UNIT


class FoodLogCreate(BaseModel):
    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    amount: float = Field(default=1.0, gt=0)
    unit: str = Field(default=SERVING_UNIT)
    portion_id: Optional[int] = None
    # Only consulted when this call creates a new food.
    basis: str = Field(default=BASIS_PER_SERVING)
    density_g_per_ml: Optional[float] = Field(default=None, gt=0)
    consumed_at: Optional[datetime] = None

    @model_validator(mode="after")
    def check_unit(self):
        if self.unit not in LOG_UNITS:
            raise ValueError(
                "unit must be one of: {}".format(", ".join(LOG_UNITS))
            )
        if self.basis not in BASES:
            raise ValueError("basis must be one of: {}".format(", ".join(BASES)))
        if self.unit == PORTION_UNIT and self.portion_id is None:
            raise ValueError("portion_id is required when unit is 'portion'")
        return self


class FoodLogResponse(BaseModel):
    id: int
    food_id: Optional[int] = None
    food_name: Optional[str] = None
    calories: float
    protein: float
    carbs: float
    fat: float
    amount: float
    unit: str
    unit_label: str
    portion_id: Optional[int] = None
    grams: Optional[float] = None
    consumed_at: datetime

    model_config = {"from_attributes": True}


class FoodPortionResponse(BaseModel):
    id: int
    label: str
    gram_weight: float
    is_default: bool

    model_config = {"from_attributes": True}


class FoodResponse(BaseModel):
    id: int
    name: str
    basis: str
    density_g_per_ml: Optional[float] = None
    serving_size: Optional[str] = None
    portions: list[FoodPortionResponse] = []

    model_config = {"from_attributes": True}
