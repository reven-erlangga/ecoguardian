# Twitter Service

Service untuk **ingest dan query tweet** dari Twitter. Menggunakan **Rust** + **Rocket** + **MongoDB**.

## Tech Stack

- **Rust** (Rocket 0.5 + tonic 0.12 + tokio)
- **MongoDB** — penyimpanan tweet
- **RabbitMQ** — publish event saat tweet di-ingest
- **gRPC client** — Call Classification, NLP, Blockchain, Asset services

## Lokasi Kode

```
backend/twitter-service/
├── src/
│   ├── main.rs                  # Entry point, Rocket routes, app state
│   ├── ingest/                  # Feature: ingest tweet
│   │   ├── handler.rs
│   │   ├── service.rs
│   │   └── repository.rs
│   ├── query/                   # Feature: query tweet
│   │   ├── handler.rs
│   │   ├── service.rs
│   │   └── repository.rs
│   ├── classify/                # gRPC client → Classification service
│   ├── grpc_client.rs
│   ├── nlp_client.rs            # gRPC client → NLP service
│   ├── asset_client.rs          # gRPC client → Asset service
│   ├── blockchain_client.rs     # gRPC client → Blockchain service
│   ├── rabbitmq/                # Event publisher
│   └── common/
│       ├── config.rs            # Config from env + Vault
│       ├── mongo.rs             # MongoDB connection
│       └── mod.rs
├── Cargo.toml
├── build.rs                     # tonic-build untuk proto
└── Dockerfile
```

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50052 | gRPC | `TwitterService` RPC |
| 8000 | HTTP | Rocket REST endpoints |

## Proto Contract

```protobuf
service TwitterService {
  rpc IngestTweet(IngestTweetRequest) returns (IngestTweetResponse);
  rpc GetTweet(GetTweetRequest) returns (GetTweetResponse);
  rpc QueryTweets(QueryTweetsRequest) returns (QueryTweetsResponse);
}
```

## Key Feature: Ingest Flow

1. Tweet masuk via **gRPC `IngestTweet`** atau **HTTP endpoint**
2. Disimpan ke **MongoDB** (via repository pattern)
3. Dikirim ke **Classification Service** (gRPC) untuk analisis gambar
4. Dikirim ke **NLP Service** (gRPC) untuk text analysis
5. Dikirim ke **Blockchain Service** (gRPC) untuk pencatatan
6. **Asset** (gambar) dikirim ke **Asset Service** (gRPC)
7. Event `tweet.ingested` di-publish ke **RabbitMQ**

```rust
// main.rs — AppState menyimpan semua koneksi client
pub struct AppState {
    pub db: mongodb::Database,
    pub rabbit_channel: lapin::Channel,
    pub classify_client: Arc<Mutex<ClassificationClient>>,
    pub nlp_client: Arc<Mutex<NlpClient>>,
    pub blockchain_client: Option<Arc<Mutex<BlockchainClient>>>,
    pub asset_client: Option<Arc<Mutex<AssetClient>>>,
}
```

## Key Feature: Classify Service

Rust gRPC client yang memanggil **Classification Service**:

```rust
// classify/service.rs
pub async fn classify_image(
    &self,
    image_data: Vec<u8>,
    format: String,
) -> Result<ClassificationResult, tonic::Status> {
    let request = tonic::Request::new(ClassifyImageRequest {
        image_data,
        image_format: format,
        tweet_id: "...",
    });
    let response = self.client.clone().classify_image(request).await?;
    Ok(response.into_inner().result.unwrap())
}
```

## Config from Vault

Config priority: **Environment Variable** → **Vault** → **Default**:

```rust
mongo_uri: std::env::var("MONGO_URI")
    .ok()
    .or_else(|| read_secret("ecoguard/db", "mongo-twitter-uri"))
    .unwrap_or_else(|| "mongodb://localhost:27017".to_string()),
```

## Dependencies (Cargo.toml highlights)

```toml
[dependencies]
rocket = { version = "0.5", features = ["json"] }
tonic = "0.12"
mongodb = "3"
lapin = "2"
reqwest = { version = "0.12", features = ["rustls-tls", "json"] }
tokio = { version = "1", features = ["full"] }

[build-dependencies]
tonic-build = "0.12"
```

## Cara Running

```bash
cd infra
docker compose up twitter-service -d
```

Atau development (butuh Rust toolchain):

```bash
cd backend/twitter-service
MONGO_URI="mongodb://localhost:27017" cargo run
```
