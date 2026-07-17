"""
Unit tests for notification sender service (with mocked repository)
"""

import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

# ── Ensure package root is on sys.path ──
_HERE = Path(__file__).resolve().parent
_PKG = _HERE.parent
if str(_PKG) not in sys.path:
    sys.path.insert(0, str(_PKG))


@pytest.fixture(autouse=True)
def _mock_repo(mocker):
    """Mock sender.repository before each test."""
    mocker.patch("sender.service.repository")


# Import *after* patching.
from sender import service as sender_svc  # noqa: E402

USER_ID = "user-42"
NOW_STR = datetime.now(timezone.utc).isoformat()

SAMPLE_NOTIFICATION = {
    "id": "notif-001",
    "user_id": USER_ID,
    "type": "alert",
    "channel": "email",
    "title": "Fallen tree detected",
    "content": "A fallen tree was spotted in sector 7G.",
    "status": "unread",
    "created_at": NOW_STR,
    "read_at": None,
}


# ── send ──────────────────────────────────────────────────────


def test_send_creates_notification_with_correct_fields():
    sender_svc.repository.create_notification.return_value = SAMPLE_NOTIFICATION

    result = sender_svc.send(USER_ID, "alert", "Fallen tree detected", "A fallen tree was spotted in sector 7G.", channel="email")

    sender_svc.repository.create_notification.assert_called_once_with(
        USER_ID, "alert", "Fallen tree detected",
        "A fallen tree was spotted in sector 7G.", "email"
    )
    assert result == SAMPLE_NOTIFICATION


def test_send_returns_notification_dict():
    sender_svc.repository.create_notification.return_value = SAMPLE_NOTIFICATION

    result = sender_svc.send(USER_ID, "info", "Test title", "Test content")

    assert isinstance(result, dict)
    assert result["id"] == "notif-001"
    assert result["user_id"] == USER_ID


def test_send_without_channel_defaults_to_empty_string():
    sender_svc.repository.create_notification.return_value = SAMPLE_NOTIFICATION

    sender_svc.send(USER_ID, "info", "Title", "Content")
    _call = sender_svc.repository.create_notification.call_args
    assert _call[0][4] == ""  # channel param


# ── list_notifications ───────────────────────────────────────


def test_list_notifications_returns_paginated_results():
    items = [SAMPLE_NOTIFICATION]
    total = 1
    sender_svc.repository.get_notifications.return_value = (items, total)

    result_items, result_total = sender_svc.list_notifications(USER_ID, page=1, per_page=20)

    sender_svc.repository.get_notifications.assert_called_once_with(
        USER_ID, None, 1, 20
    )
    assert result_items == items
    assert result_total == total


def test_list_notifications_filters_by_status():
    items = [SAMPLE_NOTIFICATION]
    sender_svc.repository.get_notifications.return_value = (items, 1)

    sender_svc.list_notifications(USER_ID, status="unread", page=1, per_page=10)

    sender_svc.repository.get_notifications.assert_called_once_with(
        USER_ID, "unread", 1, 10
    )


def test_list_notifications_returns_pagination_defaults():
    sender_svc.repository.get_notifications.return_value = ([], 0)

    sender_svc.list_notifications(USER_ID)

    sender_svc.repository.get_notifications.assert_called_once_with(
        USER_ID, None, 1, 20
    )


def test_list_notifications_returns_empty_list_when_no_results():
    sender_svc.repository.get_notifications.return_value = ([], 0)

    items, total = sender_svc.list_notifications(USER_ID)

    assert items == []
    assert total == 0


# ── mark_read ─────────────────────────────────────────────────


def test_mark_read_updates_status():
    sender_svc.mark_read("notif-001", USER_ID)

    sender_svc.repository.mark_read.assert_called_once_with("notif-001", USER_ID)


def test_mark_read_handles_nonexistent_id_gracefully():
    """mark_read should not raise when the notification doesn't exist."""
    sender_svc.repository.mark_read.return_value = None
    # Should not raise any exception
    sender_svc.mark_read("nonexistent-id", USER_ID)
    sender_svc.repository.mark_read.assert_called_once_with(
        "nonexistent-id", USER_ID
    )
