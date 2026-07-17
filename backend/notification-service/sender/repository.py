import math
from datetime import datetime, timezone
from typing import Optional

from common.db import get_conn, put_conn


def create_notification(
    user_id: str,
    type_: str,
    title: str,
    content: str,
    channel: str = "",
) -> dict:
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO notifications (user_id, type, channel, title, content)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, user_id, type, channel, title, content,
                          status, created_at, read_at
                """,
                (user_id, type_, channel, title, content),
            )
            row = cur.fetchone()
            conn.commit()
            return _row_to_dict(row)
    finally:
        put_conn(conn)


def get_notifications(
    user_id: str,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[dict], int]:
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            where = "user_id = %s"
            params = [user_id]
            if status:
                where += " AND status = %s"
                params.append(status)

            cur.execute(
                f"SELECT COUNT(*) FROM notifications WHERE {where}", params
            )
            total = cur.fetchone()[0]

            offset = (page - 1) * per_page
            cur.execute(
                f"""
                SELECT id, user_id, type, channel, title, content,
                       status, created_at, read_at
                FROM notifications
                WHERE {where}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
                """,
                params + [per_page, offset],
            )
            rows = cur.fetchall()
            items = [_row_to_dict(r) for r in rows]
            return items, total
    finally:
        put_conn(conn)


def mark_read(notification_id: str, user_id: str) -> None:
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE notifications
                SET status = 'read', read_at = %s
                WHERE id = %s AND user_id = %s
                """,
                (datetime.now(timezone.utc), notification_id, user_id),
            )
            conn.commit()
    finally:
        put_conn(conn)


def _row_to_dict(row) -> dict:
    return {
        "id": str(row[0]),
        "user_id": row[1],
        "type": row[2],
        "channel": row[3],
        "title": row[4],
        "content": row[5],
        "status": row[6],
        "created_at": row[7].isoformat() if row[7] else None,
        "read_at": row[8].isoformat() if row[8] else None,
    }
