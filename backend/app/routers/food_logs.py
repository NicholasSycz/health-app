from datetime import date
from typing import List, Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.deps import get_timezone
from app.models.user import User
from app.schemas.food_log import FoodLogCreate, FoodLogResponse
from app.services import food_log_service
from app.services.units import UnitError

router = APIRouter(prefix="/food-logs", tags=["food-logs"])


@router.post("/", response_model=FoodLogResponse, status_code=status.HTTP_201_CREATED)
def create_food_log(
    body: FoodLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        log = food_log_service.create_food_log(
            db=db,
            user_id=current_user.id,
            food_name=body.food_name,
            calories=body.calories,
            protein=body.protein,
            carbs=body.carbs,
            fat=body.fat,
            amount=body.amount,
            unit=body.unit,
            portion_id=body.portion_id,
            basis=body.basis,
            density_g_per_ml=body.density_g_per_ml,
            consumed_at=body.consumed_at,
        )
    except UnitError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )
    return log


@router.get("/", response_model=List[FoodLogResponse])
def list_food_logs(
    range: Optional[str] = Query(None, pattern="^(today|week|month)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tz: ZoneInfo = Depends(get_timezone),
):
    return food_log_service.get_food_logs(
        db=db,
        user_id=current_user.id,
        tz=tz,
        range_name=range,
        start_date=start_date,
        end_date=end_date,
    )


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = food_log_service.delete_food_log(db, log_id, current_user.id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food log not found")
    if result is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your food log")
