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

# ponytail: works without GPU/transformers
KEYWORDS = {
    "fallen_tree": [
        "pohon tumbang",
        "dahan patah",
        "pohon roboh",
        "ranting",
        "batang",
    ],
    "garbage": [
        "sampah",
        "tps",
        "limbah",
        "bau",
        "kotor",
        "tumpukan sampah",
    ],
    "vandalism": [
        "coret",
        "grafiti",
        "vandal",
        "rusak",
        "pecah",
        "bongkar",
    ],
}

LABELS = ["fallen_tree", "garbage", "vandalism"]


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
        return ("fallen_tree", 0.0)  # unknown → default

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
        return ("fallen_tree", 0.0)

    best = max(label_map, key=label_map.get)
    return (best, label_map[best])


def classify(text: str) -> tuple:
    """Classify text into one of: fallen_tree, garbage, vandalism.

    Returns (label: str, confidence: float).
    """
    if classifier is not None:
        return _classify_transformers(text)
    return _classify_keyword(text)
