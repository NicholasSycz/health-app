from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.deps import get_timezone
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalResponse
from app.services import goal_service

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    body: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return goal_service.create_goal(
        db=db,
        user_id=current_user.id,
        calories_goal=body.calories_goal,
        protein_goal=body.protein_goal,
        carbs_goal=body.carbs_goal,
        fat_goal=body.fat_goal,
        start_date=body.start_date,
        end_date=body.end_date,
    )


@router.get("/current", response_model=GoalResponse)
def get_current_goal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tz: ZoneInfo = Depends(get_timezone),
):
    goal = goal_service.get_current_goal(db, current_user.id, tz)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No active goal found"
        )
    return goal
