import os


class Config:
    """Environment-based config untuk classification service."""

    # gRPC
    GRPC_PORT = int(os.getenv("GRPC_PORT", "50053"))

    # Flask health
    FLASK_PORT = int(os.getenv("FLASK_PORT", "8083"))

    # Model
    MODEL_PATH = os.getenv(
        "MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "..", "models", "model.onnx"),
    )
    LABELS_PATH = os.getenv(
        "LABELS_PATH",
        os.path.join(
            os.path.dirname(__file__), "..", "features", "classifier", "labels.json"
        ),
    )

    # RabbitMQ (optional — untuk publish event hasil klasifikasi)
    RABBITMQ_URI = os.getenv("RABBITMQ_URI", "amqp://guest:guest@localhost:5672")
