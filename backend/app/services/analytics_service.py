from datetime import date, timedelta
from typing import Dict, List, Tuple
from zoneinfo import ZoneInfo

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.food_log import FoodLog
from app.schemas.analytics import (
    DailyTotals,
    DayBreakdown,
    GoalProgressDay,
    MacroDay,
)
from app.services.goal_service import get_goal_for_date
from app.services.timezones import day_bounds_utc, local_date_expr, range_bounds_utc


def get_daily_totals(
    db: Session, user_id: int, target_date: date, tz: ZoneInfo
) -> DailyTotals:
    start_dt, end_dt = day_bounds_utc(target_date, tz)

    row = (
        db.query(
            func.coalesce(func.sum(FoodLog.calories), 0).label("total_calories"),
            func.coalesce(func.sum(FoodLog.protein), 0).label("total_protein"),
            func.coalesce(func.sum(FoodLog.carbs), 0).label("total_carbs"),
            func.coalesce(func.sum(FoodLog.fat), 0).label("total_fat"),
            func.count(FoodLog.id).label("entry_count"),
        )
        .filter(
            FoodLog.user_id == user_id,
            FoodLog.consumed_at >= start_dt,
            FoodLog.consumed_at < end_dt,
        )
        .one()
    )

    return DailyTotals(
        date=target_date,
        total_calories=row.total_calories,
        total_protein=row.total_protein,
        total_carbs=row.total_carbs,
        total_fat=row.total_fat,
        entry_count=row.entry_count,
    )


def get_weekly_totals(
    db: Session, user_id: int, week_start: date, tz: ZoneInfo
) -> List[DayBreakdown]:
    week_end = week_start + timedelta(days=7)
    breakdown = _get_date_range_breakdown(db, user_id, week_start, week_end, tz)

    days = []
    for i in range(7):
        d = week_start + timedelta(days=i)
        totals = breakdown.get(d, (0, 0, 0, 0))
        days.append(
            DayBreakdown(
                date=d,
                total_calories=totals[0],
                total_protein=totals[1],
                total_carbs=totals[2],
                total_fat=totals[3],
            )
        )
    return days


def get_macros_trend(
    db: Session, user_id: int, start: date, end: date, tz: ZoneInfo
) -> List[MacroDay]:
    # `end` is inclusive for callers; the breakdown takes a half-open range.
    breakdown = _get_date_range_breakdown(
        db, user_id, start, end + timedelta(days=1), tz
    )

    days = []
    current = start
    while current <= end:
        totals = breakdown.get(current, (0, 0, 0, 0))
        days.append(
            MacroDay(
                date=current,
                protein=totals[1],
                carbs=totals[2],
                fat=totals[3],
            )
        )
        current += timedelta(days=1)
    return days


def get_goal_progress(
    db: Session, user_id: int, start: date, end: date, tz: ZoneInfo
) -> List[GoalProgressDay]:
    # `end` is inclusive for callers; the breakdown takes a half-open range.
    breakdown = _get_date_range_breakdown(
        db, user_id, start, end + timedelta(days=1), tz
    )

    days = []
    current = start
    while current <= end:
        totals = breakdown.get(current, (0, 0, 0, 0))
        goal = get_goal_for_date(db, user_id, current)
        days.append(
            GoalProgressDay(
                date=current,
                actual_calories=totals[0],
                goal_calories=goal.calories_goal if goal else None,
                actual_protein=totals[1],
                goal_protein=goal.protein_goal if goal else None,
                actual_carbs=totals[2],
                goal_carbs=goal.carbs_goal if goal else None,
                actual_fat=totals[3],
                goal_fat=goal.fat_goal if goal else None,
            )
        )
        current += timedelta(days=1)
    return days


def _get_date_range_breakdown(
    db: Session,
    user_id: int,
    start: date,
    end: date,
    tz: ZoneInfo,
) -> Dict[date, Tuple[float, float, float, float]]:
    """Totals per local calendar day over the half-open range [start, end).

    Both the filter and the grouping run in `tz`: the filter converts the local
    range to UTC instants, and the GROUP BY buckets each row by its date in the
    user's zone rather than the database server's.
    """
    start_dt, end_dt = range_bounds_utc(start, end, tz)
    log_date = local_date_expr(FoodLog.consumed_at, tz)

    rows = (
        db.query(
            log_date.label("log_date"),
            func.sum(FoodLog.calories).label("total_calories"),
            func.sum(FoodLog.protein).label("total_protein"),
            func.sum(FoodLog.carbs).label("total_carbs"),
            func.sum(FoodLog.fat).label("total_fat"),
        )
        .filter(
            FoodLog.user_id == user_id,
            FoodLog.consumed_at >= start_dt,
            FoodLog.consumed_at < end_dt,
        )
        .group_by(log_date)
        .all()
    )

    return {
        row.log_date: (
            row.total_calories,
            row.total_protein,
            row.total_carbs,
            row.total_fat,
        )
        for row in rows
    }
