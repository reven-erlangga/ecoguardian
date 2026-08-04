"""
Unit tests for AssetService gRPC handlers.
Tests use isolated AssetServicer with in-memory storage.
"""

import json
import sys
from pathlib import Path

import grpc
import pytest

# ── Setup paths ──────────────────────────────────────────
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent  # backend/asset-service
_PROTO = _PKG / "proto"
for p in [_PROTO, _PKG]:
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from asset import service_pb2
import server as asset_server


@pytest.fixture(autouse=True)
def clear_assets():
    asset_server._assets.clear()
    yield


@pytest.fixture
def servicer():
    return asset_server.AssetServicer()


def _make_context():
    class FakeContext:
        def __init__(self):
            self.code = None
            self.details = None
        def set_code(self, code):
            self.code = code
        def set_details(self, details):
            self.details = details
    return FakeContext()


class TestUploadAsset:

    def test_upload_returns_asset_with_id(self, servicer):
        req = service_pb2.UploadAssetRequest(
            data=b"fake-image-data",
            filename="test.jpg",
            mime_type="image/jpeg",
            metadata=json.dumps({"source": "test"}),
        )
        ctx = _make_context()
        resp = servicer.UploadAsset(req, ctx)
        assert resp.asset.id != ""
        assert resp.asset.url != ""

    def test_upload_stores_filename(self, servicer):
        req = service_pb2.UploadAssetRequest(
            data=b"data", filename="photo.png", mime_type="image/png"
        )
        resp = servicer.UploadAsset(req, _make_context())
        assert resp.asset.filename == "photo.png"

    def test_upload_tracks_size(self, servicer):
        data = b"x" * 1024
        req = service_pb2.UploadAssetRequest(data=data, filename="f.jpg")
        resp = servicer.UploadAsset(req, _make_context())
        assert resp.asset.size == 1024


class TestGetAsset:

    def test_get_existing_asset(self, servicer):
        req = service_pb2.UploadAssetRequest(data=b"img", filename="a.jpg")
        uploaded = servicer.UploadAsset(req, _make_context())
        get_req = service_pb2.GetAssetRequest(id=uploaded.asset.id)
        resp = servicer.GetAsset(get_req, _make_context())
        assert resp.id == uploaded.asset.id
        assert resp.filename == "a.jpg"

    def test_get_nonexistent_asset_returns_not_found(self, servicer):
        ctx = _make_context()
        resp = servicer.GetAsset(service_pb2.GetAssetRequest(id="nonexistent"), ctx)
        assert ctx.code == grpc.StatusCode.NOT_FOUND
        assert resp.id == ""


class TestListAssets:

    def test_list_empty(self, servicer):
        req = service_pb2.ListAssetsRequest(page=1, per_page=10)
        resp = servicer.ListAssets(req, _make_context())
        assert resp.total == 0
        assert len(resp.assets) == 0

    def test_list_with_data(self, servicer):
        for i in range(5):
            servicer.UploadAsset(
                service_pb2.UploadAssetRequest(data=b"x", filename=f"f{i}.jpg"),
                _make_context(),
            )
        req = service_pb2.ListAssetsRequest(page=1, per_page=2)
        resp = servicer.ListAssets(req, _make_context())
        assert resp.total == 5
        assert len(resp.assets) == 2
