import io
import os
from PIL import Image
from lib.config import Config

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

def validate_image(file_bytes: bytes, filename: str = "") -> tuple[bool, str]:
    """Returns (is_valid, error_message)."""
    # Size check
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > Config.MAX_FILE_SIZE_MB:
        return False, f"File terlalu besar ({size_mb:.1f}MB, max {Config.MAX_FILE_SIZE_MB}MB)"
    
    # Extension check
    ext = os.path.splitext(filename)[1].lower()
    if ext and ext not in ALLOWED_EXTENSIONS:
        return False, f"Format file tidak didukung ({ext})"
    
    # PIL validation
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
    except Exception as e:
        return False, f"File bukan gambar valid: {e}"
    
    return True, ""
