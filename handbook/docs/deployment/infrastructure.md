# Infrastructure

Supporting infrastructure for Ecoguard.

## PostgreSQL

| Instance | Database | Port |
|----------|----------|------|
| postgres-user | `ecoguard_user` | 5432 |
| postgres-notif | `ecoguard_notif` | 5433 |

Connection pooling via **pgBouncer** (`:6432`).

## MongoDB

Single instance (`:27017`) for Twitter, Issue, and Blockchain services.

## RabbitMQ

Topic exchange `ecoguard.events` for async event bus.

| Routing Key | Publisher | Consumer |
|-------------|-----------|----------|
| `tweet.ingested` | Twitter | Gateway |
| `classification.completed` | Classification | Notification |
| `issue.created` | Issue | Notification |

Management UI: `http://localhost:15672` (guest/guest)

## Redis

Caching for NLP Service geocoding results. Port `:6379`.
