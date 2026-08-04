# Notification Service

Send notifications via **Email** and **Telegram**, stores history in **PostgreSQL**.

- **Python** (Flask + grpcio)
- **PostgreSQL** — notification history
- **RabbitMQ** consumer — listens to events

**Port**: `50054` (gRPC)

**Proto**: `NotificationService` (SendNotification, GetNotifications, MarkRead)

**Events consumed**:
- `classification.completed`
- `issue.created`

## Tests

| File | Coverage |
|------|----------|
| `tests/test_sender_service.py` | Email sender, Telegram sender, mark read |
