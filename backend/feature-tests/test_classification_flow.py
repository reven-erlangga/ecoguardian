"""
Test: classification flow end-to-end

- Generate a random 224×224 JPEG image
- Send it via gRPC ``ClassifyImage``
- Verify the response has ``label``, ``confidence``, and ``candidates``
"""

import io
import random

import pytest
from PIL import Image

from conftest import classification_stub  # noqa: F401  (fixture import)


def _dummy_jpeg(width: int = 224, height: int = 224) -> bytes:
    """Create a random RGB JPEG image and return its bytes."""
    pixels = bytearray(random.getrandbits(8) for _ in range(width * height * 3))
    img = Image.frombytes("RGB", (width, height), bytes(pixels))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


class TestClassificationFlow:
    """End-to-end tests for the Classification gRPC service."""

    @pytest.fixture(autouse=True)
    def _setup(self, classification_stub):
        self.stub = classification_stub

    def test_classify_image_returns_required_fields(self):
        """ClassifyImage response must carry label, confidence, and candidates."""
        from classification import classification_pb2  # noqa: F811

        img_bytes = _dummy_jpeg()

        response = self.stub.ClassifyImage(
            classification_pb2.ClassifyImageRequest(
                image_data=img_bytes, image_format="jpeg"
            )
        )

        assert response.result is not None, "response.result is missing"
        assert response.result.label, "label is empty"
        assert isinstance(response.result.label, str)
        assert 0.0 <= response.result.confidence <= 1.0, (
            f"confidence {response.result.confidence} out of [0, 1]"
        )
        # candidates may be empty if the model returns only a top-1 result
        assert hasattr(response.result, "candidates")

    def test_classify_image_candidates_are_valid(self):
        """Every candidate has a label and a confidence score."""
        from classification import classification_pb2  # noqa: F811

        img_bytes = _dummy_jpeg()

        response = self.stub.ClassifyImage(
            classification_pb2.ClassifyImageRequest(
                image_data=img_bytes, image_format="jpeg"
            )
        )

        for cand in response.result.candidates:
            assert cand.label, f"candidate label is empty: {cand}"
            assert 0.0 <= cand.confidence <= 1.0, (
                f"candidate confidence {cand.confidence} out of [0, 1]"
            )

    def test_classify_image_with_different_format(self):
        """Service should accept PNG and other common formats."""
        from classification import classification_pb2  # noqa: F811

        # Produce PNG bytes
        pixels = bytearray(random.getrandbits(8) for _ in range(224 * 224 * 3))
        img = Image.frombytes("RGB", (224, 224), bytes(pixels))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_bytes = buf.getvalue()

        response = self.stub.ClassifyImage(
            classification_pb2.ClassifyImageRequest(
                image_data=png_bytes, image_format="png"
            )
        )

        assert response.result is not None
        assert response.result.label
