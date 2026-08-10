import os

def _resolve(key: str, fallback: str = "") -> str:
    return os.getenv(key) or fallback

class Config:
    IMAGEKIT_PUBLIC_KEY = _resolve("IMAGEKIT_PUBLIC_KEY")
    IMAGEKIT_PRIVATE_KEY = _resolve("IMAGEKIT_PRIVATE_KEY")
    IMAGEKIT_URL_ENDPOINT = _resolve("IMAGEKIT_URL_ENDPOINT")
    
    ASSET_GRPC_PORT = int(os.getenv("ASSET_GRPC_PORT", "50058"))
    ASSET_HTTP_PORT = int(os.getenv("ASSET_HTTP_PORT", "8088"))
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_IMAGE_WIDTH = int(os.getenv("MAX_IMAGE_WIDTH", "1200"))
    WEBP_QUALITY = int(os.getenv("WEBP_QUALITY", "80"))
