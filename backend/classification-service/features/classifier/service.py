"""
Service: image classification entry point.
Preprocess image → run inference → map to label.
"""

import io

import numpy as np
from PIL import Image

from .infer import ONNXInferenceEngine


class ClassificationService:
    """Business logic for image classification."""

    def __init__(self, engine: ONNXInferenceEngine, publisher=None):
        self.engine = engine
        self.publisher = publisher

    def classify(self, image_data: bytes, image_format: str, tweet_id: str = "") -> dict:
        """Classify a single image, return label + confidence + candidates."""
        input_tensor = self._preprocess(image_data, image_format)
        scores = self.engine.predict(input_tensor)

        candidates = [
            {"label": label, "confidence": round(float(score), 4)}
            for label, score in zip(self.engine.labels, scores)
        ]
        candidates.sort(key=lambda x: x["confidence"], reverse=True)

        top_label = candidates[0]["label"]
        top_confidence = candidates[0]["confidence"]

        # Publish event (best-effort)
        if self.publisher and tweet_id:
            self.publisher.publish_classification_completed(
                tweet_id=tweet_id,
                label=top_label,
                confidence=top_confidence,
            )

        return {
            "label": top_label,
            "confidence": top_confidence,
            "candidates": candidates,
        }

    def _preprocess(self, image_data: bytes, image_format: str) -> np.ndarray:
        """Convert raw bytes to normalized tensor [1,224,224,3] (NHWC)."""
        img = Image.open(io.BytesIO(image_data))
        img = img.convert("RGB")
        img = img.resize((224, 224))

        arr = np.array(img, dtype=np.float32) / 255.0  # [224,224,3]

        # ponytail: normalize pakai mean/std ImageNet
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        arr = (arr - mean) / std  # broadcasting: [224,224,3] - [3]

        arr = np.expand_dims(arr, axis=0).astype(np.float32)  # [1,224,224,3]
        # ponytail: ONNX model dari PyTorch pake NCHW, transpose NHWC → NCHW
        return arr.transpose((0, 3, 1, 2)).astype(np.float32)  # [1,3,224,224]
