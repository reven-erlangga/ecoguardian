"""
Interface untuk inference ONNX model.
"""

import json
from pathlib import Path

import numpy as np


class ONNXInferenceEngine:
    """Load ONNX model, run inference, return raw scores."""

    def __init__(self, model_path: str, labels_path: str):
        self.model_path = Path(model_path)
        self.labels_path = Path(labels_path)
        self.session = None
        self.labels: list[str] = []
        self._load_labels()
        self._load_model()

    def _load_labels(self):
        with open(self.labels_path) as f:
            self.labels = json.load(f)

    def _load_model(self):
        if not self.model_path.exists():
            self.session = None
            print(f"⚠️  ONNX model not found at {self.model_path}")
            print("   Using mock inference — replace model.onnx for real predictions")
            return

        try:
            import onnxruntime

            self.session = onnxruntime.InferenceSession(str(self.model_path))
            self._input_name = self.session.get_inputs()[0].name
            self._extra_feeds = {}
            for i in self.session.get_inputs()[1:]:
                # Extra normalization params — pakai nilai default
                if "Sub/y" in i.name or "Mean" in i.name:
                    val = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(
                        i.shape
                    )
                elif "Sqrt/x" in i.name or "Std" in i.name:
                    val = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(
                        i.shape
                    )
                else:
                    val = np.ones(i.shape, dtype=np.float32)
                self._extra_feeds[i.name] = val
            print(f"✅ ONNX model loaded: {self.model_path}")
        except ImportError:
            self.session = None
            print("⚠️  onnxruntime not installed, using mock")
        except Exception as e:
            self.session = None
            print(f"⚠️  Failed to load ONNX model: {e}")

    def predict(self, input_tensor):
        if self.session is not None:
            feed = {self._input_name: input_tensor, **self._extra_feeds}
            return self.session.run(None, feed)[0][0].tolist()
        return self._mock_predict()

    def _mock_predict(self):
        scores = np.random.rand(len(self.labels)).astype(np.float32)
        scores = scores / scores.sum()
        return scores.tolist()
