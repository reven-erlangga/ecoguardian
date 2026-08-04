# RabbitMQ

Message broker untuk event bus async.

## Konfigurasi

```yaml
rabbitmq:
  image: rabbitmq:3-management-alpine
  ports: ["5672:5672", "15672:15672"]
```

Management UI: `http://localhost:15672` (guest/guest)

## Exchange: `ecoguard.events`

| Routing Key | Publisher | Consumer |
|-------------|-----------|----------|
| `tweet.ingested` | Twitter Service | Gateway |
| `classification.completed` | Classification | Notification |
| `issue.created` | Issue Service | Notification |

## Publisher (Python)

```python
channel.basic_publish(
    exchange="ecoguard.events",
    routing_key="classification.completed",
    body=json.dumps({"tweet_id": "...", "label": "garbage"}),
)
```
