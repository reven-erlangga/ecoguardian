"""
Unit tests for ClassificationService — focuses on classify_multiple (majority vote).
"""

import io
import sys
from pathlib import Path
from typing import Any

import numpy as np
import pytest
from PIL import Image

_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

from features.classifier.service import ClassificationService


def _dummy_image_bytes(format: str = "JPEG") -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (300, 200), color=(128, 128, 128)).save(buf, format=format)
    return buf.getvalue()


class PredictableEngine:
    """Returns preset scores in sequence (for multi-image testing)."""

    def __init__(self, labels: list[str] | None = None, score_sequence: list[list[float]] | None = None):
        self.labels = labels or ["fallen_tree", "garbage", "vandalism"]
        self._seq = score_sequence or [[0.7, 0.2, 0.1]]
        self._call_count = 0

    def predict(self, _input_tensor: Any) -> list[float]:
        scores = self._seq[self._call_count % len(self._seq)]
        self._call_count += 1
        return scores


class TestClassifyMultiple:

    def test_single_image_falls_back_to_classify(self):
        engine = PredictableEngine()
        svc = ClassificationService(engine)
        images = [{"data": _dummy_image_bytes(), "format": "jpeg"}]
        result = svc.classify_multiple(images)
        assert result["label"] == "fallen_tree"
        assert result["confidence"] == 0.7

    def test_all_same_label_wins(self):
        engine = PredictableEngine(score_sequence=[
            [0.7, 0.2, 0.1],   # → fallen_tree
            [0.8, 0.1, 0.1],   # → fallen_tree
            [0.6, 0.3, 0.1],   # → fallen_tree
        ])
        svc = ClassificationService(engine)
        images = [{"data": _dummy_image_bytes(), "format": "jpeg"} for _ in range(3)]
        result = svc.classify_multiple(images)
        assert result["label"] == "fallen_tree"
        assert result["confidence"] == 0.8  # highest among winners

    def test_majority_vote_wins(self):
        """2 flood, 1 garbage → flood."""
        engine = PredictableEngine(labels=["flood", "garbage", "road_damage"], score_sequence=[
            [0.9, 0.05, 0.05],  # → flood
            [0.1, 0.85, 0.05],  # → garbage
            [0.8, 0.1, 0.1],    # → flood
        ])
        svc = ClassificationService(engine)
        images = [{"data": _dummy_image_bytes(), "format": "jpeg"} for _ in range(3)]
        result = svc.classify_multiple(images)
        assert result["label"] == "flood"
        assert result["confidence"] == 0.9

    def test_tie_goes_to_highest_confidence(self):
        """Tie 1-1, highest confidence wins."""
        engine = PredictableEngine(score_sequence=[
            [0.6, 0.3, 0.1],   # → fallen_tree
            [0.2, 0.7, 0.1],   # → garbage
        ])
        svc = ClassificationService(engine)
        images = [{"data": _dummy_image_bytes(), "format": "jpeg"} for _ in range(2)]
        result = svc.classify_multiple(images)
        assert result["label"] == "garbage"
        assert result["confidence"] == 0.7

    def test_individual_results_breakdown(self):
        engine = PredictableEngine(score_sequence=[
            [0.9, 0.05, 0.05],
            [0.1, 0.85, 0.05],
        ])
        svc = ClassificationService(engine)
        images = [{"data": _dummy_image_bytes(), "format": "jpeg"} for _ in range(2)]
        result = svc.classify_multiple(images)
        assert len(result["individual"]) == 2
        assert result["individual"][0]["label"] == "fallen_tree"
        assert result["individual"][1]["label"] == "garbage"
        assert result["individual"][0]["index"] == 0
        assert result["individual"][1]["index"] == 1

    def test_empty_images_returns_unknown(self):
        engine = PredictableEngine()
        svc = ClassificationService(engine)
        result = svc.classify_multiple([])
        assert result["label"] == "unknown"
        assert result["confidence"] == 0.0
        assert result["individual"] == []

    def test_preserves_original_classify_for_single(self):
        """classify_multiple should match classify() output for single image."""
        engine = PredictableEngine()
        svc = ClassificationService(engine)
        single = svc.classify(_dummy_image_bytes(), "jpeg")
        multi = svc.classify_multiple([{"data": _dummy_image_bytes(), "format": "jpeg"}])
        assert single["label"] == multi["label"]
        assert single["confidence"] == multi["confidence"]
