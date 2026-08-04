from datetime import datetime, timezone

import psycopg2

from common.db import get_connection, return_connection
from user.models import User


def _row_to_user(row) -> dict:
    """Convert a DB row (psycopg2 RealDictRow) to a user dict without password_hash."""
    return {
        "id": row["id"],
        "email": row["email"],
        "username": row["username"],
        "role": row["role"],
        "password_hash": row.get("password_hash", ""),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def _user_to_response(user_dict: dict) -> dict:
    """Strip password_hash from user dict for API responses."""
    return {k: v for k, v in user_dict.items() if k != "password_hash"}


def create_user(email: str, username: str, password_hash: str) -> dict:
    user = User(email=email, username=username, password_hash=password_hash)
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    user.id,
                    user.email,
                    user.username,
                    user.password_hash,
                    user.role,
                    user.created_at,
                    user.updated_at,
                ),
            )
            conn.commit()
        return _user_to_response(user.to_dict())
    except Exception:
        conn.rollback()
        raise
    finally:
        return_connection(conn)


def _fetch_user(where_clause: str, value: str) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, email, username, password_hash, role, created_at, updated_at FROM users WHERE {where_clause}",
                (value,),
            )
            row = cur.fetchone()
            return _row_to_user(row) if row else None
    finally:
        return_connection(conn)


def get_user(id: str) -> dict | None:
    return _fetch_user("id = %s", id)


def get_user_by_email(email: str) -> dict | None:
    return _fetch_user("email = %s", email)


def update_user(id: str, email: str, username: str) -> dict | None:
    now = datetime.now(timezone.utc)
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE users SET email = %s, username = %s, updated_at = %s
                WHERE id = %s
                RETURNING id, email, username, password_hash, role, created_at, updated_at
                """,
                (email, username, now, id),
            )
            row = cur.fetchone()
            conn.commit()
            return _user_to_response(_row_to_user(row)) if row else None
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise ValueError("Email already in use by another account")
    except Exception:
        conn.rollback()
        raise
    finally:
        return_connection(conn)


def count_users() -> int:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM users")
            return cur.fetchone()[0]
    finally:
        return_connection(conn)


# ── Refresh tokens ──────────────────────────────────────────


def store_refresh_token(user_id: str, token_hash: str, expires_at: datetime) -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
                VALUES (%s, %s, %s)
                """,
                (user_id, token_hash, expires_at),
            )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        return_connection(conn)


def get_valid_refresh_token(token_hash: str) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, token_hash, expires_at, revoked, created_at
                FROM refresh_tokens
                WHERE token_hash = %s AND revoked = FALSE AND expires_at > NOW()
                """,
                (token_hash,),
            )
            row = cur.fetchone()
            return dict(row) if row else None
    finally:
        return_connection(conn)


def revoke_refresh_token(token_id: str) -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE refresh_tokens SET revoked = TRUE WHERE id = %s",
                (token_id,),
            )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        return_connection(conn)


def revoke_refresh_token_by_hash(token_hash: str) -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = %s",
                (token_hash,),
            )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        return_connection(conn)


def revoke_all_user_refresh_tokens(user_id: str) -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = %s",
                (user_id,),
            )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        return_connection(conn)
