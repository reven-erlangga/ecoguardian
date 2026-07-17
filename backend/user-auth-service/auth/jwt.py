from datetime import datetime, timedelta, timezone

import jwt as pyjwt

from common.config import Config


def create_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return pyjwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    return pyjwt.decode(
        token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM]
    )
