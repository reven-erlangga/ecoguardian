import os


class Config:
    GRPC_PORT = int(os.environ.get("GRPC_PORT", 50054))
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "postgresql://ecoguard:ecoguard_dev@localhost:5433/ecoguard_notif",
    )
    RABBITMQ_URI = os.environ.get(
        "RABBITMQ_URI", "amqp://guest:guest@localhost:5672"
    )
