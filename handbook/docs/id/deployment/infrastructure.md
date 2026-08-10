# Infrastructure

Infrastruktur pendukung untuk Ecoguard.

## Docker Compose (Lokal)

File: `infra/docker-compose.yml`

Menjalankan semua services + infrastruktur:

- 2x PostgreSQL (user + notification)
- pgBouncer (connection pooling)
- MongoDB (twitter + issue + blockchain)
- RabbitMQ (message queue)
- Redis (caching)

## PostgreSQL

### Database

| Instance | Database | Port |
|----------|----------|------|
| postgres-user | `ecoguard_user` | 5432 |
| postgres-notif | `ecoguard_notif` | 5433 |

### Init Script

```sql
-- infra/postgres/init.sql
CREATE DATABASE ecoguard_user;
CREATE DATABASE ecoguard_notif;
```

### pgBouncer

Connection pooling untuk PostgreSQL. Berlaku sebagai proxy:

```
App → pgBouncer (:6432) → PostgreSQL (:5432)
```

pgBouncer dijalankan sebagai service di `infra/docker-compose.yml`.

## MongoDB

Single instance untuk multiple services:

- Twitter Service — tweet storage
- Issue Service — issue data
- Blockchain Service — blockchain data

Init: `infra/mongodb/init.js`

## RabbitMQ

Event bus untuk async communication.

### Exchange: `ecoguard.events` (topic)

| Routing Key | Publisher | Consumer |
|-------------|-----------|----------|
| `tweet.ingested` | Twitter Service | Gateway (subscription) |
| `classification.completed` | Classification Service | Notification Service |
| `issue.created` | Issue Service | Notification Service |

### Management UI

`http://localhost:15672` (guest/guest)

## Redis

Digunakan oleh NLP Service untuk caching geocoding results.
