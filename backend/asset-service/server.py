"""Asset Service — gRPC server for image/file asset management."""

import os, sys, time, json, uuid
from pathlib import Path
from concurrent import futures
from threading import Thread

import grpc
from flask import Flask, jsonify, request

_proj = os.path.dirname(os.path.abspath(__file__))
_proto = os.path.join(_proj, "proto")
sys.path.insert(0, _proto)
sys.path.insert(1, _proj)

from common import common_pb2
from asset import service_pb2, service_pb2_grpc


UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# In-memory store (swap for SQLite/Postgres later)
_assets: dict[str, dict] = {}


def _doc_to_asset(doc: dict) -> service_pb2.Asset:
    return service_pb2.Asset(
        id=doc.get("id", ""),
        url=doc.get("url", ""),
        filename=doc.get("filename", ""),
        mime_type=doc.get("mime_type", ""),
        size=int(doc.get("size", 0)),
        metadata=doc.get("metadata", "{}"),
        created_at=int(doc.get("created_at", 0)),
    )


class AssetServicer(service_pb2_grpc.AssetServiceServicer):
    def UploadAsset(self, request, context):
        asset_id = str(uuid.uuid4())
        ext = Path(request.filename).suffix or ".bin"
        local_path = UPLOAD_DIR / f"{asset_id}{ext}"

        with open(local_path, "wb") as f:
            f.write(request.data)

        url = f"/uploads/{asset_id}{ext}"
        doc = {
            "id": asset_id,
            "url": url,
            "filename": request.filename,
            "mime_type": request.mime_type or "application/octet-stream",
            "size": len(request.data),
            "metadata": request.metadata or "{}",
            "created_at": int(time.time()),
        }
        _assets[asset_id] = doc

        return service_pb2.UploadAssetResponse(asset=_doc_to_asset(doc))

    def GetAsset(self, request, context):
        doc = _assets.get(request.id)
        if not doc:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"Asset '{request.id}' not found")
            return service_pb2.Asset()
        return _doc_to_asset(doc)

    def ListAssets(self, request, context):
        items = list(_assets.values())
        total = len(items)
        page = request.page or 1
        per_page = request.per_page or 20
        start = (page - 1) * per_page
        end = start + per_page
        return service_pb2.ListAssetsResponse(
            assets=[_doc_to_asset(a) for a in items[start:end]],
            total=total,
        )


# ─── Flask HTTP Upload ────────────────────────────────────

app = Flask(__name__)


@app.route("/upload", methods=["POST"])
def upload_http():
    if "image" not in request.files:
        return jsonify({"error": "no image file"}), 400
    file = request.files["image"]
    asset_id = str(uuid.uuid4())
    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    local_path = UPLOAD_DIR / f"{asset_id}{ext}"
    file.save(local_path)

    url = f"/uploads/{asset_id}{ext}"
    doc = {
        "id": asset_id,
        "url": url,
        "filename": file.filename or "unknown",
        "mime_type": file.content_type or "image/jpeg",
        "size": os.path.getsize(local_path),
        "metadata": request.form.get("metadata", "{}"),
        "created_at": int(time.time()),
    }
    _assets[asset_id] = doc
    return jsonify(doc)


# ─── Serve uploaded files ─────────────────────────────────

@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return app.send_static_file(str(UPLOAD_DIR / filename))


# ─── Start Servers ────────────────────────────────────────

if __name__ == "__main__":
    GRPC_PORT = int(os.environ.get("ASSET_GRPC_PORT", "50058"))
    HTTP_PORT = int(os.environ.get("ASSET_HTTP_PORT", "8088"))

    gserver = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_AssetServiceServicer_to_server(AssetServicer(), gserver)
    gserver.add_insecure_port(f"0.0.0.0:{GRPC_PORT}")
    gserver.start()
    print(f"✅ AssetService gRPC on port {GRPC_PORT}")

    t = Thread(target=lambda: app.run(host="0.0.0.0", port=HTTP_PORT, debug=False), daemon=True)
    t.start()
    print(f"✅ AssetService HTTP on port {HTTP_PORT}")

    gserver.wait_for_termination()
