use sha2::{Digest, Sha256};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::asset_client::AssetClient;
use crate::grpc_client::ClassificationClient;
use crate::protos::classification::LabelScore;

/// Result of a classification call.
pub struct ClassifyResult {
    pub label: String,
    pub confidence: f32,
    pub candidates: Vec<LabelScore>,
    pub asset_url: String,
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

/// Download all images from `media_urls`, upload each to asset service,
/// then classify ALL images at once (majority vote via ClassifyImages).
/// Returns the aggregated classification result.
pub async fn classify_media(
    client: &Arc<Mutex<ClassificationClient>>,
    asset_client: &Option<Arc<Mutex<AssetClient>>>,
    media_urls: &[String],
) -> Result<ClassifyResult, String> {
    if media_urls.is_empty() {
        return Err("media_urls is empty".to_string());
    }

    let mut downloaded = Vec::new();
    let mut asset_urls = Vec::new();

    for url in media_urls {
        let resp = reqwest::get(url.as_str())
            .await
            .map_err(|e| format!("Failed to download image {url}: {e}"))?;

        let img_bytes = resp
            .bytes()
            .await
            .map_err(|e| format!("Failed to read image bytes: {e}"))?
            .to_vec();

        let image_hash = format!("{:x}", Sha256::digest(&img_bytes));
        let fmt = guess_format(url);

        // Upload to asset service; fall back to content-hash URL on failure.
        let asset_url = if let Some(ac) = asset_client {
            let mut guard = ac.lock().await;
            match guard
                .upload(
                    img_bytes.clone(),
                    "twitter-image.jpg".to_string(),
                    fmt.clone(),
                )
                .await
            {
                Ok(url) => url,
                Err(e) => {
                    eprintln!("⚠️  Asset upload failed: {e}, using hash fallback");
                    format!("hash:{}", image_hash)
                }
            }
        } else {
            format!("hash:{}", image_hash)
        };

        downloaded.push((img_bytes, fmt));
        asset_urls.push(asset_url);
    }

    // Send ALL images at once for multi-image classification
    let mut guard = client.lock().await;
    let resp = guard
        .classify_images(downloaded, None)
        .await
        .map_err(|e| format!("Classification gRPC (multi) failed: {e}"))?;

    let result = resp
        .result
        .ok_or_else(|| "no classification result".to_string())?;

    Ok(ClassifyResult {
        label: result.label,
        confidence: result.confidence,
        candidates: result.candidates,
        asset_url: asset_urls.into_iter().next().unwrap_or_default(),
    })
}
