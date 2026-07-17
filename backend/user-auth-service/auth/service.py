from auth.jwt import create_token, decode_token
from auth.password import hash_password, verify_password
from user import repository, service as user_service


def register(email: str, username: str, password: str) -> dict:
    existing = repository.get_user_by_email(email)
    if existing:
        raise ValueError("Email already registered")

    pwd_hash = hash_password(password)
    user = user_service.create_user(email, username, pwd_hash)
    token = create_token(user["id"], user["role"])
    return {"user": user, "token": token}


def login(email: str, password: str) -> dict:
    user = repository.get_user_by_email(email)
    if not user:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid email or password")

    token = create_token(user["id"], user["role"])
    return {
        "user": {k: v for k, v in user.items() if k != "password_hash"},
        "token": token,
    }


def validate_token(token: str) -> dict:
    payload = decode_token(token)
    return {"user_id": payload["sub"], "role": payload["role"]}


def refresh_token(token: str) -> dict:
    payload = decode_token(token)
    new_token = create_token(payload["sub"], payload["role"])
    return {"token": new_token}
