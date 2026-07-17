"""
Test: HTTP trigger-classify endpoint on the Twitter Service.

Sends a POST to ``/trigger-classify`` with a fake image URL.
The service will attempt to download the image, so the test
expects a 4xx/5xx error rather than a successful classification
(an unreachable URL is expected in a dev environment).
"""

import pytest


class TestTriggerClassify:
    """Tests for the Twitter Service's HTTP ``/trigger-classify`` route."""

    def test_trigger_classify_rejects_empty_media_urls(
        self, twitter_http_base, http_session
    ):
        """POST without media_urls returns 422 / 400."""
        url = f"{twitter_http_base}/trigger-classify"
        payload = {
            "tweet_id": "123",
            "text": "A test tweet",
            "author": "test_user",
            "author_username": "@tester",
            "media_urls": [],
        }

        resp = http_session.post(url, json=payload)

        # The endpoint returns 422 (Rocket's default for missing field)
        # or 200 with an error JSON body — either is valid.
        assert resp.status_code in (200, 400, 422)
        if resp.status_code == 200:
            body = resp.json()
            assert "error" in body

    def test_trigger_classify_with_bogus_url(
        self, twitter_http_base, http_session
    ):
        """POST with an unreachable image URL returns an error JSON."""
        url = f"{twitter_http_base}/trigger-classify"
        payload = {
            "tweet_id": "456",
            "text": "Check this out",
            "author": "bot",
            "author_username": "@bot",
            "media_urls": ["https://nonexistent.example/image.jpg"],
        }

        resp = http_session.post(url, json=payload, timeout=5)

        # The service will try to download, fail, and return an error
        assert "error" in resp.json(), (
            f"Expected an error field in response: {resp.text}"
        )
