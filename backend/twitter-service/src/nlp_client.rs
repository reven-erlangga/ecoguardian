use crate::protos::nlp::nlp_service_client::NlpServiceClient;
use tonic::transport::Channel;

pub struct NlpClient {
    inner: NlpServiceClient<Channel>,
}

impl NlpClient {
    pub async fn new(addr: String) -> Result<Self, Box<dyn std::error::Error>> {
        let channel = Channel::from_shared(addr)?.connect().await?;
        Ok(Self {
            inner: NlpServiceClient::new(channel),
        })
    }

    pub async fn analyze_text(
        &mut self,
        text: String,
    ) -> Result<crate::protos::nlp::AnalyzeTextResponse, tonic::Status> {
        let request = tonic::Request::new(crate::protos::nlp::AnalyzeTextRequest { text });
        self.inner
            .analyze_text(request)
            .await
            .map(|r| r.into_inner())
    }

    pub async fn geocode(
        &mut self,
        address: String,
    ) -> Result<crate::protos::nlp::GeocodeResponse, tonic::Status> {
        let request = tonic::Request::new(crate::protos::nlp::GeocodeRequest { address });
        self.inner.geocode(request).await.map(|r| r.into_inner())
    }

    pub async fn generate_reply(
        &mut self,
        tweet_text: String,
        missing_fields: Vec<String>,
        classification_label: String,
        classification_confidence: f32,
    ) -> Result<crate::protos::nlp::GenerateReplyResponse, tonic::Status> {
        let request = tonic::Request::new(crate::protos::nlp::GenerateReplyRequest {
            tweet_text,
            missing_fields,
            classification_label,
            classification_confidence,
        });
        self.inner.generate_reply(request).await.map(|r| r.into_inner())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invalid_uri_empty() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(NlpClient::new("".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_uri_garbage() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(NlpClient::new(":::garbage:::".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_valid_uri_format_but_unreachable() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(NlpClient::new("http://127.0.0.1:1".to_string()));
        assert!(result.is_err());
    }

    fn assert_send_sync<T: Send + Sync>() {}

    #[test]
    fn test_nlp_client_is_send_sync() {
        assert_send_sync::<NlpClient>();
    }
}
