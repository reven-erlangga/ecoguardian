use chrono::{DateTime, Utc};
use futures::stream::TryStreamExt;
use mongodb::bson::{self, doc};
use mongodb::{Collection, Database};

use crate::common::mongo::TweetDoc;

pub struct TweetQueryRepo {
    collection: Collection<TweetDoc>,
}

pub struct QueryFilters {
    pub author: Option<String>,
    pub keyword: Option<String>,
    pub classification_label: Option<String>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub page: u64,
    pub per_page: u64,
}

impl TweetQueryRepo {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection::<TweetDoc>("tweets"),
        }
    }

    /// Find a single tweet by its `_id`.
    pub async fn find_by_id(&self, id: &str) -> Result<Option<TweetDoc>, mongodb::error::Error> {
        self.collection.find_one(doc! { "_id": id }).await
    }

    /// Query tweets with optional filters + pagination.
    /// Returns (tweets, total_count).
    pub async fn query(
        &self,
        filters: &QueryFilters,
    ) -> Result<(Vec<TweetDoc>, u64), mongodb::error::Error> {
        let mut filter = doc! {};

        if let Some(author) = &filters.author {
            filter.insert("author", author);
        }

        if let Some(keyword) = &filters.keyword {
            // ponytail: simple regex search instead of a text index
            filter.insert(
                "paraphrased_text",
                doc! { "$regex": keyword, "$options": "i" },
            );
        }

        if let Some(label) = &filters.classification_label {
            filter.insert("classification.label", label);
        }

        // Build date range
        let mut date_filter = doc! {};
        if let Some(start) = &filters.start_date {
            date_filter.insert(
                "$gte",
                bson::DateTime::from_millis(start.timestamp_millis()),
            );
        }
        if let Some(end) = &filters.end_date {
            date_filter.insert("$lte", bson::DateTime::from_millis(end.timestamp_millis()));
        }
        if !date_filter.is_empty() {
            filter.insert("created_at", date_filter);
        }

        // Count total matching documents
        let total = self.collection.count_documents(filter.clone()).await?;

        // Fetch page
        let skip = (filters.page.saturating_sub(1)) * filters.per_page;
        let mut cursor = self
            .collection
            .find(filter)
            .skip(skip)
            .limit(filters.per_page as i64)
            .sort(doc! { "created_at": -1 })
            .await?;

        let mut tweets = Vec::new();
        while let Some(tweet) = cursor.try_next().await? {
            tweets.push(tweet);
        }

        Ok((tweets, total))
    }
}
