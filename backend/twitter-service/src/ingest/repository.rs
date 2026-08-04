use mongodb::bson::{self, doc};
use mongodb::{Collection, Database};

use crate::common::mongo::{ClassificationResult, IssueDoc, TweetDoc};

pub struct TweetRepository {
    collection: Collection<TweetDoc>,
    pub db: Database,
}

impl TweetRepository {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection::<TweetDoc>("tweets"),
            db: db.clone(),
        }
    }

    /// Insert a new tweet document, assigning a UUID as `_id`.
    /// Returns the generated id string.
    pub async fn insert(&self, mut tweet: TweetDoc) -> Result<String, mongodb::error::Error> {
        tweet.id = uuid::Uuid::new_v4().to_string();
        self.collection.insert_one(&tweet).await?;
        Ok(tweet.id)
    }

    /// Find a tweet by its external tweet_id (for parent-child tracking).
    pub async fn find_by_tweet_id(
        &self,
        tweet_id: &str,
    ) -> Result<Option<TweetDoc>, mongodb::error::Error> {
        self.collection
            .find_one(doc! { "tweet_id": tweet_id })
            .await
    }

    /// Update classification and metadata on an existing tweet.
    pub async fn update_classification(
        &self,
        id: &str,
        classification: &ClassificationResult,
    ) -> Result<(), mongodb::error::Error> {
        self.collection
            .update_one(
                doc! { "_id": id },
                doc! { "$set": { "classification": bson::to_bson(&classification).unwrap() } },
            )
            .await?;
        Ok(())
    }

    /// Update tweet fields (used when merging child data into parent).
    pub async fn update_fields(
        &self,
        id: &str,
        fields: mongodb::bson::Document,
    ) -> Result<(), mongodb::error::Error> {
        self.collection
            .update_one(doc! { "_id": id }, doc! { "$set": fields })
            .await?;
        Ok(())
    }

    /// Insert a new issue document after classification.
    pub async fn create_issue(&self, issue: IssueDoc) -> Result<(), mongodb::error::Error> {
        let col = crate::common::mongo::issues_collection(&self.db);
        col.insert_one(&issue).await?;
        Ok(())
    }

    /// Get a reference to the underlying database (for creating sibling repositories).
    pub fn database(&self) -> &Database {
        &self.db
    }
}
