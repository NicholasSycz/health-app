from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.models.user import User


def register_user(db: Session, email: str, password: str) -> Tuple[User, str]:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("Email already registered")

    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return user, token


def authenticate_user(
    db: Session, email: str, password: str
) -> Optional[Tuple[User, str]]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None

    token = create_access_token(user.id)
    return user, token
