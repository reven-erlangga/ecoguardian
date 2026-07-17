use crate::protos::blockchain::blockchain_service_client::BlockchainServiceClient;
use tonic::transport::Channel;

pub struct BlockchainClient {
    inner: BlockchainServiceClient<Channel>,
}

impl BlockchainClient {
    pub async fn new(addr: String) -> Result<Self, Box<dyn std::error::Error>> {
        let channel = Channel::from_shared(addr)?.connect().await?;
        Ok(Self {
            inner: BlockchainServiceClient::new(channel),
        })
    }

    pub async fn record_classification(
        &mut self,
        tweet_id: String,
        label: String,
        confidence: f32,
        image_hash: String,
        lat: f64,
        lon: f64,
        address: String,
    ) -> Result<crate::protos::blockchain::RecordResponse, tonic::Status> {
        let loc = crate::protos::blockchain::Location { lat, lon, address };
        let req = tonic::Request::new(crate::protos::blockchain::RecordClassificationRequest {
            tweet_id,
            label,
            confidence,
            image_hash,
            location: Some(loc),
        });
        self.inner
            .record_classification(req)
            .await
            .map(|r| r.into_inner())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invalid_uri_empty() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(BlockchainClient::new("".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_uri_garbage() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(BlockchainClient::new(":::garbage:::".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_valid_uri_format_but_unreachable() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(BlockchainClient::new("http://127.0.0.1:1".to_string()));
        assert!(result.is_err());
    }

    fn assert_send_sync<T: Send + Sync>() {}

    #[test]
    fn test_blockchain_client_is_send_sync() {
        assert_send_sync::<BlockchainClient>();
    }
}
