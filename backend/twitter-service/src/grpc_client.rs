use crate::protos::classification::classification_service_client::ClassificationServiceClient;
use tonic::transport::Channel;

pub struct ClassificationClient {
    inner: ClassificationServiceClient<Channel>,
}

impl ClassificationClient {
    pub async fn new(addr: String) -> Result<Self, Box<dyn std::error::Error>> {
        let channel = Channel::from_shared(addr)?.connect().await?;
        Ok(Self {
            inner: ClassificationServiceClient::new(channel),
        })
    }

    pub async fn classify(
        &mut self,
        image_data: Vec<u8>,
        image_format: String,
        tweet_id: Option<String>,
    ) -> Result<crate::protos::classification::ClassifyImageResponse, tonic::Status> {
        let request = tonic::Request::new(crate::protos::classification::ClassifyImageRequest {
            image_data,
            image_format,
            tweet_id: tweet_id.unwrap_or_default(),
        });
        self.inner
            .classify_image(request)
            .await
            .map(|r| r.into_inner())
    }

    pub async fn classify_images(
        &mut self,
        images: Vec<(Vec<u8>, String)>,  // (data, format)
        tweet_id: Option<String>,
    ) -> Result<crate::protos::classification::ClassifyImagesResponse, tonic::Status> {
        let proto_images: Vec<crate::protos::classification::ImageData> = images
            .into_iter()
            .map(|(data, format)| crate::protos::classification::ImageData {
                image_data: data,
                image_format: format,
            })
            .collect();

        let request = tonic::Request::new(
            crate::protos::classification::ClassifyImagesRequest {
                images: proto_images,
                tweet_id: tweet_id.unwrap_or_default(),
            },
        );
        self.inner
            .classify_images(request)
            .await
            .map(|r| r.into_inner())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invalid_uri_empty() {
        // Empty string is not a valid gRPC URI; from_shared should fail
        // before connect() is ever attempted.
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(ClassificationClient::new("".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_uri_garbage() {
        // Completely invalid URI scheme/format
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(ClassificationClient::new(":::garbage:::".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_valid_uri_format_but_unreachable() {
        // URI parses OK (from_shared succeeds) but connect() fails because
        // nothing is listening. This verifies the full new() code path
        // without needing a real server.
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(ClassificationClient::new("http://127.0.0.1:1".to_string()));
        // Should fail at connect(), not at from_shared()
        assert!(result.is_err());
    }

    /// Verifies that ClassificationClient is Send + Sync so it can be
    /// wrapped in Arc<Mutex<>>.
    fn assert_send_sync<T: Send + Sync>() {}

    #[test]
    fn test_classification_client_is_send_sync() {
        assert_send_sync::<ClassificationClient>();
    }
}
