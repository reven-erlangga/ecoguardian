# Asset Service

Upload dan manajemen **gambar/aset** menggunakan **ImageKit** cloud storage.

## Tech Stack

- **Python** (Flask + grpcio)
- **ImageKit** — cloud image upload & optimization
- **Vault** — secret management untuk API keys
- **Pillow** — image processing

## Lokasi Kode

```
backend/asset-service/
├── lib/
│   ├── imagekit.py       # ImageKit integration
│   └── vault.py
├── common/
│   ├── config.py
│   └── grpc_server.py
├── proto/
├── server.py
└── requirements.txt
```

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50058 | gRPC | `AssetService` RPC |
| 8088 | HTTP | REST upload endpoint |

## Proto Contract

```protobuf
service AssetService {
  rpc UploadAsset(UploadAssetRequest) returns (UploadAssetResponse);
  rpc GetAsset(GetAssetRequest) returns (GetAssetResponse);
  rpc ListAssets(ListAssetsRequest) returns (ListAssetsResponse);
}
```

## ImageKit Integration

```python
# lib/imagekit.py
import imagekitio

ik = imagekitio.ImageKit(
    public_key=cfg.IMAGEKIT_PUBLIC_KEY,
    private_key=cfg.IMAGEKIT_PRIVATE_KEY,
    url_endpoint=cfg.IMAGEKIT_URL_ENDPOINT,
)

def upload(file_bytes, filename):
    result = ik.upload(file=file_bytes, file_name=filename)
    return result.url
```

## Cara Running

```bash
cd infra
docker compose up asset-service -d
```
