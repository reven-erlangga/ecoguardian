"""Paraphrase generator berbasis model T5 bahasa Indonesia (multilingual).

Mencoba memuat model generatif T5/mT5 bahasa Indonesia via `transformers`
(text2text-generation) untuk menghasilkan ulang teks laporan. Bila tidak
tersedia, fallback ke template-based agar service selalu berfungsi.

Model aktif dipilih dari env `PARAPHRASE_MODEL` (bawaan:
`google/mt5-small`, T5 multibahasa yang mencakup bahasa Indonesia).
"""

import os

try:
    from transformers import pipeline

    _model = os.environ.get("PARAPHRASE_MODEL", "google/mt5-small")
    paraphrase_model = pipeline("text2text-generation", model=_model)
    print(f"✅ Paraphrase model loaded: {_model}")
except Exception:
    paraphrase_model = None
    print("⚠️ Paraphrase model not available, using template fallback")

# Fallback template — laporan formal (tidak menampilkan isi tweet asli)
TEMPLATES = {
    "fallen_tree": "Pengguna melaporkan adanya pohon tumbang di {lokasi}.",
    "garbage": "Pengguna melaporkan adanya tumpukan sampah di {lokasi}.",
    "vandalism": "Pengguna melaporkan terjadinya aksi vandalisme di {lokasi}.",
    "road_damage": "Pengguna melaporkan adanya kerusakan jalan di {lokasi}.",
    "flood": "Pengguna melaporkan terjadinya banjir di {lokasi}.",
}

DEFAULT_TEMPLATE = "Pengguna melaporkan suatu kejadian di {lokasi}."


def _template_fallback(label: str, address: str) -> str:
    lokasi = address if address else "lokasi yang tidak disebutkan"
    template = TEMPLATES.get(label, DEFAULT_TEMPLATE)
    return template.format(lokasi=lokasi)


def paraphrase(text: str, label: str, address: str) -> str:
    """Hasilkan teks paraphrase untuk laporan.

    Args:
        text: Teks laporan asli (input untuk model).
        label: Kategori isu (fallen_tree, garbage, vandalism, ...).
        address: Alamat hasil ekstraksi (boleh kosong).

    Returns:
        String hasil paraphrase.
    """
    if paraphrase_model is not None and text and text.strip():
        try:
            result = paraphrase_model(
                text, max_new_tokens=64, num_return_sequences=1
            )
            out = result[0]["generated_text"].strip()
            # Tolak output tak layak: placeholder <extra_id_*>, kosong, terlalu
            # pendek (<2 kata), atau mengulang input. Fallback ke template agar
            # laporan formal selalu valid.
            if (
                out
                and "<extra_id" not in out
                and len(out) < 300
                and len(out.split()) >= 2
                and out.lower() != text.lower()
            ):
                return out
        except Exception:
            pass  # fallback ke template bila model gagal
    return _template_fallback(label, address)
