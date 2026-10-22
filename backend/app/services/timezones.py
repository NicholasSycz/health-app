"""Timezone handling for day boundaries.

Instants are stored and transported in UTC. A "day" is not an instant, though --
it is a local calendar concept -- so every query that buckets logs by day has to
be told which zone to use. Callers pass an IANA name ('Asia/Tokyo'); UTC is the
fallback when the client sends nothing.
"""

from datetime import date, datetime, time, timedelta, timezone
from typing import Optional, Tuple
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import Date, cast, func

UTC = timezone.utc
DEFAULT_TZ = "UTC"


class TimezoneError(ValueError):
    """Raised for an unrecognised IANA timezone name."""


def resolve(tz_name: Optional[str]) -> ZoneInfo:
    if not tz_name:
        tz_name = DEFAULT_TZ
    try:
        return ZoneInfo(tz_name)
    except (ZoneInfoNotFoundError, ValueError, KeyError):
        raise TimezoneError("Unknown timezone '{}'.".format(tz_name))


def now_utc() -> datetime:
    return datetime.now(UTC)


def today_in(tz: ZoneInfo) -> date:
    """The user's current calendar date, which may differ from UTC's."""
    return datetime.now(tz).date()


def day_bounds_utc(target_date: date, tz: ZoneInfo) -> Tuple[datetime, datetime]:
    """The UTC half-open interval [start, end) covering one local calendar day."""
    return range_bounds_utc(target_date, target_date + timedelta(days=1), tz)


def range_bounds_utc(
    start: date, end: date, tz: ZoneInfo
) -> Tuple[datetime, datetime]:
    """UTC bounds for local dates [start, end).

    Uses midnight in `tz`; on DST transition days this is still the correct
    instant, because the offset is resolved per-date rather than assumed fixed.
    """
    start_local = datetime.combine(start, time.min, tzinfo=tz)
    end_local = datetime.combine(end, time.min, tzinfo=tz)
    return start_local.astimezone(UTC), end_local.astimezone(UTC)


def local_date_expr(column, tz: ZoneInfo):
    """SQL expression for a timestamptz column's calendar date in `tz`.

    Renders as `(col AT TIME ZONE 'zone')::date`, so grouping happens in the
    user's zone instead of the database server's.
    """
    return cast(func.timezone(str(tz), column), Date)
