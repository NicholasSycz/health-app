from datetime import date, timedelta
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.deps import get_timezone
from app.models.user import User
from app.schemas.analytics import (
    DailyTotals,
    GoalProgressResponse,
    MacrosTrendResponse,
    WeeklyResponse,
)
from app.services import analytics_service
from app.services.timezones import today_in

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/daily", response_model=DailyTotals)
def get_daily(
    target_date: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tz: ZoneInfo = Depends(get_timezone),
):
    target = target_date or today_in(tz)
    return analytics_service.get_daily_totals(db, current_user.id, target, tz)


@router.get("/weekly", response_model=WeeklyResponse)
def get_weekly(
    week_start: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tz: ZoneInfo = Depends(get_timezone),
):
    today = today_in(tz)
    start = week_start or (today - timedelta(days=today.weekday()))
    days = analytics_service.get_weekly_totals(db, current_user.id, start, tz)
    return WeeklyResponse(days=days)


@router.get("/macros-trend", response_model=MacrosTrendResponse)
def get_macros_trend(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tz: ZoneInfo = Depends(get_timezone),
):
    end = end_date or today_in(tz)
    start = start_date or (end - timedelta(days=days - 1))
    trend = analytics_service.get_macros_trend(db, current_user.id, start, end, tz)
    return MacrosTrendResponse(days=trend)


@router.get("/goal-progress", response_model=GoalProgressResponse)
def get_goal_progress(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tz: ZoneInfo = Depends(get_timezone),
):
    end = end_date or today_in(tz)
    start = start_date or (end - timedelta(days=days - 1))
    progress = analytics_service.get_goal_progress(db, current_user.id, start, end, tz)
    return GoalProgressResponse(days=progress)
