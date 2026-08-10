import os


def _resolve_jwt_secret() -> str:
    """Chain: env var → local fallback."""
    return os.getenv("JWT_SECRET") or "ecoguard-local-dev-fallback-32chars!!!"


class Config:
    GRPC_PORT = int(os.getenv("GRPC_PORT", "50051"))
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://ecoguard:ecoguard_dev@localhost:5432/ecoguard_user",
    )
    JWT_SECRET = _resolve_jwt_secret()
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "1"))
    REFRESH_TOKEN_EXPIRY_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRY_DAYS", "7"))
