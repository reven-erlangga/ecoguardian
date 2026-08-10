# Twitter Service

Service untuk **ingest, watcher, dan query tweet** dari Twitter. Menggunakan **Node.js** + **gRPC** + **Hono** + **MongoDB**.

## Tech Stack

- **Node.js 18+** (gRPC via `@grpc/grpc-js`, HTTP via Hono)
- **MongoDB** — penyimpanan tweet
- **RabbitMQ** — publish event `ecoguard.events` / `tweet.ingested`
- **gRPC client** — Call Classification, NLP, Blockchain, Asset services

## Lokasi Kode

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

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50052 | gRPC | `TwitterService` RPC |
| 8000 | HTTP | Hono REST endpoints |

## Proto Contract

```protobuf
service TwitterService {
  rpc IngestTweet(IngestTweetRequest) returns (IngestTweetResponse);
  rpc GetTweet(GetTweetRequest) returns (Tweet);
  rpc QueryTweets(QueryTweetsRequest) returns (QueryTweetsResponse);
}
```

Proto dimuat langsung saat runtime via `@grpc/proto-loader` (tidak ada build step). Source di `protobuf/`, di-copy ke `/app/proto` saat build Docker.

## Key Feature: Ingest Flow

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

## Config from Env

Config dibaca dari environment variable (dan file `.env` bila ada):

```js
export const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://mongodb:27017',
  classificationGrpcAddr: process.env.CLASSIFICATION_GRPC_ADDR || 'localhost:50053',
  nlpGrpcAddr: process.env.NLP_GRPC_ADDR || 'localhost:50055',
  blockchainGrpcAddr: process.env.BLOCKCHAIN_GRPC_ADDR || 'localhost:50056',
  assetGrpcAddr: process.env.ASSET_GRPC_ADDR || 'localhost:50058',
};
```

## Kredensial Twitter

Kredensial dikonfigurasi via environment variable. Token OAuth 2.0 bisa di-seed ke MongoDB via `/settings/oauth2`.

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

## Cara Running

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

## Testing

```bash
cd backend/twitter-service
npm run check   # logic murni (validateTweet, generateReplyMessage, detectLocation)
```
