"""
Test: notification flow end-to-end

- Send a notification via gRPC
- Query notifications back
- Mark one as read and verify the status changed
"""

import uuid

import pytest

from conftest import notification_stub  # noqa: F401  (fixture import)


def _unique_user_id() -> str:
    return f"user-{uuid.uuid4().hex[:12]}"


class TestNotificationFlow:
    """End-to-end tests for the Notification gRPC service."""

    @pytest.fixture(autouse=True)
    def _setup(self, notification_stub):
        self.stub = notification_stub

    def test_send_and_retrieve_notification(self):
        """Send a notification then retrieve it via GetNotifications."""
        from notification import notification_pb2  # noqa: F811
        from common import common_pb2  # noqa: F811

        user_id = _unique_user_id()
        title = "Test Alert"
        content = "This is a test notification."

        # ── Send ────────────────────────────────────────────────
        send_resp = self.stub.SendNotification(
            notification_pb2.SendNotificationRequest(
                user_id=user_id,
                type="alert",
                channel="in_app",
                title=title,
                content=content,
            )
        )

        assert send_resp.id, "no notification id returned"
        notif_id = send_resp.id

        # ── Retrieve ────────────────────────────────────────────
        list_resp = self.stub.GetNotifications(
            notification_pb2.GetNotificationsRequest(
                user_id=user_id,
                status="unread",
                pagination=common_pb2.Pagination(page=1, per_page=10),
            )
        )

        assert list_resp.notifications, "no notifications returned"
        # Find the notification we just sent
        match = [n for n in list_resp.notifications if n.id == notif_id]
        assert len(match) == 1, f"notification {notif_id} not in returned list"
        assert match[0].title == title
        assert match[0].content == content
        assert match[0].user_id == user_id
        assert match[0].status == "unread"

    def test_send_then_mark_read(self):
        """Mark a notification as read and confirm the status update."""
        from notification import notification_pb2  # noqa: F811
        from common import common_pb2  # noqa: F811

        user_id = _unique_user_id()

        send_resp = self.stub.SendNotification(
            notification_pb2.SendNotificationRequest(
                user_id=user_id,
                type="reminder",
                channel="email",
                title="Read test",
                content="Mark this as read.",
            )
        )
        assert send_resp.id
        notif_id = send_resp.id

        # ── MarkRead ────────────────────────────────────────────
        self.stub.MarkRead(
            notification_pb2.MarkReadRequest(id=notif_id, user_id=user_id)
        )

        # ── Verify ──────────────────────────────────────────────
        list_resp = self.stub.GetNotifications(
            notification_pb2.GetNotificationsRequest(
                user_id=user_id,
                status="read",
                pagination=common_pb2.Pagination(page=1, per_page=10),
            )
        )
        match = [n for n in list_resp.notifications if n.id == notif_id]
        assert len(match) == 1, (
            f"notification {notif_id} not found in 'read' list"
        )
        assert match[0].status in ("read", "sent"), (
            f"expected status 'read', got '{match[0].status}'"
        )
