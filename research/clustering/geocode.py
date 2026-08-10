"""Reverse geocoding via OpenStreetMap Nominatim untuk penamaan klaster.

Mengubah koordinat (lat, lon) menjadi nama daerah (kota/kabupaten) yang
mewakili. Menghormati kebijakan Nominatim: maksimal 1 permintaan per detik
dan menyertakan User-Agent yang jelas.

Hanya pakai pustaka standar (urllib) — tanpa dependensi tambahan.
"""

import json
import time
import urllib.parse
import urllib.request

import numpy as np

NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
USER_AGENT = "ecoguardian-research-clustering/1.0 (final-year student research project)"
MIN_INTERVAL = 1.1  # detik antar permintaan (kebijakan Nominatim: maks 1 req/detik)

_cache = {}
_last_call = 0.0


def reverse_geocode(lat, lon, zoom=10, timeout=15):
    """Nama tempat utk koordinat (lat, lon) via Nominatim /reverse.

    Prioritas nama: city -> town -> village -> municipality -> county ->
    state_district -> name -> bagian pertama display_name.
    Mengembalikan None bila gagal (offline / diblokir / tidak ditemukan).
    """
    key = (round(lat, 5), round(lon, 5), zoom)
    if key in _cache:
        return _cache[key]

    global _last_call
    elapsed = time.time() - _last_call
    if elapsed < MIN_INTERVAL:
        time.sleep(MIN_INTERVAL - elapsed)

    params = urllib.parse.urlencode(
        {"lat": f"{lat:.6f}", "lon": f"{lon:.6f}", "format": "jsonv2", "zoom": zoom}
    )
    req = urllib.request.Request(
        f"{NOMINATIM_REVERSE_URL}?{params}",
        headers={"User-Agent": USER_AGENT},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        name = _pick_name(data, zoom)
    except Exception:
        name = None
    _last_call = time.time()
    _cache[key] = name
    return name


def _pick_name(data, zoom):
    """Pilih nama tempat sesuai level zoom.

    zoom < 13 : nama level kota/kabupaten (city -> town -> village -> ...).
    zoom >= 13: nama paling spesifik (kecamatan/kelurahan/suburb -> ...).
    """
    address = data.get("address") or {}
    if zoom >= 13:
        for key in ("village", "suburb", "city_district", "neighbourhood",
                    "town", "municipality", "city", "county", "state_district"):
            if address.get(key):
                return address[key]
    else:
        for key in ("city", "town", "village", "municipality",
                    "county", "state_district"):
            if address.get(key):
                return address[key]
    if data.get("name"):
        return data["name"]
    parts = [p.strip() for p in (data.get("display_name") or "").split(",")]
    return parts[0] if parts else None


def cluster_names(points, labels, cluster_ids, zoom=10):
    """Nama tempat utk tiap klaster (medoid = titik data paling tengah).

    Return dict {cluster_id: nama|None}. Hanya memanggil Nominatim utk
    klaster yang diminta (idealnya top-K saja, mengingat batas 1 req/detik).
    """
    names = {}
    for cid in cluster_ids:
        sel = points[labels == cid]
        if len(sel) == 0:
            names[cid] = None
            continue
        centroid = sel.mean(axis=0)
        medoid = sel[np.argmin(np.linalg.norm(sel - centroid, axis=1))]
        names[cid] = reverse_geocode(medoid[0], medoid[1], zoom=zoom)
    return names
