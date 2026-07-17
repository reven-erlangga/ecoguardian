"""
OpenStreetMap Nominatim geocoding client.

Honours the 1 req/sec rate limit required by Nominatim usage policy.
"""

import time

import requests


class NominatimClient:
    """Thin wrapper around the Nominatim /search endpoint with optional Redis cache."""

    def __init__(self, base_url: str, user_agent: str, cache=None):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": user_agent})
        self._last_call = 0.0
        self.cache = cache

    def geocode(self, address: str) -> dict | None:
        """Resolve *address* to (lat, lon, display_name).

        Checks Redis cache first. On miss, calls Nominatim and caches result.
        Returns None when the address cannot be found or the API errors.
        """
        # Cache check
        if self.cache:
            cached = self.cache.get(address)
            if cached:
                return cached

        # Nominatim policy: max 1 request per second
        elapsed = time.time() - self._last_call
        if elapsed < 1.0:
            time.sleep(1.0 - elapsed)

        resp = self.session.get(
            f"{self.base_url}/search",
            params={
                "q": address + ", Indonesia",
                "format": "json",
                "limit": 1,
            },
            timeout=10,
        )
        self._last_call = time.time()

        if resp.status_code != 200 or not resp.json():
            return None

        data = resp.json()[0]
        result = {
            "lat": float(data["lat"]),
            "lon": float(data["lon"]),
            "display_name": data["display_name"],
        }

        # Cache the result
        if self.cache and result:
            self.cache.set(address, result)

        return result
