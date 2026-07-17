use sha2::{Digest, Sha256};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::grpc_client::ClassificationClient;
use crate::protos::classification::LabelScore;

/// Result of a classification call.
pub struct ClassifyResult {
    pub label: String,
    pub confidence: f32,
    pub candidates: Vec<LabelScore>,
    pub image_hash: String,
}

/// ponytail: guess image format from URL extension
fn guess_format(url: &str) -> String {
    let ext = url.rsplit('.').next().unwrap_or("jpg");
    match ext {
        "png" => "png",
        "gif" => "gif",
        "webp" | "avif" => "webp",
        _ => "jpeg",
    }
    .to_string()
}

/// Download the first image from `media_urls` and classify it.
/// Returns classification result.
pub async fn classify_media(
    client: &Arc<Mutex<ClassificationClient>>,
    media_urls: &[String],
) -> Result<ClassifyResult, String> {
    let url = media_urls
        .first()
        .ok_or_else(|| "media_urls is empty".to_string())?;

    let resp = reqwest::get(url.as_str())
        .await
        .map_err(|e| format!("Failed to download image: {e}"))?;

    let img_bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("Failed to read image bytes: {e}"))?
        .to_vec();

    let image_hash = format!("{:x}", Sha256::digest(&img_bytes));
    let fmt = guess_format(url);

    let mut guard = client.lock().await;
    let resp = guard
        .classify(img_bytes, fmt, None)
        .await
        .map_err(|e| format!("Classification gRPC failed: {e}"))?;

    let result = resp
        .result
        .ok_or_else(|| "no classification result".to_string())?;

    Ok(ClassifyResult {
        label: result.label,
        confidence: result.confidence,
        candidates: result.candidates,
        image_hash,
    })
}
