"""
Indonesian address extraction from tweet text.

Regex-based approach — no model needed.
"""

import re

# Pattern umum alamat Indonesia
# ponytail: simple regex, no model needed
PATTERNS = [
    # Jalan / Gang + nama + optional nomor
    r"(?:di\s+)?(?:Jalan|Jl\.?|Gang|Gg\.?)\s+[A-Z][A-Za-z\s.]+(?:\s+(?:No\.?|nomor)\s*\d+)?",
    # Administrative divisions
    r"(?:di\s+)?(?:Desa|Kelurahan|Kecamatan|Kota|Kabupaten)\s+[A-Z][A-Za-z\s]+",
    # Kampung
    r"(?:di\s+)?Kp\.?\s+[A-Z][A-Za-z\s]+",
    # Dusun / RT / RW
    r"(?:di\s+)?(?:Dusun|Rt|Rw)\s+[\d/]+",
    # Named roads ending with Raya / Besar / Dalam
    r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Raya|Besar|Dalam)\b",
]


def extract_address(text: str) -> str:
    """Extract the first address found in *text*.

    Returns the address string, or empty string if none is found.
    """
    for pattern in PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            addr = match.group(0).strip()
            # Strip leading "di " if present
            if addr.lower().startswith("di "):
                addr = addr[3:]
            return addr
    return ""
