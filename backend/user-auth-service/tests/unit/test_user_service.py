"""
Unit tests for user service layer (count_users, create_user, get_user)
with mocked repository.
"""

import sys
from pathlib import Path

import pytest

# ── Ensure package root is on sys.path ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent.parent  # user-auth-service/
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

import user.service as user_svc  # noqa: E402

EMAIL = "test@ecoguard.dev"
USERNAME = "testuser"
PASSWORD_HASH = "hashed-fake"
USER_ID = "user-uuid-123"
USER_DICT = {"id": USER_ID, "email": EMAIL, "username": USERNAME, "role": "user"}


# ── count_users ──────────────────────────────────────────────


def test_count_users_returns_zero(mocker):
    """count_users returns 0 when the DB is empty."""
    mocker.patch("user.service.repository.count_users", return_value=0)
    assert user_svc.count_users() == 0


def test_count_users_returns_positive_number(mocker):
    """count_users returns the exact count from repository."""
    mocker.patch("user.service.repository.count_users", return_value=5)
    assert user_svc.count_users() == 5


def test_count_users_delegates_to_repository(mocker):
    """count_users must call repository.count_users exactly once."""
    mock = mocker.patch("user.service.repository.count_users", return_value=3)
    user_svc.count_users()
    mock.assert_called_once_with()


# ── create_user ──────────────────────────────────────────────


def test_create_user_delegates_and_returns(mocker):
    """create_user calls repository and returns the user dict."""
    mock = mocker.patch("user.service.repository.create_user", return_value=USER_DICT)
    result = user_svc.create_user(EMAIL, USERNAME, PASSWORD_HASH)
    mock.assert_called_once_with(EMAIL, USERNAME, PASSWORD_HASH)
    assert result == USER_DICT


# ── get_user ─────────────────────────────────────────────────


def test_get_user_returns_user_when_found(mocker):
    """get_user returns the user dict when the user exists."""
    mocker.patch("user.service.repository.get_user", return_value=USER_DICT)
    assert user_svc.get_user(USER_ID) == USER_DICT


def test_get_user_returns_none_when_missing(mocker):
    """get_user returns None when repository returns None."""
    mocker.patch("user.service.repository.get_user", return_value=None)
    assert user_svc.get_user("nonexistent") is None


# ── get_user_by_email ────────────────────────────────────────


def test_get_user_by_email_found(mocker):
    """get_user_by_email returns user when email exists."""
    mocker.patch("user.service.repository.get_user_by_email", return_value=USER_DICT)
    assert user_svc.get_user_by_email(EMAIL) == USER_DICT


def test_get_user_by_email_not_found(mocker):
    """get_user_by_email returns None when email does not exist."""
    mocker.patch("user.service.repository.get_user_by_email", return_value=None)
    assert user_svc.get_user_by_email("unknown@ecoguard.dev") is None
