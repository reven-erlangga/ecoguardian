from typing import Optional

from sender import repository


def send(
    user_id: str,
    type_: str,
    title: str,
    content: str,
    channel: str = "",
) -> dict:
    return repository.create_notification(user_id, type_, title, content, channel)


def list_notifications(
    user_id: str,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[dict], int]:
    return repository.get_notifications(user_id, status, page, per_page)


def mark_read(notification_id: str, user_id: str) -> None:
    repository.mark_read(notification_id, user_id)
