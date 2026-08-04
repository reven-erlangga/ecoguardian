# User & Auth Service

User CRUD, registration, login, JWT management.

- **Python** (Flask + grpcio)
- **PostgreSQL** via pgBouncer
- **bcrypt** — password hashing
- **PyJWT** — token generation

**Port**: `50051` (gRPC)

**Protos**: `UserService` (Register, Login, GetUser, UpdateUser) + `AuthService` (ValidateToken, RefreshToken, Logout)

**Key code**:

```python
# password.py
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

# jwt.py
def create_access_token(user_id: str, secret: str):
    return jwt.encode({"sub": user_id, "exp": ...}, secret, algorithm="HS256")
```

## Tests

| File | Coverage |
|------|----------|
| `tests/unit/test_auth_service.py` | Login, register, token validation |
| `tests/unit/test_jwt.py` | Token create, decode, expiry |
| `tests/unit/test_password.py` | Hash, verify |
| `tests/unit/test_user_service.py` | CRUD, get user, update profile |
