import os


class Config:
    GRPC_PORT = int(os.environ.get("GRPC_PORT", 50055))
    NOMINATIM_USER_AGENT = os.environ.get("NOMINATIM_USER_AGENT", "EcoguardNLP/1.0")
    NOMINATIM_BASE_URL = os.environ.get(
        "NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org"
    )
    REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")
