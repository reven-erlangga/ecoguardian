use chrono::Utc;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::asset_client::AssetClient;
use crate::blockchain_client::BlockchainClient;
use crate::classify;
use crate::common::mongo::{
    ClassificationDetail, ClassificationResult, IssueDoc, IssueLocation, Location, TweetDoc,
};
use crate::grpc_client::ClassificationClient;
use crate::ingest::repository::TweetRepository;
use crate::nlp_client::NlpClient;
use crate::protos::twitter::IngestTweetRequest;
use crate::rabbitmq::publisher;

// ─── Validation ─────────────────────────────────────────

// ─── Validation messages ─────────────────────────────────

#[derive(Debug, Clone, serde::Serialize)]
pub struct ValidationMessage {
    pub field: String,
    pub message: String,
    pub severity: String,
}

/// Check tweet completeness: returns list of missing field names.
pub fn validate_tweet(
    media_urls: &[String],
    location: &Option<Location>,
) -> Vec<String> {
    let mut missing = Vec::new();
    if media_urls.is_empty() {
        missing.push("media".to_string());
    }
    if location.is_none() {
        missing.push("location".to_string());
    }
    missing
}

/// Generate natural reply messages via NLP service.
pub async fn generate_reply_messages(
    nlp_client: &Arc<Mutex<NlpClient>>,
    tweet_text: &str,
    missing_fields: &[String],
    classification_label: &str,
    classification_confidence: f32,
) -> Vec<ValidationMessage> {
    if missing_fields.is_empty() {
        return vec![];
    }

    let mut guard = nlp_client.lock().await;
    let resp = guard
        .generate_reply(
            tweet_text.to_string(),
            missing_fields.to_vec(),
            classification_label.to_string(),
            classification_confidence,
        )
        .await;

    match resp {
        Ok(r) => {
            vec![ValidationMessage {
                field: missing_fields.join(","),
                message: r.message,
                severity: if missing_fields.contains(&"media".to_string()) {
                    "error".to_string()
                } else {
                    "warning".to_string()
                },
            }]
        }
        Err(e) => {
            // Fallback to simple messages if NLP is down
            eprintln!("⚠️  NLP GenerateReply failed: {e}, using fallback");
            missing_fields
                .iter()
                .map(|f| ValidationMessage {
                    field: f.clone(),
                    message: match f.as_str() {
                        "media" => "Mohon sertakan gambar untuk membantu klasifikasi.".to_string(),
                        "location" => "Mohon sertakan lokasi spesifik (alamat/koordinat).".to_string(),
                        _ => format!("Data '{}' diperlukan.", f),
                    },
                    severity: if f == "media" { "error".to_string() } else { "warning".to_string() },
                })
                .collect()
        }
    }
}

/// Try to find and merge data from a parent tweet (reply chain).
async fn merge_parent_data(
    repo: &TweetRepository,
    parent_tweet_id: &str,
    media_urls: &mut Vec<String>,
    location: &mut Option<Location>,
) {
    if let Ok(Some(parent)) = repo.find_by_tweet_id(parent_tweet_id).await {
        // Inherit media from parent if child has none
        if media_urls.is_empty() && !parent.media_urls.is_empty() {
            *media_urls = parent.media_urls.clone();
        }
        // Inherit location from parent if child has none
        if location.is_none() && parent.location.is_some() {
            *location = parent.location.clone();
        }
    }
}

/// Orchestrate the tweet-ingest flow: NLP → geocode → classify image → save → publish.
/// Returns (id, validation_messages).
pub async fn ingest_tweet(
    repo: &TweetRepository,
    rabbit_channel: &lapin::Channel,
    classify_client: &Arc<Mutex<ClassificationClient>>,
    nlp_client: &Arc<Mutex<NlpClient>>,
    blockchain_client: &Option<Arc<Mutex<BlockchainClient>>>,
    asset_client: &Option<Arc<Mutex<AssetClient>>>,
    req: &IngestTweetRequest,
) -> Result<(String, Vec<ValidationMessage>), String> {
    let created_at = if let Some(ts) = &req.created_at {
        chrono::DateTime::from_timestamp(ts.seconds, ts.nanos as u32).unwrap_or_else(|| Utc::now())
    } else {
        Utc::now()
    };

    // ─── Handle parent-child chain ───────────────────────
    let mut media_urls = req.media_urls.clone();
    let mut location: Option<Location> = None;

    if !req.parent_tweet_id.is_empty() {
        merge_parent_data(repo, &req.parent_tweet_id, &mut media_urls, &mut location).await;
    }

    // ─── Step 1: NLP AnalyzeText ─────────────────────────
    let (text_classification, extracted_address, paraphrased_text) = {
        let mut guard = nlp_client.lock().await;
        let resp = guard
            .analyze_text(req.text.clone())
            .await
            .map_err(|e| format!("NLP AnalyzeText failed: {e}"))?;

        let text_class = ClassificationDetail {
            label: resp.label,
            confidence: resp.confidence,
        };

        let paraph = if resp.paraphrased_text.is_empty() {
            req.text.clone()
        } else {
            resp.paraphrased_text
        };

        (text_class, resp.extracted_address, paraph)
    };

    // ─── Step 2: Geocode if address found ────────────────
    if location.is_none() && !extracted_address.is_empty() {
        let mut guard = nlp_client.lock().await;
        match guard.geocode(extracted_address.clone()).await {
            Ok(geo) => {
                location = Some(Location {
                    address: extracted_address,
                    lat: geo.lat,
                    lon: geo.lon,
                    display_name: geo.display_name,
                });
            }
            Err(e) => {
                eprintln!("⚠️  Geocode failed for address: {e}");
            }
        }
    };

    // ─── Validation ──────────────────────────────────────
    let missing_fields = validate_tweet(&media_urls, &location);
    let has_images = !media_urls.is_empty();
    let has_location = location.is_some();
    let validation_status: Vec<String> = if missing_fields.is_empty() {
        vec!["ok".to_string()]
    } else {
        missing_fields.iter().map(|f| format!("needs_{}", f)).collect()
    };

    // Generate natural reply via NLP (best-effort, non-blocking)
    let validation = if !missing_fields.is_empty() {
        generate_reply_messages(
            nlp_client,
            &req.text,
            &missing_fields,
            &text_classification.label,
            text_classification.confidence,
        )
        .await
    } else {
        vec![]
    };

    let blockchain_location = location.clone();
    let paraphrased_clone = paraphrased_text.clone();

    let tweet = TweetDoc {
        id: String::new(),
        tweet_id: req.tweet_id.clone(),
        paraphrased_text,
        text: None,
        author: req.author.clone(),
        author_username: req.author_username.clone(),
        media_urls: media_urls.clone(),
        location,
        classification: None,
        created_at,
        metadata: HashMap::from_iter(req.metadata.clone()),
        parent_tweet_id: if req.parent_tweet_id.is_empty() {
            None
        } else {
            Some(req.parent_tweet_id.clone())
        },
        has_images,
        has_location,
        validation_status,
    };

    let id = repo
        .insert(tweet)
        .await
        .map_err(|e| format!("MongoDB insert failed: {e}"))?;

    // ─── Create issue from NLP text classification (always) ──
    {
        let repo_clone = TweetRepository::new(repo.database());
        if let Err(e) = create_issue_from_text(
            &repo_clone,
            &req.tweet_id,
            &text_classification,
            &blockchain_location,
            &paraphrased_clone,
        )
        .await
        {
            eprintln!("⚠️  Failed to create issue from text: {e}");
        }
    }

    // ─── Step 3: If tweet has media, classify image asynchronously ──
    if !media_urls.is_empty() {
        let id_clone = id.clone();
        let tweet_id_clone = req.tweet_id.clone();
        let db_clone = repo.database().clone();
        let classify_client = classify_client.clone();
        let blockchain_client = blockchain_client.clone();
        let asset_client = asset_client.clone();
        let text_class = text_classification;
        let loc = blockchain_location;
        let paraph = paraphrased_clone;

        tokio::spawn(async move {
            let repo_clone = TweetRepository::new(&db_clone);
            if let Err(e) = classify_and_update(
                &repo_clone,
                &classify_client,
                &blockchain_client,
                &asset_client,
                &id_clone,
                &tweet_id_clone,
                &media_urls,
                &text_class,
                &loc,
                &paraph,
            )
            .await
            {
                eprintln!("⚠️  Image classification failed for tweet {id_clone}: {e}");
            }
        });
    }

    // ─── Step 4: Publish event (best-effort) ─────────────
    let event = serde_json::json!({ "id": id, "tweet_id": req.tweet_id });
    if let Err(e) =
        publisher::publish_tweet_ingested(rabbit_channel, &serde_json::to_vec(&event).unwrap())
            .await
    {
        eprintln!("⚠️  RabbitMQ publish failed: {e}");
    }

    Ok((id, validation))
}

async fn classify_and_update(
    repo: &TweetRepository,
    classify_client: &Arc<Mutex<ClassificationClient>>,
    blockchain_client: &Option<Arc<Mutex<BlockchainClient>>>,
    asset_client: &Option<Arc<Mutex<AssetClient>>>,
    id: &str,
    tweet_id: &str,
    media_urls: &[String],
    text_class: &ClassificationDetail,
    location: &Option<Location>,
    paraphrased: &str,
) -> Result<(), String> {
    let result =
        classify::service::classify_media(classify_client, asset_client, media_urls).await?;

    let classification = ClassificationResult {
        text: text_class.clone(),
        image: ClassificationDetail {
            label: result.label.clone(),
            confidence: result.confidence,
        },
    };

    repo.update_classification(id, &classification)
        .await
        .map_err(|e| format!("MongoDB update classification failed: {e}"))?;

    // --- Record classification on blockchain (best-effort) ---
    if let Err(e) = record_on_blockchain(blockchain_client, tweet_id, &result, location).await {
        eprintln!("⚠️  Blockchain recording failed for tweet {tweet_id}: {e}");
    }

    // --- Create Issue document in MongoDB ---
    let issue_id = uuid::Uuid::new_v4().to_string();
    let issue = IssueDoc {
        id: issue_id.clone(),
        tweet_id: tweet_id.to_string(),
        issue_type: result.label.clone(),
        confidence: result.confidence,
        status: "open".to_string(),
        location: location.as_ref().map(|l| IssueLocation {
            lat: l.lat,
            lon: l.lon,
            address: l.address.clone(),
        }),
        paraphrased_text: paraphrased.to_string(),
        resolution: None,
        image_url: result.asset_url.clone(),
        created_at: chrono::Utc::now().timestamp(),
        resolved_at: None,
    };
    if let Err(e) = repo.create_issue(issue).await {
        eprintln!("⚠️  Failed to create issue for tweet {tweet_id}: {e}");
    }

    Ok(())
}

/// Create an issue from NLP text classification only (no image).
async fn create_issue_from_text(
    repo: &TweetRepository,
    tweet_id: &str,
    text_class: &ClassificationDetail,
    location: &Option<Location>,
    paraphrased: &str,
) -> Result<(), String> {
    // Only create issue if confidence is reasonable
    if text_class.confidence < 0.5 {
        return Ok(());
    }

    let issue = IssueDoc {
        id: uuid::Uuid::new_v4().to_string(),
        tweet_id: tweet_id.to_string(),
        issue_type: text_class.label.clone(),
        confidence: text_class.confidence,
        status: "open".to_string(),
        location: location.as_ref().map(|l| IssueLocation {
            lat: l.lat,
            lon: l.lon,
            address: l.address.clone(),
        }),
        paraphrased_text: paraphrased.to_string(),
        resolution: None,
        image_url: String::new(),
        created_at: chrono::Utc::now().timestamp(),
        resolved_at: None,
    };
    repo.create_issue(issue)
        .await
        .map_err(|e| format!("MongoDB create_issue failed: {e}"))?;

    Ok(())
}

async fn record_on_blockchain(
    blockchain_client: &Option<Arc<Mutex<BlockchainClient>>>,
    tweet_id: &str,
    result: &classify::service::ClassifyResult,
    location: &Option<Location>,
) -> Result<(), String> {
    let client = blockchain_client
        .as_ref()
        .ok_or_else(|| "Blockchain disabled".to_string())?;

    let (lat, lon, address) = match location {
        Some(loc) => (loc.lat, loc.lon, loc.address.clone()),
        None => (0.0, 0.0, String::new()),
    };

    let mut guard = client.lock().await;
    guard
        .record_classification(
            tweet_id.to_string(),
            result.label.clone(),
            result.confidence,
            result.asset_url.clone(),
            lat,
            lon,
            address,
        )
        .await
        .map_err(|e| format!("Blockchain gRPC failed: {e}"))?;

    Ok(())
}
