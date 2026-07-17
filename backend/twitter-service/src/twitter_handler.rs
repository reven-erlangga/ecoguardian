use std::sync::Arc;
use tonic::{Request, Response, Status};

use crate::ingest::repository::TweetRepository;
use crate::ingest::service;
use crate::protos::common::PaginationResponse;
use crate::protos::twitter::{
    twitter_service_server::TwitterService, GetTweetRequest, IngestTweetRequest,
    IngestTweetResponse, QueryTweetsRequest, QueryTweetsResponse, Tweet,
};
use crate::query::repository::{QueryFilters, TweetQueryRepo};
use crate::AppState;

/// Helper: convert chrono DateTime to common.Timestamp
fn to_timestamp(dt: &chrono::DateTime<chrono::Utc>) -> crate::protos::common::Timestamp {
    crate::protos::common::Timestamp {
        seconds: dt.timestamp(),
        nanos: dt.timestamp_subsec_nanos() as i32,
    }
}

#[tonic::async_trait]
impl TwitterService for Arc<AppState> {
    async fn ingest_tweet(
        &self,
        request: Request<IngestTweetRequest>,
    ) -> Result<Response<IngestTweetResponse>, Status> {
        let req = request.into_inner();
        let repo = TweetRepository::new(&self.db);

        let id = service::ingest_tweet(
            &repo,
            &self.rabbit_channel,
            &self.classify_client,
            &self.nlp_client,
            &self.blockchain_client,
            &req,
        )
        .await
        .map_err(|e| Status::internal(e))?;

        Ok(Response::new(IngestTweetResponse { id }))
    }

    async fn get_tweet(
        &self,
        request: Request<GetTweetRequest>,
    ) -> Result<Response<Tweet>, Status> {
        let req = request.into_inner();
        let repo = TweetQueryRepo::new(&self.db);

        let doc = repo
            .find_by_id(&req.id)
            .await
            .map_err(|e| Status::internal(format!("MongoDB query failed: {e}")))?
            .ok_or_else(|| Status::not_found("tweet not found"))?;

        let tweet = Tweet {
            id: doc.id,
            tweet_id: doc.tweet_id,
            text: doc.paraphrased_text,
            author: doc.author,
            author_username: doc.author_username,
            media_urls: doc.media_urls,
            created_at: Some(to_timestamp(&doc.created_at)),
            metadata: doc.metadata,
        };

        Ok(Response::new(tweet))
    }

    async fn query_tweets(
        &self,
        request: Request<QueryTweetsRequest>,
    ) -> Result<Response<QueryTweetsResponse>, Status> {
        let req = request.into_inner();
        let repo = TweetQueryRepo::new(&self.db);

        let default_page = 1;
        let default_per_page = 20;

        let page = req
            .pagination
            .as_ref()
            .map(|p| p.page)
            .filter(|&p| p > 0)
            .unwrap_or(default_page);

        let per_page = req
            .pagination
            .as_ref()
            .map(|p| p.per_page)
            .filter(|&p| p > 0)
            .unwrap_or(default_per_page);

        let start_date = req
            .start_date
            .as_ref()
            .and_then(|ts| chrono::DateTime::from_timestamp(ts.seconds, ts.nanos as u32));

        let end_date = req
            .end_date
            .as_ref()
            .and_then(|ts| chrono::DateTime::from_timestamp(ts.seconds, ts.nanos as u32));

        let filters = QueryFilters {
            author: if req.author.is_empty() {
                None
            } else {
                Some(req.author.clone())
            },
            keyword: if req.keyword.is_empty() {
                None
            } else {
                Some(req.keyword.clone())
            },
            classification_label: if req.classification_label.is_empty() {
                None
            } else {
                Some(req.classification_label.clone())
            },
            start_date,
            end_date,
            page: page as u64,
            per_page: per_page as u64,
        };

        let (docs, total) = repo
            .query(&filters)
            .await
            .map_err(|e| Status::internal(format!("MongoDB query failed: {e}")))?;

        let tweets: Vec<Tweet> = docs
            .into_iter()
            .map(|doc| Tweet {
                id: doc.id,
                tweet_id: doc.tweet_id,
                text: doc.paraphrased_text,
                author: doc.author,
                author_username: doc.author_username,
                media_urls: doc.media_urls,
                created_at: Some(to_timestamp(&doc.created_at)),
                metadata: doc.metadata,
            })
            .collect();

        Ok(Response::new(QueryTweetsResponse {
            tweets,
            pagination: Some(PaginationResponse {
                page,
                per_page,
                total: total as i32,
            }),
        }))
    }
}
