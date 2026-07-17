import time

import psycopg2
from psycopg2 import pool

from common.config import Config

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        # ponytail: retry ~30 detik — DNS butuh waktu di startup
        last_err = None
        for attempt in range(30):
            try:
                _pool = pool.ThreadedConnectionPool(
                    minconn=1,
                    maxconn=10,
                    dsn=Config.DATABASE_URL,
                )
                return _pool
            except Exception as e:
                last_err = e
                time.sleep(1)
        raise last_err
    return _pool


def get_conn():
    return get_pool().getconn()


def put_conn(conn):
    get_pool().putconn(conn)


def init_db():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id     VARCHAR(255) NOT NULL,
                    type        VARCHAR(100) NOT NULL,
                    channel     VARCHAR(50) NOT NULL DEFAULT '',
                    title       VARCHAR(255) NOT NULL,
                    content     TEXT NOT NULL,
                    status      VARCHAR(20) NOT NULL DEFAULT 'unread',
                    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                    read_at     TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_notifications_user_id
                    ON notifications (user_id);
                CREATE INDEX IF NOT EXISTS idx_notifications_status
                    ON notifications (status);
            """)
            conn.commit()
    finally:
        put_conn(conn)
