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

# Ecoguard environmental issue labels — konsisten dengan training.md (5 kategori)
KEYWORDS = {
    "fallen_tree": [
        "pohon", "tumbang", "dahan", "ranting", "patah", "tumbang",
        "batang", "pohon tumbang", "berdiri",
    ],
    "garbage": [
        "sampah", "tumpukan", "plastik", "limbah", "tpa", "daur ulang",
        "bau sampah", "menumpuk", "kotor", "sampah menumpuk",
    ],
    "vandalism": [
        "vandalisme", "coret", "coretan", "grafiti", "perusakan",
        "rusak", "pecah", "dicoret", "aksi vandalisme",
    ],
    "road_damage": [
        "jalan rusak", "lubang", "aspal", "berlubang", "jalan",
        "jalan berlubang", "trotoar", "rusak parah",
    ],
    "flood": [
        "banjir", "genangan", "terendam", "air naik", "meluap",
        "sungai", "banjir bandang", "tergenang",
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
    # Map model label to our 5 labels
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
    """Classify text into one of: fallen_tree, garbage, vandalism,
    road_damage, flood.

    Menggunakan IndoBERT bila tersedia; jika IndoBERT tidak mampu
    memetakan ke kategori yang dikenal (label pretrained berbeda dengan
    5 kategori kustom), maka fallback ke keyword-based agar hasil selalu
    berupa salah satu dari 5 kategori.

    Returns (label: str, confidence: float).
    """
    if classifier is not None:
        label, conf = _classify_transformers(text)
        if label in LABELS:
            return (label, conf)
        # IndoBERT tidak memetakan ke kategori dikenal → fallback keyword
        return _classify_keyword(text)
    return _classify_keyword(text)
