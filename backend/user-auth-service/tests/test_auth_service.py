"""
Unit tests for auth service (with mocked dependencies)
"""

import sys
from pathlib import Path

import pytest

# ── Ensure package root is on sys.path ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))


@pytest.fixture(autouse=True)
def _mock_deps(mocker):
    """Mock all external auth-service dependencies before each test."""
    mocker.patch("auth.service.repository")
    mocker.patch("auth.service.user_service")
    mocker.patch("auth.service.hash_password", return_value="hashed-fake")
    mocker.patch("auth.service.verify_password")
    mocker.patch("auth.service.create_token", return_value="jwt-token-fake")
    mocker.patch("auth.service.decode_token")


# Import *after* patching so the module-level imports grab the mocks.
import auth.service as auth_svc  # noqa: E402

EMAIL = "test@ecoguard.dev"
USERNAME = "testuser"
PASSWORD = "secret123"
USER_ID = "user-uuid-123"
USER_DICT = {"id": USER_ID, "email": EMAIL, "username": USERNAME, "role": "user"}


# ── register ──────────────────────────────────────────────────


def test_register_creates_user_and_returns_token(mocker):
    auth_svc.repository.get_user_by_email.return_value = None
    auth_svc.user_service.create_user.return_value = USER_DICT

    result = auth_svc.register(EMAIL, USERNAME, PASSWORD)

    auth_svc.repository.get_user_by_email.assert_called_once_with(EMAIL)
    auth_svc.user_service.create_user.assert_called_once_with(
        EMAIL, USERNAME, "hashed-fake"
    )
    auth_svc.create_token.assert_called_once_with(USER_ID, "user")
    assert result["user"] == USER_DICT
    assert result["token"] == "jwt-token-fake"


def test_register_raises_on_duplicate_email(mocker):
    auth_svc.repository.get_user_by_email.return_value = USER_DICT

    with pytest.raises(ValueError, match="Email already registered"):
        auth_svc.register(EMAIL, USERNAME, PASSWORD)

    auth_svc.user_service.create_user.assert_not_called()


# ── login ─────────────────────────────────────────────────────


def test_login_with_correct_password_returns_token(mocker):
    auth_svc.repository.get_user_by_email.return_value = {
        **USER_DICT,
        "password_hash": "hashed-fake",
    }
    auth_svc.verify_password.return_value = True

    result = auth_svc.login(EMAIL, PASSWORD)

    auth_svc.repository.get_user_by_email.assert_called_with(EMAIL)
    auth_svc.verify_password.assert_called_once_with(PASSWORD, "hashed-fake")
    auth_svc.create_token.assert_called_with(USER_ID, "user")
    assert result["token"] == "jwt-token-fake"


def test_login_raises_on_wrong_password(mocker):
    auth_svc.repository.get_user_by_email.return_value = {
        **USER_DICT,
        "password_hash": "hashed-fake",
    }
    auth_svc.verify_password.return_value = False

    with pytest.raises(ValueError, match="Invalid email or password"):
        auth_svc.login(EMAIL, PASSWORD)


def test_login_raises_on_nonexistent_email(mocker):
    auth_svc.repository.get_user_by_email.return_value = None

    with pytest.raises(ValueError, match="Invalid email or password"):
        auth_svc.login(EMAIL, PASSWORD)


# ── validate_token ────────────────────────────────────────────


def test_validate_token_with_valid_token_returns_user_id_and_role(mocker):
    auth_svc.decode_token.return_value = {"sub": USER_ID, "role": "admin"}

    result = auth_svc.validate_token("some-valid-token")

    assert result == {"user_id": USER_ID, "role": "admin"}


def test_validate_token_passes_token_to_decode_token(mocker):
    auth_svc.decode_token.return_value = {"sub": USER_ID, "role": "user"}

    auth_svc.validate_token("token-xyz")
    auth_svc.decode_token.assert_called_once_with("token-xyz")
