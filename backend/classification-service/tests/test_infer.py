"""
Unit tests for ONNXInferenceEngine (with mock fallback)
"""

import json
import sys
from pathlib import Path

import numpy as np
import pytest

# ── Ensure package root is on sys.path so `features` is importable ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))

from features.classifier.infer import ONNXInferenceEngine


@pytest.fixture
def labels_file(tmp_path: Path) -> Path:
    """Write a temporary labels.json and return its path."""
    labels = ["fallen_tree", "garbage", "vandalism"]
    fp = tmp_path / "labels.json"
    fp.write_text(json.dumps(labels))
    return fp


@pytest.fixture
def engine(labels_file: Path) -> ONNXInferenceEngine:
    """Return an engine pointing at a non-existent model file (triggers mock)."""
    model_path = labels_file.parent / "model.onnx"  # does not exist
    return ONNXInferenceEngine(model_path=str(model_path), labels_path=str(labels_file))


# ── _mock_predict ─────────────────────────────────────────────


def test_mock_predict_returns_correct_number_of_scores(engine: ONNXInferenceEngine):
    scores = engine._mock_predict()
    assert len(scores) == len(engine.labels)


def test_mock_predict_scores_sum_to_approx_one(engine: ONNXInferenceEngine):
    scores = engine._mock_predict()
    total = sum(scores)
    assert total == pytest.approx(1.0, abs=1e-5)


def test_mock_predict_returns_different_results_on_consecutive_calls(
    engine: ONNXInferenceEngine,
):
    """Random mock should (almost certainly) give different arrays each call."""
    s1 = engine._mock_predict()
    s2 = engine._mock_predict()
    assert s1 != s2


# ── Labels loading ────────────────────────────────────────────


def test_engine_loads_labels_correctly(labels_file: Path):
    model_path = labels_file.parent / "model.onnx"
    engine = ONNXInferenceEngine(
        model_path=str(model_path), labels_path=str(labels_file)
    )
    assert engine.labels == ["fallen_tree", "garbage", "vandalism"]


def test_engine_raises_on_missing_labels_file(tmp_path: Path):
    missing = tmp_path / "does_not_exist.json"
    model_path = tmp_path / "model.onnx"
    with pytest.raises(FileNotFoundError):
        ONNXInferenceEngine(model_path=str(model_path), labels_path=str(missing))


# ── Graceful model-path handling ──────────────────────────────


def test_engine_uses_mock_when_model_missing(labels_file: Path):
    missing_model = labels_file.parent / "nonexistent.onnx"
    engine = ONNXInferenceEngine(
        model_path=str(missing_model), labels_path=str(labels_file)
    )
    assert engine.session is None
    # predict should still work via mock
    scores = engine.predict(np.zeros((1, 3, 224, 224), dtype=np.float32))
    assert len(scores) == len(engine.labels)
    assert sum(scores) == pytest.approx(1.0, abs=1e-5)
