"""Redis cache for geocoding results — avoid hitting Nominatim rate limit."""

import hashlib
import json

import redis


class GeoCache:
    def __init__(self, redis_url: str):
        self.client = redis.Redis.from_url(redis_url) if redis_url else None

    def get(self, address: str) -> dict | None:
        if not self.client:
            return None
        key = self._key(address)
        cached = self.client.get(key)
        return json.loads(cached) if cached else None

    def set(self, address: str, data: dict, ttl: int = 86400):
        """Cache geocode result for 24 hours."""
        if not self.client:
            return
        key = self._key(address)
        self.client.setex(key, ttl, json.dumps(data))

    def _key(self, address: str) -> str:
        h = hashlib.sha256(address.lower().encode()).hexdigest()[:16]
        return f"geo:{h}"
