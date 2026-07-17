"""
Full flow integration test for the Ecoguard pipeline.

Tests the complete end-to-end flow across all services:

    Register (gRPC User-Auth) → Ingest (HTTP Twitter) → Classify (sync gRPC)
    → Notify (async via RabbitMQ → gRPC Notification)

All four services must be running (tests skip gracefully otherwise).
"""

import os
import time
import uuid

import pytest

from conftest import (
    http_session,
    notification_stub,
    port_open,
    require_proto,
    SERVICE_PORTS,
    twitter_http_base,
    user_auth_stub,
)

# ─── Constants ─────────────────────────────────────────────────

_TEST_IMAGE_URL = "https://picsum.photos/224"

# ─── Helpers ───────────────────────────────────────────────────


def _unique_email() -> str:
    return f"e2e-{uuid.uuid4().hex[:12]}@ecoguard.test"


def _unique_username() -> str:
    return f"e2e_{uuid.uuid4().hex[:8]}"


def _all_required_services_alive() -> bool:
    """Return True when every required service accepts a TCP connection."""
    host = os.getenv("SERVICE_HOST", "localhost")
    for key in (
        "classification_grpc",
        "user_auth_grpc",
        "notification_grpc",
        "twitter_http",
    ):
        if not port_open(host, SERVICE_PORTS[key]):
            return False
    return True


# Module-level flag evaluated at collection time.
_SERVICES_READY = _all_required_services_alive()


# ─── Tests ─────────────────────────────────────────────────────


@pytest.mark.skipif(
    not _SERVICES_READY,
    reason="one or more required services (classification|user-auth|notification|twitter)"
    " are not reachable",
)
class TestFullFlow:
    """End-to-end test: Register → Ingest → Classify → Notify."""

    @pytest.fixture(autouse=True)
    def _setup(
        self,
        http_session,
        twitter_http_base,
        user_auth_stub,
        notification_stub,
    ):
        """Inject fixtures into test instance.

        Skips if generated protobuf stubs are missing.
        """
        self.http = http_session
        self.twitter_url = f"{twitter_http_base}/trigger-classify"
        self.user_stub, self.auth_stub = user_auth_stub
        self.notif_stub = notification_stub
        require_proto()

    # ── Test 1: Sync classification flow ──────────────────────

    def test_full_classification_flow(self):
        """Register → trigger-classify → verify classification result.

        Validates that the synchronous HTTP classification endpoint
        returns a well-formed response (label, confidence, candidates).
        """
        from user import user_pb2  # noqa: F811

        email = _unique_email()
        username = _unique_username()
        password = "E2eTestPass1!"

        # 1. Register user via gRPC
        reg_resp = self.user_stub.Register(
            user_pb2.RegisterRequest(
                email=email, username=username, password=password
            )
        )
        assert reg_resp.user.id, "no user.id returned from Register"
        assert reg_resp.token, "no token returned from Register"
        user_id = reg_resp.user.id

        # 2. Ingest tweet with image via HTTP trigger-classify
        tweet_id = f"e2e-classify-{uuid.uuid4().hex[:8]}"
        payload = {
            "tweet_id": tweet_id,
            "text": "Test image for classification e2e flow",
            "author": username,
            "author_username": f"@{username}",
            "media_urls": [_TEST_IMAGE_URL],
            "metadata": {"user_id": user_id, "source": "e2e-test"},
        }

        resp = self.http.post(self.twitter_url, json=payload, timeout=15)
        assert resp.status_code == 200, (
            f"trigger-classify returned HTTP {resp.status_code}: {resp.text}"
        )

        body = resp.json()

        # 3. Assert classification response shape
        assert "label" in body, f"response missing 'label': {body}"
        assert body["label"], "'label' is empty"
        assert "confidence" in body, f"response missing 'confidence': {body}"
        assert 0.0 <= body["confidence"] <= 1.0, (
            f"confidence {body['confidence']} out of [0, 1]"
        )
        assert "candidates" in body, f"response missing 'candidates': {body}"
        assert len(body["candidates"]) > 0, "'candidates' list is empty"

        # 4. Assert tweet_id round-trips
        assert body["tweet_id"] == tweet_id, (
            f"tweet_id mismatch: response={body['tweet_id']}, sent={tweet_id}"
        )

        # 5. Assert each candidate has required fields
        for i, cand in enumerate(body["candidates"]):
            assert "label" in cand, f"candidate[{i}] missing 'label': {cand}"
            assert "confidence" in cand, f"candidate[{i}] missing 'confidence': {cand}"
            assert 0.0 <= cand["confidence"] <= 1.0, (
                f"candidate[{i}] confidence {cand['confidence']} out of [0, 1]"
            )

    # ── Test 2: Async notification flow ───────────────────────

    def test_tweet_with_image_leads_to_notification(self):
        """Register → trigger-classify → poll notification.

        After ingesting a tweet with an image, polls the Notification
        service for up to 15 seconds, expecting a notification of type
        ``"classification"`` to appear (created by the async RabbitMQ
        pipeline).
        """
        from user import user_pb2  # noqa: F811
        from notification import notification_pb2  # noqa: F811
        from common import common_pb2  # noqa: F811

        email = _unique_email()
        username = _unique_username()
        password = "E2eNotifPass1!"

        # 1. Register user via gRPC
        reg_resp = self.user_stub.Register(
            user_pb2.RegisterRequest(
                email=email, username=username, password=password
            )
        )
        assert reg_resp.user.id, "no user.id returned from Register"
        user_id = reg_resp.user.id

        # 2. Ingest tweet with image
        tweet_id = f"e2e-notif-{uuid.uuid4().hex[:8]}"
        payload = {
            "tweet_id": tweet_id,
            "text": "Image that should trigger a classification notification",
            "author": username,
            "author_username": f"@{username}",
            "media_urls": [_TEST_IMAGE_URL],
            "metadata": {"user_id": user_id, "source": "e2e-test"},
        }

        resp = self.http.post(self.twitter_url, json=payload, timeout=15)
        assert resp.status_code == 200, (
            f"trigger-classify returned HTTP {resp.status_code}: {resp.text}"
        )

        body = resp.json()
        assert body["label"], "classification label is empty"

        # 3. Poll notifications for up to 15 seconds
        deadline = time.monotonic() + 15.0
        found_notification = None

        while time.monotonic() < deadline:
            list_resp = self.notif_stub.GetNotifications(
                notification_pb2.GetNotificationsRequest(
                    user_id=user_id,
                    status="unread",
                    pagination=common_pb2.Pagination(page=1, per_page=20),
                )
            )

            for n in list_resp.notifications:
                if n.type == "classification" or tweet_id in n.content:
                    found_notification = n
                    break

            if found_notification is not None:
                break

            time.sleep(2)

        # 4. Assert notification exists and has expected shape
        assert found_notification is not None, (
            f"No classification notification found for user {user_id} "
            f"after 15s polling.\n"
            f"The async pipeline (trigger-classify → RabbitMQ → "
            f"Classification Service → Notification Service) may not "
            f"be fully wired for the HTTP path."
        )
        assert found_notification.title, "notification title is empty"
        assert found_notification.content, "notification content is empty"
        assert found_notification.user_id == user_id, (
            f"notification.user_id={found_notification.user_id}, expected {user_id}"
        )
        assert found_notification.status == "unread", (
            f"expected status 'unread', got '{found_notification.status}'"
        )

        # 5. Mark as read (cleanup)
        self.notif_stub.MarkRead(
            notification_pb2.MarkReadRequest(
                id=found_notification.id, user_id=user_id
            )
        )
