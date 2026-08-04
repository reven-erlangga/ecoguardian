#[macro_use]
extern crate rocket;

mod asset_client;
mod blockchain_client;
mod classify;
mod common;
mod grpc_client;
mod ingest;
mod nlp_client;
mod protos;
mod query;
mod rabbitmq;
mod twitter_handler;

use std::collections::HashMap;
use std::sync::Arc;

use rocket::serde::json::Json;
use rocket::serde::{Deserialize, Serialize};
use rocket::State;
use tokio::sync::Mutex;

use crate::asset_client::AssetClient;
use crate::blockchain_client::BlockchainClient;
use crate::common::config::Config;
use crate::common::mongo;
use crate::grpc_client::ClassificationClient;
use crate::nlp_client::NlpClient;
use crate::common::vault::{read_secret, write_secret};
use crate::protos::twitter::twitter_service_server::TwitterServiceServer;
use crate::rabbitmq::publisher;

// ─── App State ───────────────────────────────────────────────

pub struct AppState {
    pub db: mongodb::Database,
    pub rabbit_channel: lapin::Channel,
    pub classify_client: Arc<Mutex<ClassificationClient>>,
    pub nlp_client: Arc<Mutex<NlpClient>>,
    pub blockchain_client: Option<Arc<Mutex<BlockchainClient>>>,
    pub asset_client: Option<Arc<Mutex<AssetClient>>>,
}

type SharedState = Arc<AppState>;

// ─── Request / Response ──────────────────────────────────────

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
#[allow(dead_code)]
struct TriggerRequest {
    tweet_id: String,
    text: String,
    author: String,
    author_username: String,
    media_urls: Vec<String>,
    #[serde(default)]
    parent_tweet_id: Option<String>,
    #[serde(default)]
    metadata: HashMap<String, String>,
}

#[derive(Serialize)]
struct ClassifyResponse {
    label: String,
    confidence: f32,
    candidates: Vec<LabelScoreJson>,
    tweet_id: String,
}

#[derive(Serialize)]
struct LabelScoreJson {
    label: String,
    confidence: f32,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

// ─── Twitter Credentials ────────────────────────────────────

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct TwitterCredentials {
    api_key: String,
    api_secret: String,
    #[serde(default)]
    bearer_token: Option<String>,
}

#[derive(Serialize)]
struct CredentialsStatus {
    configured: bool,
}

// ─── Helpers ─────────────────────────────────────────────────

/// ponytail: detect image format from URL extension (case-insensitive)
fn guess_format(url: &str) -> &str {
    let ext = url.rsplit('.').next().unwrap_or("jpg");
    match ext.to_ascii_lowercase().as_str() {
        "png" => "png",
        "gif" => "gif",
        "webp" | "avif" => "webp",
        _ => "jpeg",
    }
}

// ─── Routes ──────────────────────────────────────────────────

#[get("/health")]
fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok" }))
}

// TODO: Remove — dummy ingest endpoint untuk testing, diganti Twitter Watcher
#[post("/ingest", format = "json", data = "<req>")]
async fn ingest_dummy(
    req: Json<TriggerRequest>,
    state: &State<SharedState>,
) -> Result<Json<serde_json::Value>, Json<ErrorResponse>> {
    use crate::protos::twitter::IngestTweetRequest;

    let repo = ingest::repository::TweetRepository::new(&state.db);
    let ingest_req = IngestTweetRequest {
        tweet_id: req.tweet_id.clone(),
        text: req.text.clone(),
        author: req.author.clone(),
        author_username: req.author_username.clone(),
        media_urls: req.media_urls.clone(),
        parent_tweet_id: req.parent_tweet_id.clone().unwrap_or_default(),
        metadata: req.metadata.clone(),
        created_at: None,
    };

    let id = ingest::service::ingest_tweet(
        &repo,
        &state.rabbit_channel,
        &state.classify_client,
        &state.nlp_client,
        &state.blockchain_client,
        &state.asset_client,
        &ingest_req,
    )
    .await
    .map_err(|e| Json(ErrorResponse { error: e }))?;

    Ok(Json(serde_json::json!({
        "id": id,
        "tweet_id": req.tweet_id,
        "status": "ingested"
    })))
}

#[post("/trigger-classify", format = "json", data = "<req>")]
async fn trigger_classify(
    req: Json<TriggerRequest>,
    state: &State<SharedState>,
) -> Result<Json<ClassifyResponse>, Json<ErrorResponse>> {
    // ponytail: ambil gambar pertama, return error kalau kosong
    let image_url = req.media_urls.first().ok_or_else(|| {
        Json(ErrorResponse {
            error: "media_urls is empty — provide at least one image URL".into(),
        })
    })?;

    // Download image bytes
    let resp = reqwest::get(image_url.as_str()).await.map_err(|e| {
        Json(ErrorResponse {
            error: format!("Failed to download image: {e}"),
        })
    })?;

    let img_bytes = resp
        .bytes()
        .await
        .map_err(|e| {
            Json(ErrorResponse {
                error: format!("Failed to read image bytes: {e}"),
            })
        })?
        .to_vec();

    let fmt = guess_format(image_url).to_string();

    // Kirim ke Classification Service via gRPC
    let mut guard = state.classify_client.lock().await;
    let resp = guard.classify(img_bytes, fmt, None).await.map_err(|e| {
        Json(ErrorResponse {
            error: format!("Classification gRPC failed: {e}"),
        })
    })?;

    let result = resp.result.unwrap(); // ClassificationResult
    let candidates: Vec<LabelScoreJson> = result
        .candidates
        .iter()
        .map(|c| LabelScoreJson {
            label: c.label.clone(),
            confidence: c.confidence,
        })
        .collect();

    Ok(Json(ClassifyResponse {
        label: result.label,
        confidence: result.confidence,
        candidates,
        tweet_id: req.tweet_id.clone(),
    }))
}

// ─── Settings ────────────────────────────────────────────────

/// Save Twitter API credentials to Vault.
#[post("/settings/twitter", format = "json", data = "<creds>")]
async fn save_twitter_settings(
    creds: Json<TwitterCredentials>,
) -> Result<Json<serde_json::Value>, Json<ErrorResponse>> {
    let path = "ecoguard/twitter";

    let ok = write_secret(path, "api-key", &creds.api_key)
        && write_secret(path, "api-secret", &creds.api_secret);

    if !ok {
        return Err(Json(ErrorResponse {
            error: "Failed to save credentials to Vault — is Vault running?".into(),
        }));
    }

    // Save optional bearer token
    if let Some(ref bt) = creds.bearer_token {
        write_secret(path, "bearer-token", bt);
    }

    Ok(Json(serde_json::json!({ "status": "saved" })))
}

/// Check whether Twitter credentials are configured in Vault.
#[get("/settings/twitter")]
async fn twitter_settings_status() -> Json<CredentialsStatus> {
    let configured = read_secret("ecoguard/twitter", "api-key").is_some()
        && read_secret("ecoguard/twitter", "api-secret").is_some();
    Json(CredentialsStatus { configured })
}

// ─── Launch ──────────────────────────────────────────────────

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    let config = Config::from_env();

    // --- MongoDB ---
    let db = mongo::connect_mongo(&config.mongo_uri)
        .await
        .expect("❌ Failed to connect to MongoDB");

    // Ensure indexes on the issues collection (best-effort)
    if let Err(e) = mongo::ensure_issue_indexes(&db).await {
        eprintln!("⚠️  Failed to create issue indexes: {e}");
    }

    // --- RabbitMQ ---
    let rabbit_channel = publisher::connect(&config.rabbitmq_uri)
        .await
        .expect("❌ Failed to connect to RabbitMQ");

    // --- Classification gRPC Client (retry 30s untuk DNS) ---
    let classify_client = {
        let mut client = None;
        for i in 0..30 {
            match ClassificationClient::new(config.class_grpc_addr.clone()).await {
                Ok(c) => {
                    client = Some(c);
                    break;
                }
                Err(e) => eprintln!("⏳ Classification not ready (attempt {})...", i + 1),
            }
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        }
        Arc::new(Mutex::new(
            client.expect("❌ Cannot connect to Classification Service"),
        ))
    };

    // --- Blockchain gRPC Client (best-effort, skip jika gak reachable) ---
    let blockchain_client = match BlockchainClient::new(config.blockchain_grpc_addr.clone()).await {
        Ok(c) => {
            println!("✅ Connected to Blockchain Service");
            Some(Arc::new(Mutex::new(c)))
        }
        Err(e) => {
            eprintln!("⚠️  Blockchain Service not available: {e}");
            eprintln!("   Blockchain recording will be disabled for this session");
            None
        }
    };

    // --- Asset gRPC Client (best-effort, skip jika gak reachable) ---
    let asset_client = match AssetClient::new(config.asset_grpc_addr.clone()).await {
        Ok(c) => {
            println!("✅ Connected to Asset Service");
            Some(Arc::new(Mutex::new(c)))
        }
        Err(e) => {
            eprintln!("⚠️  Asset Service not available: {e}");
            None
        }
    };

    // --- NLP gRPC Client (retry 30s untuk DNS) ---
    let nlp_client = {
        let mut client = None;
        for i in 0..30 {
            match NlpClient::new(config.nlp_grpc_addr.clone()).await {
                Ok(c) => {
                    client = Some(c);
                    break;
                }
                Err(e) => eprintln!("⏳ NLP not ready (attempt {})...", i + 1),
            }
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        }
        Arc::new(Mutex::new(
            client.expect("❌ Cannot connect to NLP Service"),
        ))
    };

    println!("✅ All services connected");

    // --- Shared State (Arc<AppState>) ---
    let app_state: SharedState = Arc::new(AppState {
        db,
        rabbit_channel,
        classify_client,
        nlp_client,
        blockchain_client,
        asset_client,
    });

    // --- gRPC Server ---
    let grpc_addr = format!("0.0.0.0:{}", config.grpc_port)
        .parse()
        .expect("Invalid gRPC address");

    let svc = TwitterServiceServer::new(app_state.clone());
    let grpc_fut = tonic::transport::Server::builder()
        .add_service(svc)
        .serve(grpc_addr);

    println!("🛜  gRPC server listening on 0.0.0.0:{}", config.grpc_port);

    // Spawn gRPC server on a background task
    let grpc_handle = tokio::spawn(async move {
        if let Err(e) = grpc_fut.await {
            eprintln!("❌ gRPC server error: {e}");
        }
    });

    // --- Rocket HTTP Server ---
    let rocket_config = rocket::Config {
        address: "0.0.0.0".parse().unwrap(),
        port: config.http_port,
        ..rocket::Config::default()
    };
    let _rocket = rocket::build()
        .configure(rocket_config)
        .manage(app_state)
        .mount("/", routes![health, ingest_dummy, trigger_classify, save_twitter_settings, twitter_settings_status])
        .launch()
        .await?;

    // If Rocket exits, wait for gRPC (shouldn't normally happen)
    let _ = grpc_handle.await;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─── guess_format ────────────────────────────────────────

    #[test]
    fn guess_format_cases() {
        assert_eq!(guess_format("photo.jpg"), "jpeg");
        assert_eq!(guess_format("photo.jpeg"), "jpeg");
        assert_eq!(guess_format("photo.JPG"), "jpeg");
        assert_eq!(guess_format("photo.png"), "png");
        assert_eq!(guess_format("photo.PNG"), "png");
        assert_eq!(guess_format("photo.gif"), "gif");
        assert_eq!(guess_format("photo.GIF"), "gif");
        assert_eq!(guess_format("photo.webp"), "webp");
        assert_eq!(guess_format("photo.avif"), "webp");
        assert_eq!(guess_format("photo.bmp"), "jpeg");
        assert_eq!(guess_format("photo.tiff"), "jpeg");
        assert_eq!(guess_format("photo.svg"), "jpeg");
        assert_eq!(guess_format("photo"), "jpeg");
        assert_eq!(guess_format("photo."), "jpeg");
    }

    // ─── Rocket route ───────────────────────────────────────

    // ponytail: Rocket integration tests skipped — they need real MongoDB/RabbitMQ state.
}
