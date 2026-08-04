from lib.config import Config

_client = None

def _get_client():
    global _client
    if _client is not None:
        return _client
    if not Config.IMAGEKIT_PRIVATE_KEY:
        return None
    try:
        from imagekitio import ImageKit
        # ponytail: base_url default ke api.imagekit.io — gak perlu di-set
        _client = ImageKit(
            private_key=Config.IMAGEKIT_PRIVATE_KEY,
        )
        return _client
    except Exception:
        return None

def upload_to_imagekit(file_bytes: bytes, filename: str = "image.webp") -> str:
    """Upload image to ImageKit CDN. Returns CDN URL or raises on failure."""
    client = _get_client()
    if not client:
        raise ValueError("ImageKit not configured")
    
    upload = client.files.upload(
        file=file_bytes,
        file_name=filename,
        use_unique_file_name=True,
        folder="/ecoguard/",
    )
    return upload.url
