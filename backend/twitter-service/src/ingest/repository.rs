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

    /// Update the classification field on an existing tweet.
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
