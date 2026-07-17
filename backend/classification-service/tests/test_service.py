"""
Unit tests for ClassificationService
"""

import io
import sys
from pathlib import Path
from typing import Any

import numpy as np
import pytest
from PIL import Image

# ── Ensure package root is on sys.path ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

from features.classifier.service import ClassificationService


# ── Helpers ───────────────────────────────────────────────────


def _dummy_image_bytes(format: str = "JPEG") -> bytes:
    """Return a small solid-colour image as bytes."""
    buf = io.BytesIO()
    Image.new("RGB", (300, 200), color=(128, 128, 128)).save(buf, format=format)
    return buf.getvalue()


class DummyEngine:
    """A mock inference engine with deterministic output."""

    def __init__(self, labels: list[str] | None = None):
        self.labels = labels or ["fallen_tree", "garbage", "vandalism"]

    def predict(self, _input_tensor: Any) -> list[float]:
        return [0.7, 0.2, 0.1]


# ── _preprocess ───────────────────────────────────────────────


def test_preprocess_returns_nchw_shape():
    engine = DummyEngine()
    svc = ClassificationService(engine)  # type: ignore[arg-type]
    result = svc._preprocess(_dummy_image_bytes(), "jpeg")
    assert result.shape == (1, 3, 224, 224), f"Expected NCHW, got {result.shape}"


def test_preprocess_returns_float32():
    engine = DummyEngine()
    svc = ClassificationService(engine)  # type: ignore[arg-type]
    result = svc._preprocess(_dummy_image_bytes(), "jpeg")
    assert result.dtype == np.float32


# ── classify ──────────────────────────────────────────────────


def test_classify_returns_expected_keys():
    engine = DummyEngine()
    svc = ClassificationService(engine)  # type: ignore[arg-type]
    result = svc.classify(_dummy_image_bytes(), "jpeg")
    assert isinstance(result, dict)
    assert "label" in result
    assert "confidence" in result
    assert "candidates" in result


def test_classify_sorts_candidates_by_confidence_descending():
    engine = DummyEngine()
    svc = ClassificationService(engine)  # type: ignore[arg-type]
    result = svc.classify(_dummy_image_bytes(), "jpeg")
    confidences = [c["confidence"] for c in result["candidates"]]
    assert confidences == sorted(confidences, reverse=True)


def test_classify_top_candidate_matches_label():
    engine = DummyEngine()
    svc = ClassificationService(engine)  # type: ignore[arg-type]
    result = svc.classify(_dummy_image_bytes(), "jpeg")
    assert result["label"] == result["candidates"][0]["label"]
    assert result["confidence"] == result["candidates"][0]["confidence"]


def test_classify_label_is_string():
    engine = DummyEngine()
    svc = ClassificationService(engine)  # type: ignore[arg-type]
    result = svc.classify(_dummy_image_bytes(), "jpeg")
    assert isinstance(result["label"], str)


def test_classify_confidence_is_float():
    engine = DummyEngine()
    svc = ClassificationService(engine)  # type: ignore[arg-type]
    result = svc.classify(_dummy_image_bytes(), "jpeg")
    assert isinstance(result["confidence"], float)
