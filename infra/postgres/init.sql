-- ponytail: service handle table creation sendiri via init_db()
-- File ini cuma placeholder — database dibuat oleh POSTGRES_DB env
-- Hanya buat yang belum ada

CREATE DATABASE ecoguard_notif;
CREATE DATABASE ecoguard_cluster;

\c ecoguard_user;

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

\c ecoguard_notif;

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
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (status);
