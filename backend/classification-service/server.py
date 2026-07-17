"""
Classification Service — gRPC + HTTP (REST classify)
"""

import os
import sys
import threading
from concurrent import futures

import grpc
from flask import Flask, jsonify, request

# ponytail: append protogen agar common/ real ditemukan duluan
_proto = os.path.join(os.path.dirname(__file__), "protogen")
sys.path.insert(0, _proto)

from classification import classification_pb2, service_pb2, service_pb2_grpc
from common.config import Config
from features.classifier import ClassificationService, ONNXInferenceEngine
from rabbitmq import EventPublisher

# ─── Init Engine ──────────────────────────────────────────
cfg = Config()
engine = ONNXInferenceEngine(model_path=cfg.MODEL_PATH, labels_path=cfg.LABELS_PATH)
# Init RabbitMQ publisher (best-effort)
publisher = EventPublisher(rabbitmq_uri=cfg.RABBITMQ_URI)
svc = ClassificationService(engine, publisher=publisher)


# ─── gRPC Servicer ────────────────────────────────────────
class GrpcServicer(service_pb2_grpc.ClassificationServiceServicer):
    def ClassifyImage(self, request, context):
        result = svc.classify(
            request.image_data,
            request.image_format,
            tweet_id=getattr(request, "tweet_id", ""),
        )
        return classification_pb2.ClassifyImageResponse(
            result=classification_pb2.ClassificationResult(
                label=result["label"], confidence=result["confidence"]
            )
        )


# ─── Flask App ────────────────────────────────────────────
app = Flask(__name__)


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "classification"})


@app.route("/classify", methods=["POST"])
def classify_http():
    if "image" not in request.files:
        return jsonify({"error": "no image file"}), 400
    file = request.files["image"]
    result = svc.classify(
        file.read(),
        file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpeg",
    )
    return jsonify(result)


# ─── Start Servers ────────────────────────────────────────
if __name__ == "__main__":
    print(f"📋 Labels ({len(engine.labels)}): {engine.labels}")

    gserver = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_ClassificationServiceServicer_to_server(
        GrpcServicer(), gserver
    )
    gserver.add_insecure_port(f"0.0.0.0:{cfg.GRPC_PORT}")
    gserver.start()
    print(f"✅ gRPC on port {cfg.GRPC_PORT}")

    t = threading.Thread(
        target=lambda: app.run(host="0.0.0.0", port=cfg.FLASK_PORT, debug=False),
        daemon=True,
    )
    t.start()
    print(f"✅ HTTP on port {cfg.FLASK_PORT}")
    print(f"🚀 Model: {cfg.MODEL_PATH}")

    gserver.wait_for_termination()
