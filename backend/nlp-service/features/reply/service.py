"""
Natural reply generator for Twitter auto-reply.

Generates santai (casual, friendly) Indonesian responses based on
what's missing in the tweet report. Uses varied templates so replies
don't sound robotic.
"""

import random

# ─── Natural reply templates ──────────────────────────────

MEDIA_TEMPLATES = [
    "Halo! Laporannya udah diterima nih. Tapi biar makin jelas, boleh kirim foto/gambarnya juga? 📸",
    "Makasih laporannya! Kalau bisa ditambahin foto biar kami makin paham situasinya 😊",
    "Noted! Tapi foto lokasinya belum ada nih. Bisa upload gambar biar lebih greget laporannya?",
    "Laporan kamu udah masuk. Sayangnya tanpa gambar jadi agak susah divalidasi. Kirimin fotonya dong! 👍",
    "Hai! Terima kasih sudah lapor. Untuk membantu klasifikasi, mohon sertakan gambar ya!",
]

LOCATION_TEMPLATES = [
    "Lokasinya di mana ya? Boleh kasih alamat atau titik koordinat biar kami bisa tindaklanjutin 🙏",
    "Makasih infonya! Tapi lokasi spesifiknya belum ada. Coba deskripsikan tempatnya lebih detail 📍",
    "Wah lokasinya belum disebut tuh. Di mana kira-kira tempat kejadiannya?",
    "Laporanmu penting! Tapi kami butuh lokasi yang lebih jelas biar tim kami bisa cek langsung.",
    "Alamatnya boleh disebut? Biar nggak salah sasaran pas ditindaklanjuti 😁",
]

CLASSIFICATION_LOW_TEMPLATES = [
    "Hasil klasifikasi gambar menunjukkan {label}, tapi dengan keyakinan yang masih rendah ({confidence}%). Mungkin bisa kirim foto lain yang lebih jelas? 🔍",
    "Foto yang dikirim kurang jelas nih. Kami deteksi sebagai {label} tapi masih ragu. Coba kirim ulang dengan angle yang berbeda!",
    "Gambar terlihat seperti {label}, tapi kami belum yakin. Bisa upload foto tambahan dari sudut lain?",
]

CLASSIFICATION_SUCCESS_TEMPLATES = [
    "Terima kasih! Gambar yang dikirim menunjukkan **{label}** dengan keyakinan {confidence}%. Laporan akan segera ditindaklanjuti 🚀",
    "Noted! Berdasarkan gambar, ini adalah kasus **{label}** (keyakinan {confidence}%). Tim kami akan proses secepatnya!",
]

UNKNOWN_TEMPLATE = [
    "Halo! Laporan kamu sudah masuk. Ada yang bisa kami bantu lebih lanjut? 😊",
]


def _pick(templates: list, **kwargs) -> str:
    """Pick random template and format with kwargs."""
    return random.choice(templates).format(**kwargs)


def generate_reply(
    tweet_text: str,
    missing_fields: list,
    classification_label: str,
    classification_confidence: float,
) -> str:
    """Generate a natural, casual Indonesian reply based on context."""
    parts = []

    # 1. Handle missing fields (media, location)
    for field in missing_fields:
        if field == "media":
            parts.append(_pick(MEDIA_TEMPLATES))
        elif field == "location":
            parts.append(_pick(LOCATION_TEMPLATES))

    # 2. Classification result feedback
    if classification_label and classification_label != "unknown":
        if classification_confidence < 0.6:
            parts.append(
                _pick(
                    CLASSIFICATION_LOW_TEMPLATES,
                    label=classification_label,
                    confidence=round(classification_confidence * 100),
                )
            )
        elif classification_confidence >= 0.6 and not missing_fields:
            # Only show success if nothing else is missing
            parts.append(
                _pick(
                    CLASSIFICATION_SUCCESS_TEMPLATES,
                    label=classification_label,
                    confidence=round(classification_confidence * 100),
                )
            )

    # 3. Fallback
    if not parts:
        parts.append(_pick(UNKNOWN_TEMPLATE))

    return " ".join(parts)
