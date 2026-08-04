"""
Unit tests for auth service (with mocked dependencies)
"""

import sys
from pathlib import Path

import pytest

# ── Ensure package root is on sys.path ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))


@pytest.fixture(autouse=True)
def _mock_deps(mocker):
    """Mock all external auth-service dependencies before each test."""
    mocker.patch("auth.service.repository")
    mocker.patch("auth.service.user_service")
    mocker.patch("auth.service.hash_password", return_value="hashed-fake")
    mocker.patch("auth.service.verify_password")
    mocker.patch("auth.service.create_token", return_value="jwt-access-token")
    mocker.patch("auth.service.create_refresh_token", return_value=("raw-rt", "hash-rt", "2025-01-01"))
    mocker.patch("auth.service.hash_refresh_token", return_value="hash-rt")
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
    auth_svc.repository.store_refresh_token.assert_called_once()
    assert result["user"] == USER_DICT
    assert result["token"] == "jwt-access-token"
    assert result["refresh_token"] == "raw-rt"


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
    auth_svc.repository.store_refresh_token.assert_called_once()
    assert result["token"] == "jwt-access-token"
    assert result["refresh_token"] == "raw-rt"


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


def test_validate_token_with_valid_token_returns_user_details(mocker):
    auth_svc.decode_token.return_value = {"sub": USER_ID, "role": "admin"}
    auth_svc.repository.get_user.return_value = {
        "id": USER_ID, "email": EMAIL, "username": USERNAME, "role": "admin"
    }

    result = auth_svc.validate_token("some-valid-token")

    assert result == {
        "user_id": USER_ID,
        "role": "admin",
        "email": EMAIL,
        "username": USERNAME,
    }


def test_validate_token_raises_when_user_deleted(mocker):
    auth_svc.decode_token.return_value = {"sub": USER_ID, "role": "user"}
    auth_svc.repository.get_user.return_value = None

    with pytest.raises(ValueError, match="User not found"):
        auth_svc.validate_token("token-for-deleted-user")


# ── refresh_token (rotation) ──────────────────────────────────


def test_refresh_token_revokes_old_and_issues_new_pair(mocker):
    fake_row = {"id": "tok-uuid", "user_id": USER_ID}
    auth_svc.repository.get_valid_refresh_token.return_value = fake_row
    auth_svc.repository.get_user.return_value = USER_DICT

    result = auth_svc.refresh_token("some-raw-rt")

    auth_svc.repository.revoke_refresh_token.assert_called_once_with("tok-uuid")
    auth_svc.repository.store_refresh_token.assert_called_once()
    assert result["token"] == "jwt-access-token"
    assert result["refresh_token"] == "raw-rt"


def test_refresh_token_raises_on_invalid_token(mocker):
    auth_svc.repository.get_valid_refresh_token.return_value = None

    with pytest.raises(ValueError, match="Invalid or expired refresh token"):
        auth_svc.refresh_token("bad-token")

    auth_svc.repository.revoke_refresh_token.assert_not_called()


def test_refresh_token_raises_when_user_gone(mocker):
    fake_row = {"id": "tok-uuid", "user_id": USER_ID}
    auth_svc.repository.get_valid_refresh_token.return_value = fake_row
    auth_svc.repository.get_user.return_value = None

    with pytest.raises(ValueError, match="User not found"):
        auth_svc.refresh_token("orphan-rt")

    # Old token tetap di-revoke meskipun user hilang — security
    auth_svc.repository.revoke_refresh_token.assert_called_once_with("tok-uuid")


# ── logout ────────────────────────────────────────────────────


def test_logout_revokes_refresh_token(mocker):
    auth_svc.logout("some-raw-rt")

    auth_svc.repository.revoke_refresh_token_by_hash.assert_called_once_with("hash-rt")
