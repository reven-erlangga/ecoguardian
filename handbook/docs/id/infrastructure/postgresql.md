# PostgreSQL

Relational database.

## Flow

```mermaid
flowchart LR
    UA[User Auth] --> PB[pgBouncer :6432]
    NO[Notification] --> PB
    PB --> PG1[(PostgreSQL :5432<br/>ecoguard_user)]
    PB --> PG2[(PostgreSQL :5433<br/>ecoguard_notif)]
```

| Instance | Port | Database |
|----------|------|----------|
| `postgres-user` | 5432 | `ecoguard_user` |
| `postgres-notif` | 5433 | `ecoguard_notif` |

Service konek via pgBouncer, bukan langsung.
