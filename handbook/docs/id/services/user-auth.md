# User & Auth Service

Mengelola **user CRUD**, **registrasi**, **login**, **JWT token**, dan **validasi token**.

## Tech Stack

- **Python** (Flask + grpcio)
- **PostgreSQL** — database user
- **bcrypt** — password hashing
- **PyJWT** — token generation & validation

## Lokasi Kode

```
backend/user-auth-service/
├── user/                  # Feature: user management
│   ├── models.py
│   ├── repository.py
│   └── service.py
├── auth/                  # Feature: authentication
│   ├── jwt.py
│   ├── password.py
│   └── service.py
├── common/
│   ├── config.py
│   ├── db.py              # pgBouncer pool
│   └── grpc_server.py
├── proto/                 # Generated proto stubs
├── server.py              # Entry point
├── requirements.txt
└── Dockerfile
```

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50051 | gRPC | `UserService` + `AuthService` RPC |

## Proto Contract

```protobuf
service UserService {
  rpc Register(RegisterRequest) returns (RegisterResponse);
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc GetUserCount(Empty) returns (UserCountResponse);
}

service AuthService {
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
  rpc Logout(LogoutRequest) returns (Empty);
}
```

## Key: Password Hashing

```python
# auth/password.py
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())
```

## Key: JWT

```python
# auth/jwt.py
import jwt

def create_access_token(user_id: str, secret: str, expires: int = 3600):
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(seconds=expires),
    }
    return jwt.encode(payload, secret, algorithm="HS256")
```

Gateway men-validate JWT dengan memanggil `AuthService.ValidateToken` via gRPC.

## Database

PostgreSQL dengan **pgBouncer** pool:

```python
# common/db.py
import psycopg2
from psycopg2 import pool

connection_pool = pool.ThreadedConnectionPool(
    minconn=2, maxconn=20,
    dsn="postgresql://ecoguard:ecoguard_dev@pgbouncer:6432/ecoguard_user"
)
```

## Cara Running

```bash
cd infra
docker compose up user-auth-service -d
```

Atau development:

```bash
cd backend/user-auth-service
pip install -r requirements.txt
python server.py
```
