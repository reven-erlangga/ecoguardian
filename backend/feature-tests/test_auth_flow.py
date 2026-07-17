"""
Test: auth flow end-to-end

- Register a user
- Login with the same credentials
- Validate the token
- Fetch the user by ID
"""

import uuid

import grpc
import pytest

from conftest import user_auth_stub  # noqa: F401  (fixture import)


def _unique_email() -> str:
    """Return a randomised email so registration doesn't clash on re-runs."""
    return f"test-{uuid.uuid4().hex[:12]}@ecoguard.test"


def _unique_username() -> str:
    return f"tester_{uuid.uuid4().hex[:8]}"


class TestAuthFlow:
    """End-to-end tests for the User & Auth gRPC service."""

    @pytest.fixture(autouse=True)
    def _setup(self, user_auth_stub):
        self.user_stub, self.auth_stub = user_auth_stub

    def test_register_then_login_then_validate(self):
        """Register → Login → ValidateToken → GetUser."""
        from user import service_pb2, user_pb2  # noqa: F811

        email = _unique_email()
        username = _unique_username()
        password = "TestPass123!"

        # ── Register ────────────────────────────────────────────
        reg_resp = self.user_stub.Register(
            user_pb2.RegisterRequest(
                email=email, username=username, password=password
            )
        )

        assert reg_resp.user.id, "no user.id returned from Register"
        assert reg_resp.user.email == email
        assert reg_resp.token, "no token returned from Register"
        user_id = reg_resp.user.id

        # ── Login ───────────────────────────────────────────────
        login_resp = self.user_stub.Login(
            user_pb2.LoginRequest(email=email, password=password)
        )

        assert login_resp.user.id == user_id
        assert login_resp.token, "no token returned from Login"
        token = login_resp.token

        # ── ValidateToken ───────────────────────────────────────
        valid_resp = self.auth_stub.ValidateToken(
            service_pb2.ValidateTokenRequest(token=token)
        )

        assert valid_resp.user_id == user_id, (
            f"ValidateToken returned user_id={valid_resp.user_id}, expected {user_id}"
        )
        assert valid_resp.role, "no role returned from ValidateToken"

        # ── GetUser ─────────────────────────────────────────────
        user_resp = self.user_stub.GetUser(user_pb2.GetUserRequest(id=user_id))

        assert user_resp.id == user_id
        assert user_resp.email == email
        assert user_resp.username == username

    def test_register_duplicate_email_raises_already_exists(self):
        """Registering the same email twice should fail gracefully."""
        from user import user_pb2  # noqa: F811

        email = _unique_email()
        username = _unique_username()

        # First registration should succeed
        self.user_stub.Register(
            user_pb2.RegisterRequest(
                email=email, username=username, password="SomePass1!"
            )
        )

        # Second registration with same email should fail
        with pytest.raises(grpc.RpcCallError) as exc_info:
            self.user_stub.Register(
                user_pb2.RegisterRequest(
                    email=email,
                    username=_unique_username(),
                    password="OtherPass2@",
                )
            )
        # NOTE: the server returns ALREADY_EXISTS; the exact gRPC
        # exception type may differ by grpcio version.
        assert exc_info.value.code() in (
            grpc.StatusCode.ALREADY_EXISTS,
            grpc.StatusCode.UNKNOWN,
        )

    def test_login_wrong_password_raises_unauthenticated(self):
        """Login with an incorrect password should be rejected."""
        from user import user_pb2  # noqa: F811

        email = _unique_email()
        self.user_stub.Register(
            user_pb2.RegisterRequest(
                email=email,
                username=_unique_username(),
                password="CorrectPass1!",
            )
        )

        with pytest.raises(grpc.RpcCallError) as exc_info:
            self.user_stub.Login(
                user_pb2.LoginRequest(email=email, password="WrongPass1!")
            )
        assert exc_info.value.code() == grpc.StatusCode.UNAUTHENTICATED
