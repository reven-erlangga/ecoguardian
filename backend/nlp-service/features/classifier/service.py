"""
IndoBERT text classification for ecoguard labels.

Tries to load IndoBERT via transformers. Falls back to keyword-based
classification when transformers/torch are not installed.

Labels: fallen_tree, garbage, vandalism
"""

try:
    from transformers import pipeline

    classifier = pipeline(
        "text-classification", model="indobenchmark/indobert-base-p1"
    )
    print("✅ IndoBERT loaded: indobenchmark/indobert-base-p1")
except Exception:
    classifier = None
    print("⚠️ IndoBERT not available, using keyword-based fallback")

# Ecoguard environmental issue labels
KEYWORDS = {
    "deforestation": [
        "hutan", "pohon", "gundul", "tebang", "sawit", "logging",
        "deforestasi", "mangrove", "kebakaran hutan", "pembalakan", "taman nasional",
    ],
    "water_pollution": [
        "limbah", "sungai", "tercemar", "pencemaran", "tumpahan",
        "minyak", "kali", "cemar", "laut tercemar", "air kotor", "teluk",
    ],
    "air_pollution": [
        "asap", "udara", "polusi", "pm2.5", "ispu", "kabut",
        "karbon", "emisi", "terbakar", "kebakaran",
    ],
    "illegal_mining": [
        "tambang", "galian", "emas", "batubara", "nikel", "mineral",
        "merkuri", "tambang ilegal",
    ],
    "wildlife_trafficking": [
        "satwa", "burung", "penyelundupan", "cula", "gading",
        "harimau", "orangutan", "dilindungi", "cenderawasih",
    ],
    "coral_bleaching": [
        "karang", "reef", "pemutihan", "bleaching", "coral", "terumbu",
    ],
    "coastal_erosion": [
        "abrasi", "pantai", "erosi", "garis pantai", "surut",
    ],
    "waste_management": [
        "sampah", "tpa", "plastik", "limbah padat", "daur ulang", "bau sampah",
    ],
}

LABELS = list(KEYWORDS.keys())


def _classify_keyword(text: str) -> tuple:
    """Keyword-based fallback classifier.

    Returns (label, confidence) where confidence is a heuristic score.
    """
    text_lower = text.lower()
    scores = {}
    for label, keywords in KEYWORDS.items():
        scores[label] = sum(1 for kw in keywords if kw in text_lower)

    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return ("environmental_issue", 0.0)  # unknown → default

    confidence = min(scores[best] / 3.0, 0.95)
    return (best, confidence)


def _classify_transformers(text: str) -> tuple:
    """Classify using IndoBERT pipeline."""
    result = classifier(text, top_k=None)

    # pipeline returns list of dicts: [{"label": ..., "score": ...}, ...]
    # Map model label to our 3 labels
    label_map = {}
    for r in result:
        raw = r["label"].lower()
        for ours in LABELS:
            if ours in raw or raw in ours:
                label_map[ours] = r["score"]

    if not label_map:
        return ("environmental_issue", 0.0)

    best = max(label_map, key=label_map.get)
    return (best, label_map[best])


def classify(text: str) -> tuple:
    """Classify text into one of: fallen_tree, garbage, vandalism.

    Returns (label: str, confidence: float).
    """
    if classifier is not None:
        return _classify_transformers(text)
    return _classify_keyword(text)
