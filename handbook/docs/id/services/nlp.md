# NLP Service

Natural Language Processing untuk **analisis teks** dan **geocoding** (konversi alamat → koordinat).

## Tech Stack

- **Python** (Flask + grpcio)
- **PostgreSQL** — penyimpanan hasil analisis
- **Redis** — caching geocoding results
- **Transformers** (optional) — IndoBERT untuk sentimen
- **Nominatim** — OpenStreetMap geocoding API

## Lokasi Kode

```
backend/nlp-service/
├── features/
│   ├── classifier/       # Text classification
│   ├── ner/              # Named entity recognition
│   └── paraphrase/       # Paraphrase detection
├── geocoding/            # Alamat → koordinat
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
| 50055 | gRPC | `NLPService` RPC |

## Proto Contract

```protobuf
service NLPService {
  rpc AnalyzeText(AnalyzeTextRequest) returns (AnalyzeTextResponse);
  rpc Geocode(GeocodeRequest) returns (GeocodeResponse);
}
```

## Cara Running

```bash
cd infra
docker compose up nlp-service -d
```
