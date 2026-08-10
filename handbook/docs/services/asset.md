# Asset Service

Image upload and management via **ImageKit** cloud storage.

- **Python** (Flask + grpcio)
- **ImageKit** — cloud image hosting

**Ports**: `50058` (gRPC), `8088` (HTTP)

**Proto**: `AssetService` (UploadAsset, GetAsset, ListAssets)

## Tests

| File | Coverage |
|------|----------|
| `tests/test_asset_service.py` | Upload (id, filename, size), Get (existing, not-found), List (empty, pagination) |
