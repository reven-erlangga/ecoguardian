"""
Unit tests for JWT token creation / decoding
"""

import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

import jwt as pyjwt
import pytest

# ── Ensure package root is on sys.path ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

from auth.jwt import create_token, decode_token, create_refresh_token, hash_refresh_token
from common.config import Config

USER_ID = "user-abc-123"
ROLE = "admin"


def test_create_token_returns_string_with_three_parts():
    token = create_token(USER_ID, ROLE)
    parts = token.split(".")
    assert len(parts) == 3, f"Expected 3 parts (header.payload.signature), got {len(parts)}"


def test_decode_token_returns_correct_user_id_and_role():
    token = create_token(USER_ID, ROLE)
    payload = decode_token(token)
    assert payload["sub"] == USER_ID
    assert payload["role"] == ROLE


def test_decode_token_contains_iat_and_exp():
    token = create_token(USER_ID, ROLE)
    payload = decode_token(token)
    assert "iat" in payload
    assert "exp" in payload


def test_decode_token_raises_on_expired_token():
    """Mock time so the token is created in the past and already expired."""
    past = datetime.now(timezone.utc) - timedelta(hours=Config.JWT_EXPIRY_HOURS + 1)
    with patch("auth.jwt.datetime") as mock_dt:
        mock_dt.now.return_value = past
        mock_dt.side_effect = lambda *a, **kw: datetime(*a, **kw)
        mock_dt.timezone = timezone
        mock_dt.timedelta = timedelta
        token = create_token(USER_ID, ROLE)

    with pytest.raises(pyjwt.ExpiredSignatureError):
        decode_token(token)


def test_decode_token_raises_on_invalid_signature():
    token = create_token(USER_ID, ROLE)
    parts = token.split(".")
    tampered = f"{parts[0]}.{parts[1]}.invalidsignature"
    with pytest.raises(pyjwt.InvalidSignatureError):
        decode_token(tampered)


def test_decode_token_raises_on_malformed_token():
    with pytest.raises(pyjwt.PyJWTError):
        decode_token("not.a.token")


def test_create_refresh_token_returns_raw_and_hash():
    raw, h, expires_at = create_refresh_token()
    assert isinstance(raw, str) and len(raw) > 20
    assert hash_refresh_token(raw) == h
    assert expires_at > datetime.now(timezone.utc)
