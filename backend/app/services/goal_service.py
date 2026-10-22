from datetime import date
from typing import Optional
from zoneinfo import ZoneInfo

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.services.timezones import today_in


def create_goal(
    db: Session,
    user_id: int,
    calories_goal: float,
    protein_goal: Optional[float],
    carbs_goal: Optional[float],
    fat_goal: Optional[float],
    start_date: date,
    end_date: Optional[date],
) -> Goal:
    goal = Goal(
        user_id=user_id,
        calories_goal=calories_goal,
        protein_goal=protein_goal,
        carbs_goal=carbs_goal,
        fat_goal=fat_goal,
        start_date=start_date,
        end_date=end_date,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_current_goal(db: Session, user_id: int, tz: ZoneInfo) -> Optional[Goal]:
    return get_goal_for_date(db, user_id, today_in(tz))


def get_goal_for_date(db: Session, user_id: int, target_date: date) -> Optional[Goal]:
    return (
        db.query(Goal)
        .filter(
            Goal.user_id == user_id,
            Goal.start_date <= target_date,
            or_(Goal.end_date >= target_date, Goal.end_date.is_(None)),
        )
        .order_by(Goal.start_date.desc())
        .first()
    )
