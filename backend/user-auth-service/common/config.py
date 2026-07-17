import os


class Config:
    GRPC_PORT = int(os.getenv("GRPC_PORT", "50051"))
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://ecoguard:ecoguard_dev@localhost:5432/ecoguard_user",
    )
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", "24"))
