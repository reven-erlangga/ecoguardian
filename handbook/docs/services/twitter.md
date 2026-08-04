# Twitter Service

Tweet ingestion and query service built with **Rust** + **Rocket** + **MongoDB**.

## Tech Stack

- **Rust** (Rocket 0.5 + tonic 0.12)
- **MongoDB** — tweet storage
- **RabbitMQ** — event publishing
- **gRPC clients** — Classification, NLP, Blockchain, Asset

## Files

```
backend/twitter-service/src/
├── main.rs                  # Entry point, Rocket routes
├── ingest/                  # Feature: tweet ingestion
├── query/                   # Feature: tweet query
├── classify/                # gRPC → Classification
├── nlp_client.rs            # gRPC → NLP
├── rabbitmq/                # Event publisher
└── common/config.rs         # Config from env + Vault
```

## Ports

| Port | Protocol | Function |
|------|----------|----------|
| 50052 | gRPC | `TwitterService` |
| 8000 | HTTP | Rocket REST |

## Proto

```protobuf
service TwitterService {
  rpc IngestTweet (IngestTweetRequest) returns (IngestTweetResponse);
  rpc GetTweet (GetTweetRequest) returns (Tweet);
  rpc QueryTweets (QueryTweetsRequest) returns (QueryTweetsResponse);
}
```

## Auto-Reply Validation (NEW)

Sistem otomatis memvalidasi kelengkapan laporan dan mengembalikan pesan "auto-reply" di response `IngestTweetResponse`:

```protobuf
message IngestTweetRequest {
  // ...
  string parent_tweet_id = 8;  // for reply/continuation tracking
}

message IngestTweetResponse {
  string id = 1;
  repeated ValidationMessage validation = 2;  // auto-reply messages
}

message ValidationMessage {
  string field = 1;      // "media", "location", "classification"
  string message = 2;    // human-readable reply text
  string severity = 3;   // "error", "warning", "info"
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

**Flow example**:
```
User: "Ada pohon tumbang di jalan" (no images)
System: ⚠️ "Mohon sertakan gambar"

User sends again with parent_tweet_id + image
System: ✅ Inherits location from parent, classifies new image
```

## Ingest Flow

1. Tweet received via gRPC/HTTP
2. Stored in MongoDB
3. Image sent to **Classification Service** (gRPC)
4. Text sent to **NLP Service** (gRPC)
5. Data recorded in **Blockchain Service** (gRPC)
6. Image uploaded to **Asset Service** (gRPC)
7. Event published to **RabbitMQ**

## Config

Priority: **Environment** → **Vault** → **Default**:

```rust
mongo_uri: env("MONGO_URI")
    .or_else(|| read_secret("ecoguard/db", "mongo-twitter-uri"))
    .unwrap_or("mongodb://localhost:27017")
```

## Tests

Inline `#[cfg(test)]` modules di 6 files:

| File | Tests |
|------|-------|
| `main.rs` | App state, Rocket health endpoint |
| `grpc_client.rs` | ClassificationClient URI validation |
| `nlp_client.rs` | NlpClient URI validation |
| `asset_client.rs` | AssetClient URI validation |
| `blockchain_client.rs` | BlockchainClient URI validation |
| `common/config.rs` | Config env parsing, fallback defaults |
