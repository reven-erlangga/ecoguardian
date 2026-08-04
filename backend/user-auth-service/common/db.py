import time

import psycopg2
from psycopg2 import pool, extras

from .config import Config

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        # ponytail: retry ~30 detik — DNS butuh waktu di startup
        last_err = None
        for attempt in range(30):
            try:
                _pool = pool.ThreadedConnectionPool(
                    minconn=1, maxconn=10, dsn=Config.DATABASE_URL,
                    cursor_factory=extras.RealDictCursor,
                )
                return _pool
            except Exception as e:
                last_err = e
                time.sleep(1)
        raise last_err  # noqa: B904
    return _pool


def init_db():
    """Create tables if not exist."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email          VARCHAR(255) UNIQUE NOT NULL,
                    username       VARCHAR(100) NOT NULL,
                    password_hash  VARCHAR(255) NOT NULL,
                    role           VARCHAR(20) NOT NULL DEFAULT 'user',
                    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at     TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
            """)
            conn.commit()
            print("✅ Users table ready")

        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    token_hash     VARCHAR(64) NOT NULL,
                    expires_at     TIMESTAMP NOT NULL,
                    revoked        BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at     TIMESTAMP NOT NULL DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens (token_hash);
                CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);
            """)
            conn.commit()
            print("✅ Refresh tokens table ready")
    except Exception as e:
        print(f"⚠️  Failed to init DB: {e}")
    finally:
        return_connection(conn)


def get_connection():
    return get_pool().getconn()


def return_connection(conn):
    get_pool().putconn(conn)
