from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# Pin the session to UTC so timestamptz values render as +00:00 on the wire and
# never pick up the database server's local zone. Day bucketing is done with an
# explicit AT TIME ZONE per query, so this setting does not affect analytics.
_connect_args = (
    {"options": "-c timezone=utc"}
    if settings.DATABASE_URL.startswith("postgresql")
    else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
