"""
Service: image classification entry point.
Preprocess image → run inference → map to label.
Supports single and multi-image classification with aggregation.
"""

import hashlib
import io
import os
import time
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

from .infer import ONNXInferenceEngine
from features.retrain import _safe_label

TRAINING_DATA_DIR = Path(os.getenv(
    "TRAINING_DATA_DIR",
    os.path.join(os.path.dirname(__file__), "..", "..", "training-data"),
))
SAVE_TRAINING_SAMPLES = os.getenv("SAVE_TRAINING_SAMPLES", "1") == "1"


class ClassificationService:
    """Business logic for image classification."""

    def __init__(self, engine: ONNXInferenceEngine, publisher=None):
        self.engine = engine
        self.publisher = publisher

    def classify(self, image_data: bytes, image_format: str, tweet_id: str = "") -> dict:
        """Classify a single image, return label + confidence + candidates."""
        input_tensor = self._preprocess(image_data)
        scores = self.engine.predict(input_tensor)

        candidates = self._build_candidates(scores)
        top_label = candidates[0]["label"]
        top_confidence = candidates[0]["confidence"]

        self._publish_event(tweet_id, top_label, top_confidence)
        self._save_training_sample(image_data, image_format, top_label)

        return {
            "label": top_label,
            "confidence": top_confidence,
            "candidates": candidates,
        }

    def classify_multiple(self, images: list, tweet_id: str = "") -> dict:
        """
        Classify multiple images, aggregate by majority vote.

        Returns:
        {
            "label": str,           # majority label
            "confidence": float,    # highest confidence among majority
            "candidates": [...],    # all candidates from final image
            "individual": [         # per-image breakdown
                {"index": 0, "label": "...", "confidence": 0.xx},
                ...
            ]
        }
        """
        if not images:
            return {"label": "unknown", "confidence": 0.0, "candidates": [], "individual": []}

        individuals = []
        all_labels = []

        for i, img in enumerate(images):
            input_tensor = self._preprocess(img["data"])
            scores = self.engine.predict(input_tensor)
            candidates = self._build_candidates(scores)
            top = candidates[0]

            individuals.append({
                "index": i,
                "label": top["label"],
                "confidence": top["confidence"],
            })
            all_labels.append(top["label"])

        # Majority vote
        vote_count = Counter(all_labels)
        max_votes = vote_count.most_common(1)[0][1]
        tied = [lbl for lbl, cnt in vote_count.items() if cnt == max_votes]

        if len(tied) == 1:
            final_label = tied[0]
        else:
            # Tie-break: pick label with highest individual confidence
            best = max(
                (ind for ind in individuals if ind["label"] in tied),
                key=lambda x: x["confidence"],
            )
            final_label = best["label"]

        # ponytail: confidence = max confidence among winning-label predictions
        final_confidence = max(
            ind["confidence"] for ind in individuals if ind["label"] == final_label
        )

        # Re-classify the last image for candidates list.
        # tweet_id kosong → event tidak di-publish dua kali (event mayoritas
        # sudah dipublish di atas), tapi training sample tetap tersimpan.
        last = self.classify(images[-1]["data"], images[-1].get("format", "jpeg"), tweet_id="")
        self._publish_event(tweet_id, final_label, final_confidence)

        return {
            "label": final_label,
            "confidence": final_confidence,
            "candidates": last["candidates"],
            "individual": individuals,
        }

    def _save_training_sample(self, image_data: bytes, image_format: str, label: str):
        """Simpan gambar masuk ke training-data/<label>/ utk retrain (auto-accumulate)."""
        if not SAVE_TRAINING_SAMPLES:
            return
        try:
            label_dir = TRAINING_DATA_DIR / _safe_label(label or "unknown")
            label_dir.mkdir(parents=True, exist_ok=True)
            ext = (image_format or "jpg").lower()
            if ext not in ("jpg", "jpeg", "png", "webp"):
                ext = "jpg"
            digest = hashlib.md5(image_data).hexdigest()[:12]
            path = label_dir / f"{int(time.time())}_{digest}.{ext}"
            if not path.exists():
                path.write_bytes(image_data)
        except Exception as exc:
            print(f"⚠️  Gagal simpan training sample: {exc}")

    def _build_candidates(self, scores: list) -> list:
        candidates = [
            {"label": label, "confidence": round(float(score), 4)}
            for label, score in zip(self.engine.labels, scores)
        ]
        candidates.sort(key=lambda x: x["confidence"], reverse=True)
        return candidates

    def _publish_event(self, tweet_id: str, label: str, confidence: float):
        if self.publisher and tweet_id:
            self.publisher.publish_classification_completed(
                tweet_id=tweet_id,
                label=label,
                confidence=confidence,
            )

    def _preprocess(self, image_data: bytes) -> np.ndarray:
        """Convert raw bytes to normalized tensor [1,3,224,224] (NCHW)."""
        img = Image.open(io.BytesIO(image_data))
        img = img.convert("RGB")
        img = img.resize((224, 224))

        arr = np.array(img, dtype=np.float32) / 255.0  # [224,224,3]

        # ponytail: normalize pakai mean/std ImageNet
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        arr = (arr - mean) / std

        arr = np.expand_dims(arr, axis=0).astype(np.float32)  # [1,224,224,3]
        return arr.transpose((0, 3, 1, 2)).astype(np.float32)  # [1,3,224,224]
