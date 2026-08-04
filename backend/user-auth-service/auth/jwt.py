from datetime import datetime, timedelta, timezone
from hashlib import sha256
from secrets import token_urlsafe

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


def create_refresh_token() -> tuple:
    """Return (raw_token, sha256_hash, expires_at)."""
    raw = token_urlsafe(48)
    h = sha256(raw.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=Config.REFRESH_TOKEN_EXPIRY_DAYS
    )
    return raw, h, expires_at


def hash_refresh_token(raw: str) -> str:
    return sha256(raw.encode()).hexdigest()
