"""Text preprocessing untuk laporan teks (tweet).

Tahapan:
  1. data cleaning  — hapus mention, tagar, URL, tanda baca, angka, spasi ganda
  2. case folding   — samakan semua huruf menjadi huruf kecil
  3. tokenizing     — pecah teks menjadi token (kata)
  4. stopword removal — hapus kata umum yang kurang berpengaruh

Output berupa string hasil bersih (token digabung spasi) dan list token.
"""

import re

# Stopword bahasa Indonesia (subset umum). Lista lengkap bisa ditambah
# dari pustaka seperti Sastrawi bila tersedia.
STOPWORDS = set(
    """
    yang dan di ke dari pada untuk dengan tidak ini itu adalah akan ada sudah
    juga atau tapi karena jika kalau saya kamu kita mereka dia kami anda
    sebagai secara bahwa oleh dalam sebuah suatu para terhadap bisa dapat
    telah sedang masih sangat lebih kurang paling harus mau ingin laporan
    ada nya tersebut saat sejak sampai karena segera tolong mohon kasih
    pake pakai semua selalu yaitu yak yaknya oke ok ya sudah aku
    """.split()
)

# Elemen yang dihapus pada data cleaning.
_MENTION_RE = re.compile(r"@\w+")
_HASHTAG_RE = re.compile(r"#\w+")
_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_NON_ALPHA_RE = re.compile(r"[^a-zA-Z\s]")  # hapus non-huruf (angka, tanda baca)


def clean_text(text: str) -> str:
    """Data cleaning: hapus mention, tagar, URL, simbol/non-huruf, spasi ganda."""
    text = _MENTION_RE.sub(" ", text)
    text = _HASHTAG_RE.sub(" ", text)
    text = _URL_RE.sub(" ", text)
    text = _NON_ALPHA_RE.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def case_fold(text: str) -> str:
    """Case folding: samakan ke huruf kecil."""
    return text.lower()


def tokenize(text: str) -> list:
    """Tokenisasi: pecah teks menjadi list kata."""
    return text.split()


def remove_stopwords(tokens: list) -> list:
    """Stopword removal: hapus token yang termasuk daftar stopword."""
    return [t for t in tokens if t not in STOPWORDS and t]


def preprocess(text: str) -> dict:
    """Jalankan seluruh tahapan preprocessing.

    Returns:
        dict dengan kunci:
          - raw        : teks asli
          - cleaned    : hasil data cleaning + case folding
          - tokens     : list token (setelah stopword removal)
          - text       : string hasil akhir (tokens digabung spasi)
    """
    cleaned = clean_text(text)
    cleaned = case_fold(cleaned)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    return {
        "raw": text,
        "cleaned": cleaned,
        "tokens": tokens,
        "text": " ".join(tokens),
    }
