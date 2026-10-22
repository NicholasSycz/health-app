from datetime import date, datetime, timedelta
from typing import List, Optional, Tuple
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.models.food import BASIS_PER_100G, BASIS_PER_SERVING, Food
from app.models.food_log import FoodLog
from app.models.food_portion import FoodPortion
from app.services.timezones import now_utc, range_bounds_utc, today_in
from app.services.units import SERVING_UNIT, UnitError, to_grams


def create_food_log(
    db: Session,
    user_id: int,
    food_name: str,
    calories: float,
    protein: float,
    carbs: float,
    fat: float,
    amount: float = 1.0,
    unit: str = SERVING_UNIT,
    portion_id: Optional[int] = None,
    basis: str = BASIS_PER_SERVING,
    density_g_per_ml: Optional[float] = None,
    consumed_at: Optional[datetime] = None,
) -> FoodLog:
    food = (
        db.query(Food)
        .filter(Food.name == food_name, Food.created_by == user_id)
        .first()
    )
    if not food:
        food = Food(
            name=food_name,
            calories=calories,
            protein=protein,
            carbs=carbs,
            fat=fat,
            created_by=user_id,
            basis=basis,
            density_g_per_ml=density_g_per_ml,
        )
        db.add(food)
        db.flush()

    portion = _resolve_portion(db, food, unit, portion_id)
    grams = to_grams(
        amount,
        unit,
        density_g_per_ml=food.density_g_per_ml,
        portion_gram_weight=portion.gram_weight if portion else None,
    )
    factor = _macro_factor(food, amount, unit, grams)

    log = FoodLog(
        user_id=user_id,
        food_id=food.id,
        calories=food.calories * factor,
        protein=food.protein * factor,
        carbs=food.carbs * factor,
        fat=food.fat * factor,
        amount=amount,
        unit=unit,
        portion_id=portion.id if portion else None,
        grams=grams,
        consumed_at=consumed_at or now_utc(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def _resolve_portion(
    db: Session, food: Food, unit: str, portion_id: Optional[int]
) -> Optional[FoodPortion]:
    """Look up the selected portion, ensuring it belongs to this food."""
    if unit != "portion":
        return None
    if portion_id is None:
        raise UnitError("A portion must be selected when logging in portions.")
    portion = (
        db.query(FoodPortion)
        .filter(FoodPortion.id == portion_id, FoodPortion.food_id == food.id)
        .first()
    )
    if portion is None:
        raise UnitError("That portion does not belong to this food.")
    return portion


def _macro_factor(
    food: Food, amount: float, unit: str, grams: Optional[float]
) -> float:
    """How many times the food's stored macro row this entry represents."""
    if unit == SERVING_UNIT:
        if food.basis == BASIS_PER_100G:
            raise UnitError(
                "This food's macros are recorded per 100 g. Log it by weight, "
                "volume, or one of its portions."
            )
        return amount

    if food.basis == BASIS_PER_SERVING:
        raise UnitError(
            "'{}' has no recorded serving weight, so it can only be logged in "
            "servings.".format(food.name)
        )

    # basis is per_100g and grams is resolved
    return grams / 100.0


def get_food_logs(
    db: Session,
    user_id: int,
    tz: ZoneInfo,
    range_name: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[FoodLog]:
    start_dt, end_dt = _resolve_date_range(range_name, start_date, end_date, tz)
    query = db.query(FoodLog).filter(FoodLog.user_id == user_id)
    if start_dt:
        query = query.filter(FoodLog.consumed_at >= start_dt)
    if end_dt:
        query = query.filter(FoodLog.consumed_at < end_dt)
    return query.order_by(FoodLog.consumed_at.desc()).all()


def delete_food_log(db: Session, log_id: int, user_id: int) -> Optional[bool]:
    log = db.query(FoodLog).filter(FoodLog.id == log_id).first()
    if not log:
        return None
    if log.user_id != user_id:
        return False
    db.delete(log)
    db.commit()
    return True


def _resolve_date_range(
    range_name: Optional[str],
    start_date: Optional[date],
    end_date: Optional[date],
    tz: ZoneInfo,
) -> Tuple[Optional[datetime], Optional[datetime]]:
    """Resolve a named or explicit range to UTC instants.

    Dates in and out are the user's local calendar dates; the bounds returned
    are the UTC instants those local midnights correspond to.
    """
    if start_date or end_date:
        start_dt = None
        end_dt = None
        if start_date:
            start_dt, _ = range_bounds_utc(start_date, start_date, tz)
        if end_date:
            _, end_dt = range_bounds_utc(end_date, end_date + timedelta(days=1), tz)
        return start_dt, end_dt

    today = today_in(tz)
    if range_name == "today":
        start, end = today, today + timedelta(days=1)
    elif range_name == "week":
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=7)
    elif range_name == "month":
        start = today.replace(day=1)
        if today.month == 12:
            end = start.replace(year=today.year + 1, month=1)
        else:
            end = start.replace(month=today.month + 1)
    else:
        return None, None

    return range_bounds_utc(start, end, tz)
