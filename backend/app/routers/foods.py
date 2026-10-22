from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models.food import Food
from app.models.user import User
from app.schemas.food_log import FoodPortionResponse, FoodResponse
from app.services.units import LOG_UNITS, MASS_TO_GRAMS, VOLUME_TO_ML

router = APIRouter(prefix="/foods", tags=["foods"])


@router.get("/units")
def list_units():
    """Units the log form can offer without knowing the food."""
    return {
        "mass": sorted(MASS_TO_GRAMS),
        "volume": sorted(VOLUME_TO_ML),
        "all": list(LOG_UNITS),
    }


@router.get("/", response_model=List[FoodResponse])
def search_foods(
    q: Optional[str] = Query(None, min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Foods this user can log: their own, plus any shared/external ones."""
    query = db.query(Food).filter(
        or_(Food.created_by == current_user.id, Food.created_by.is_(None))
    )
    if q:
        query = query.filter(Food.name.ilike("%{}%".format(q)))
    return query.order_by(Food.name).limit(25).all()


@router.get("/{food_id}/portions", response_model=List[FoodPortionResponse])
def list_food_portions(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    food = db.query(Food).filter(Food.id == food_id).first()
    if food is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Food not found"
        )
    if food.created_by is not None and food.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your food"
        )
    return food.portions
