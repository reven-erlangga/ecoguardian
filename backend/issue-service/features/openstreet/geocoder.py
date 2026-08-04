"""
OpenStreetMap geocoder with Redis cache (24h).
Mencegah hit berulang ke Nominatim agar gak kena rate limit.
"""

import json
import time

import redis
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
CACHE_TTL = 86400  # 24 jam
DELAY = 1.1  # detik antar request (hormati rate limit Nominatim)


class Geocoder:
    """Geocode place names → (lat, lon) with Redis cache."""

    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self._last_call = 0.0
        self._cache = None
        try:
            self._cache = redis.from_url(redis_url, decode_responses=True)
            self._cache.ping()
            print(f"   ✅ Redis cache aktif ({redis_url})")
        except Exception as e:
            print(f"   ⚠️  Redis not available ({e}), cache disabled")

    def geocode(self, place: str) -> dict | None:
        """Get (lat, lon) for place name. Cached 24h."""
        if not place:
            return None

        # 1. Cek cache
        if self._cache:
            cached = self._cache.get(f"geo:{place}")
            if cached:
                return json.loads(cached)

        # 2. Rate limit
        now = time.time()
        since_last = now - self._last_call
        if since_last < DELAY:
            time.sleep(DELAY - since_last)

        # 3. Panggil Nominatim
        try:
            self._last_call = time.time()
            r = requests.get(NOMINATIM_URL, params={
                "q": f"{place}, Indonesia",
                "format": "json",
                "limit": 1,
            }, headers={"User-Agent": "Ecoguard/1.0 (skripsi)"}, timeout=10)

            if r.ok and r.json():
                d = r.json()[0]
                result = {
                    "lat": float(d["lat"]),
                    "lon": float(d["lon"]),
                    "display_name": d["display_name"],
                }
                # Simpan cache
                if self._cache:
                    self._cache.setex(f"geo:{place}", CACHE_TTL, json.dumps(result))
                return result
        except Exception as e:
            print(f"   ⚠️  Geocode error '{place}': {e}")

        # Cache empty result biar gak diulang
        if self._cache:
            self._cache.setex(f"geo:{place}", CACHE_TTL, json.dumps(None))
        return None
