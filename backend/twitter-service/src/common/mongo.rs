use chrono::{DateTime, Utc};
use mongodb::bson::doc;
use mongodb::{Client, Collection, Database};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Geocoded location from NLP service.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub address: String,
    pub lat: f64,
    pub lon: f64,
    pub display_name: String,
}

/// Single classification result (label + confidence).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassificationDetail {
    pub label: String,
    pub confidence: f32,
}

/// Combined classification from NLP (text) and Classification Service (image).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassificationResult {
    pub text: ClassificationDetail,
    pub image: ClassificationDetail,
}

/// Tweet document stored in MongoDB.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TweetDoc {
    #[serde(rename = "_id")]
    pub id: String,
    pub tweet_id: String,
    pub paraphrased_text: String,
    pub text: Option<String>,
    pub author: String,
    pub author_username: String,
    pub media_urls: Vec<String>,
    pub location: Option<Location>,
    pub classification: Option<ClassificationResult>,
    pub created_at: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
    pub parent_tweet_id: Option<String>,       // reply chain tracking
    pub has_images: bool,
    pub has_location: bool,
    pub validation_status: Vec<String>,         // "needs_images", "needs_location", "ok"
}

// ─── Issue document (auto-created after classification) ───────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueLocation {
    pub lat: f64,
    pub lon: f64,
    pub address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueResolution {
    pub admin_id: String,
    pub notes: String,
    #[serde(rename = "image_hash")]
    pub image_url: String,
    pub resolved_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IssueDoc {
    #[serde(rename = "_id")]
    pub id: String,
    pub tweet_id: String,
    #[serde(rename = "type")]
    pub issue_type: String,
    pub confidence: f32,
    pub status: String,
    pub location: Option<IssueLocation>,
    pub paraphrased_text: String,
    pub resolution: Option<IssueResolution>,
    #[serde(rename = "image_hash")]
    pub image_url: String,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
}

/// Get the `issues` collection from a database handle.
pub fn issues_collection(db: &Database) -> Collection<IssueDoc> {
    db.collection::<IssueDoc>("issues")
}

/// Ensure indexes on the `issues` collection.
pub async fn ensure_issue_indexes(db: &Database) -> Result<(), mongodb::error::Error> {
    use mongodb::IndexModel;
    let collection = issues_collection(db);
    collection
        .create_indexes(vec![
            IndexModel::builder().keys(doc! { "tweet_id": 1 }).build(),
            IndexModel::builder().keys(doc! { "status": 1 }).build(),
            IndexModel::builder()
                .keys(doc! { "created_at": -1 })
                .build(),
        ])
        .await?;
    Ok(())
}

/// Open a connection and return the `ecoguard_twitter` database handle.
pub async fn connect_mongo(uri: &str) -> Result<Database, mongodb::error::Error> {
    let client = Client::with_uri_str(uri).await?;
    Ok(client.database("ecoguard_twitter"))
}
