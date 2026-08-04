import io
from PIL import Image
from lib.config import Config

def compress_image(
    file_bytes: bytes,
    max_width: int = 0,
    quality: int = 0,
    output_format: str = "webp"
) -> bytes:
    """
    Compress, resize, and convert an image to optimized format.
    Returns optimized bytes.
    
    Args:
        file_bytes: Raw image bytes
        max_width: Max width in px (default: Config.MAX_IMAGE_WIDTH=1200, 0 = no resize)
        quality: Output quality 1-100 (default: Config.WEBP_QUALITY=80)
        output_format: 'webp', 'jpeg', 'png'
    """
    max_width = max_width or Config.MAX_IMAGE_WIDTH
    quality = quality or Config.WEBP_QUALITY
    
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    
    # Resize if wider than max_width (maintain aspect ratio)
    if img.width > max_width:
        ratio = max_width / img.width
        new_h = int(img.height * ratio)
        img = img.resize((max_width, new_h), Image.LANCZOS)
    
    output = io.BytesIO()
    save_format = "WEBP" if output_format == "webp" else output_format.upper()
    img.save(output, format=save_format, quality=quality)
    return output.getvalue()
