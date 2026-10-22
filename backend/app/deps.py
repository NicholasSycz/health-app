from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import HTTPException, Query, status

from app.services.timezones import DEFAULT_TZ, TimezoneError, resolve


def get_timezone(
    tz: Optional[str] = Query(
        None,
        description=(
            "IANA timezone name (e.g. 'Asia/Tokyo') used to decide where each "
            "calendar day starts and ends. Defaults to UTC."
        ),
        examples=["Asia/Tokyo"],
    ),
) -> ZoneInfo:
    try:
        return resolve(tz or DEFAULT_TZ)
    except TimezoneError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )
