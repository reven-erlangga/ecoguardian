# Notification Service

Mengirim notifikasi via **Email** dan **Telegram**, serta menyimpan riwayat notifikasi di **PostgreSQL**.

## Tech Stack

- **Python** (Flask + grpcio)
- **PostgreSQL** — riwayat notifikasi
- **RabbitMQ** — consume event dari service lain
- **psycopg2** — PostgreSQL driver

## Lokasi Kode

```
backend/notification-service/
├── sender/
│   ├── email.py          # Email sender
│   └── telegram.py       # Telegram bot sender
├── rabbitmq/
│   └── consumer.py       # Event bus consumer
├── common/
│   ├── config.py
│   ├── db.py
│   └── grpc_server.py
├── proto/
├── server.py
└── requirements.txt
```

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50054 | gRPC | `NotificationService` RPC |

## Proto Contract

```protobuf
service NotificationService {
  rpc SendNotification(SendNotificationRequest) returns (SendNotificationResponse);
  rpc GetNotifications(GetNotificationsRequest) returns (GetNotificationsResponse);
  rpc MarkRead(MarkReadRequest) returns (Empty);
}
```

## Event Consumer

Subscribe ke RabbitMQ events dan kirim notifikasi otomatis:

```python
# rabbitmq/consumer.py
channel.exchange_declare(exchange="ecoguard.events", exchange_type="topic")
channel.queue_bind(queue="", exchange="ecoguard.events", routing_key="#")

for method, properties, body in channel.consume(queue):
    event = json.loads(body)
    # Kirim email/telegram berdasarkan tipe event
    sender.send_notification(event)
```

## Cara Running

```bash
cd infra
docker compose up notification-service -d
```
