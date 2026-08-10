# Twitter Service

Tweet ingestion, watcher, and query service built with **Node.js** + **gRPC** + **Hono** + **MongoDB**.

## Tech Stack

- **Node.js 18+** (gRPC via `@grpc/grpc-js`, HTTP via Hono)
- **MongoDB** — tweet storage
- **RabbitMQ** — event publishing (`ecoguard.events` / `tweet.ingested`)
- **gRPC clients** — Classification, NLP, Blockchain, Asset

## Files

```
backend/twitter-service/src/
├── server.js            # Entry point, boot sequence
├── config.js            # Config from env
├── mongo.js             # MongoDB connection + indexes
├── grpc.js              # TwitterService gRPC server (ingest/get/query)
├── http.js              # Hono REST endpoints
├── ingest.js            # Feature: full ingest pipeline
├── twitter.js           # OAuth 2.0 posting + mention search
├── watcher.js           # Poll Recent Search → auto-ingest
├── rabbitmq.js          # Event publisher
└── clients.js           # Downstream gRPC clients (Classify/NLP/Blockchain/Asset)
```

## Ports

| Port | Protocol | Function |
|------|----------|----------|
| 50052 | gRPC | `TwitterService` |
| 8000 | HTTP | Hono REST |

## Proto

```protobuf
service TwitterService {
  rpc IngestTweet (IngestTweetRequest) returns (IngestTweetResponse);
  rpc GetTweet (GetTweetRequest) returns (Tweet);
  rpc QueryTweets (QueryTweetsRequest) returns (QueryTweetsResponse);
}
```

Proto dimuat langsung saat runtime via `@grpc/proto-loader` (tidak ada build step). Source di `protobuf/`, di-copy ke `/app/proto` saat build Docker.

## Auto-Reply Validation

Sistem otomatis memvalidasi kelengkapan laporan dan mengembalikan pesan "auto-reply" di response `IngestTweetResponse`:

```protobuf
message IngestTweetResponse {
  string id = 1;
  repeated ValidationMessage validation = 2;  // auto-reply messages
}
```

### Validation Rules

| Condition | Response |
|-----------|----------|
| No images (`media_urls` kosong) | `ValidationMessage(field: "media", severity: "error", message: "Mohon sertakan gambar...")` |
| No location (geocode gagal) | `ValidationMessage(field: "location", severity: "warning", message: "Mohon sertakan lokasi...")` |

### Reply Chain (Parent-Child)

When a user sends a follow-up with `parent_tweet_id`, the system:

1. Finds the parent tweet in MongoDB
2. Inherits images from parent if child has none
3. Inherits location from parent if child has none
4. Updates the parent with any new data from child

## Ingest Flow

`ingestTweet()` di `ingest.js` (mirror pipeline Rust):

1. **Merge parent-child** data bila `parent_tweet_id` ada
2. **NLP AnalyzeText** (gRPC) → label, confidence, alamat ter-ekstrak, paraphrased text
3. **Geocode** alamat via NLP bila ada
4. **Validate** kelengkapan (media + lokasi)
5. **Generate reply** via NLP (fallback pesan statis bila NLP down)
6. **Post auto-reply** ke tweet asal (OAuth 2.0)
7. Simpan **TweetDoc** ke MongoDB
8. Buat **Issue** dari text classification
9. Bila ada media: klasifikasi gambar async (download → **Asset upload** → **Classification gRPC** → update classification → **Blockchain record** → buat Issue)
10. Publish event `tweet.ingested` ke **RabbitMQ**

## HTTP Endpoints

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/health` | GET | Health check |
| `/ingest` | POST | Ingest tweet |
| `/trigger-classify` | POST | Classify satu gambar dari URL |
| `/settings/twitter` | GET/POST | Cek/validasi kredensial (env) |
| `/settings/oauth2` | POST | Simpan token OAuth2 ke DB |
| `/settings/oauth2/test` | GET | Test validitas access token |

## Twitter API Credentials

Kredensial Twitter API dikonfigurasi lewat **environment variable**. Token OAuth 2.0 bisa di-seed ke MongoDB via `/settings/oauth2`.

| Variable | Deskripsi |
|----------|-----------|
| `TWITTER_CONSUMER_KEY` | Twitter Consumer Key (API Key) |
| `TWITTER_CONSUMER_SECRET` | Twitter Consumer Secret (API Secret) |
| `TWITTER_BEARER_TOKEN` | (opsional) Bearer Token (read-only) |
| `TWITTER_OAUTH2_ACCESS_TOKEN` | OAuth 2.0 Access Token (write) |
| `TWITTER_OAUTH2_REFRESH_TOKEN` | OAuth 2.0 Refresh Token |
| `TWITTER_OAUTH2_CLIENT_ID` | OAuth 2.0 Client ID |
| `TWITTER_OAUTH2_CLIENT_SECRET` | OAuth 2.0 Client Secret |
| `CLASSIFICATION_GRPC_ADDR` / `NLP_GRPC_ADDR` / `BLOCKCHAIN_GRPC_ADDR` / `ASSET_GRPC_ADDR` | Downstream gRPC addrs |

## Run

```bash
cd infra
docker compose up twitter-service -d
```

Atau development:

```bash
cd backend/twitter-service
npm install
npm start
```

## Tests

```bash
cd backend/twitter-service
npm run check   # logic murni (validateTweet, generateReplyMessage, detectLocation)
```
