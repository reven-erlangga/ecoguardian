import os

from .vault import read_secret


def _resolve_db_url():
    val = os.environ.get("DATABASE_URL")
    if val:
        return val
    vault = read_secret("ecoguard/db", "postgres-notif-dsn")
    if vault:
        return vault
    return "postgresql://ecoguard:ecoguard_dev@localhost:5433/ecoguard_notif"


class Config:
    GRPC_PORT = int(os.environ.get("GRPC_PORT", 50054))
    DATABASE_URL = _resolve_db_url()
    RABBITMQ_URI = os.environ.get(
        "RABBITMQ_URI", "amqp://guest:guest@localhost:5672"
    )
