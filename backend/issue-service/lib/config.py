import os


def _resolve_mongo_uri():
    return os.getenv("MONGODB_URI", "mongodb://mongodb:27017")


class Config:
    GRPC_PORT = int(os.getenv("GRPC_PORT", "50057"))
    SETUP_HTTP_PORT = int(os.getenv("SETUP_HTTP_PORT", "8087"))
    MONGODB_URI = _resolve_mongo_uri()
    RABBITMQ_URI = os.getenv("RABBITMQ_URI", "amqp://guest:guest@rabbitmq:5672")
    REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
    CLUSTER_EPS_KM = float(os.getenv("CLUSTER_EPS_KM", "7.0"))
    CLUSTER_MIN_PTS = int(os.getenv("CLUSTER_MIN_PTS", "3"))
