use crate::protos::asset::asset_service_client::AssetServiceClient;
use tonic::transport::Channel;

pub struct AssetClient {
    inner: AssetServiceClient<Channel>,
}

impl AssetClient {
    pub async fn new(addr: String) -> Result<Self, Box<dyn std::error::Error>> {
        let channel = Channel::from_shared(addr)?.connect().await?;
        Ok(Self {
            inner: AssetServiceClient::new(channel),
        })
    }

    pub async fn upload(
        &mut self,
        data: Vec<u8>,
        filename: String,
        mime_type: String,
    ) -> Result<String, tonic::Status> {
        let request = tonic::Request::new(crate::protos::asset::UploadAssetRequest {
            filename,
            data,
            mime_type,
            metadata: String::new(),
        });
        let resp = self.inner.upload_asset(request).await?.into_inner();
        Ok(resp.asset.unwrap_or_default().url)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invalid_uri_empty() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(AssetClient::new("".to_string()));
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_uri_garbage() {
        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(AssetClient::new(":::garbage:::".to_string()));
        assert!(result.is_err());
    }

    fn assert_send_sync<T: Send + Sync>() {}

    #[test]
    fn test_asset_client_is_send_sync() {
        assert_send_sync::<AssetClient>();
    }
}
