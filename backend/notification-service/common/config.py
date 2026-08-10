import os


def _resolve_db_url():
    return os.environ.get(
        "DATABASE_URL",
        "postgresql://ecoguard:ecoguard_dev@localhost:5433/ecoguard_notif",
    )


class Config:
    GRPC_PORT = int(os.environ.get("GRPC_PORT", 50054))
    DATABASE_URL = _resolve_db_url()
    RABBITMQ_URI = os.environ.get(
        "RABBITMQ_URI", "amqp://guest:guest@localhost:5672"
    )
