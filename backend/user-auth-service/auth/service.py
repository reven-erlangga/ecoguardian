"""
Auth service — login/register with refresh-token rotation, logout.
"""

from auth.jwt import create_token, decode_token, create_refresh_token, hash_refresh_token
from auth.password import hash_password, verify_password
from user import repository, service as user_service


def register(email: str, username: str, password: str) -> dict:
    existing = repository.get_user_by_email(email)
    if existing:
        raise ValueError("Email already registered")

    pwd_hash = hash_password(password)
    user = user_service.create_user(email, username, pwd_hash)

    access_token = create_token(user["id"], user["role"])
    raw_rt, rt_hash, rt_exp = create_refresh_token()
    repository.store_refresh_token(user["id"], rt_hash, rt_exp)

    return {"user": user, "token": access_token, "refresh_token": raw_rt}


def login(email: str, password: str) -> dict:
    user = repository.get_user_by_email(email)
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid email or password")

    user_data = {k: v for k, v in user.items() if k != "password_hash"}
    access_token = create_token(user["id"], user["role"])
    raw_rt, rt_hash, rt_exp = create_refresh_token()
    repository.store_refresh_token(user["id"], rt_hash, rt_exp)

    return {"user": user_data, "token": access_token, "refresh_token": raw_rt}


def validate_token(token: str) -> dict:
    payload = decode_token(token)
    user = repository.get_user(payload["sub"])
    if not user:
        raise ValueError("User not found")
    return {
        "user_id": payload["sub"],
        "role": payload["role"],
        "email": user["email"],
        "username": user["username"],
    }


def refresh_token(refresh_token: str) -> dict:
    """Rotate refresh token: revoke old, issue new pair."""
    rt_hash = hash_refresh_token(refresh_token)
    row = repository.get_valid_refresh_token(rt_hash)
    if not row:
        raise ValueError("Invalid or expired refresh token")

    # Rotasi: revoke old
    repository.revoke_refresh_token(row["id"])

    # Load user
    user = repository.get_user(row["user_id"])
    if not user:
        raise ValueError("User not found")

    access_token = create_token(user["id"], user["role"])
    raw_rt, new_rt_hash, rt_exp = create_refresh_token()
    repository.store_refresh_token(user["id"], new_rt_hash, rt_exp)

    return {"token": access_token, "refresh_token": raw_rt}


def logout(refresh_token: str) -> None:
    rt_hash = hash_refresh_token(refresh_token)
    repository.revoke_refresh_token_by_hash(rt_hash)
