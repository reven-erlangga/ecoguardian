#[macro_use]
extern crate rocket;

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

use crate::blockchain_client::BlockchainClient;
use crate::common::config::Config;
use crate::common::mongo;
use crate::grpc_client::ClassificationClient;
use crate::nlp_client::NlpClient;
use crate::protos::twitter::twitter_service_server::TwitterServiceServer;
use crate::rabbitmq::publisher;

// ─── App State ───────────────────────────────────────────────

pub struct AppState {
    pub db: mongodb::Database,
    pub rabbit_channel: lapin::Channel,
    pub classify_client: Arc<Mutex<ClassificationClient>>,
    pub nlp_client: Arc<Mutex<NlpClient>>,
    pub blockchain_client: Option<Arc<Mutex<BlockchainClient>>>,
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

// ─── Route ───────────────────────────────────────────────────

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
        .mount("/", routes![trigger_classify])
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
