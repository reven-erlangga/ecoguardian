use chrono::Utc;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

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

/// Orchestrate the tweet-ingest flow: NLP → geocode → classify image → save → publish.
pub async fn ingest_tweet(
    repo: &TweetRepository,
    rabbit_channel: &lapin::Channel,
    classify_client: &Arc<Mutex<ClassificationClient>>,
    nlp_client: &Arc<Mutex<NlpClient>>,
    blockchain_client: &Option<Arc<Mutex<BlockchainClient>>>,
    req: &IngestTweetRequest,
) -> Result<String, String> {
    let created_at = if let Some(ts) = &req.created_at {
        chrono::DateTime::from_timestamp(ts.seconds, ts.nanos as u32).unwrap_or_else(|| Utc::now())
    } else {
        Utc::now()
    };

    // --- Step 1: NLP AnalyzeText ---
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

    // --- Step 2: Geocode if address found ---
    let location = if !extracted_address.is_empty() {
        let mut guard = nlp_client.lock().await;
        match guard.geocode(extracted_address.clone()).await {
            Ok(geo) => Some(Location {
                address: extracted_address,
                lat: geo.lat,
                lon: geo.lon,
                display_name: geo.display_name,
            }),
            Err(e) => {
                eprintln!("⚠️  Geocode failed for address: {e}");
                None
            }
        }
    } else {
        None
    };

    let blockchain_location = location.clone();

    let paraphrased_clone = paraphrased_text.clone();

    let tweet = TweetDoc {
        id: String::new(),
        tweet_id: req.tweet_id.clone(),
        paraphrased_text,
        text: None, // don't store raw tweet text
        author: req.author.clone(),
        author_username: req.author_username.clone(),
        media_urls: req.media_urls.clone(),
        location,
        classification: None,
        created_at,
        metadata: HashMap::from_iter(req.metadata.clone()),
    };

    let id = repo
        .insert(tweet)
        .await
        .map_err(|e| format!("MongoDB insert failed: {e}"))?;

    // --- Step 3: If tweet has media, classify image asynchronously ---
    if !req.media_urls.is_empty() {
        let id_clone = id.clone();
        let tweet_id_clone = req.tweet_id.clone();
        let db_clone = repo.database().clone();
        let classify_client = classify_client.clone();
        let blockchain_client = blockchain_client.clone();
        let media_urls = req.media_urls.clone();
        let text_class = text_classification;
        let loc = blockchain_location;
        let paraph = paraphrased_clone;

        tokio::spawn(async move {
            let repo_clone = TweetRepository::new(&db_clone);
            if let Err(e) = classify_and_update(
                &repo_clone,
                &classify_client,
                &blockchain_client,
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

    // --- Step 4: Publish event (best-effort) ---
    let event = serde_json::json!({ "id": id, "tweet_id": req.tweet_id });
    if let Err(e) =
        publisher::publish_tweet_ingested(rabbit_channel, &serde_json::to_vec(&event).unwrap())
            .await
    {
        eprintln!("⚠️  RabbitMQ publish failed: {e}");
    }

    Ok(id)
}

async fn classify_and_update(
    repo: &TweetRepository,
    classify_client: &Arc<Mutex<ClassificationClient>>,
    blockchain_client: &Option<Arc<Mutex<BlockchainClient>>>,
    id: &str,
    tweet_id: &str,
    media_urls: &[String],
    text_class: &ClassificationDetail,
    location: &Option<Location>,
    paraphrased: &str,
) -> Result<(), String> {
    let result = classify::service::classify_media(classify_client, media_urls).await?;

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
        image_hash: result.image_hash.clone(),
        created_at: chrono::Utc::now().timestamp(),
        resolved_at: None,
    };
    if let Err(e) = repo.create_issue(issue).await {
        eprintln!("⚠️  Failed to create issue for tweet {tweet_id}: {e}");
    }

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
            result.image_hash.clone(),
            lat,
            lon,
            address,
        )
        .await
        .map_err(|e| format!("Blockchain gRPC failed: {e}"))?;

    Ok(())
}
