# RabbitMQ

Message broker for **async event bus** between services. Uses **topic exchange** for routing.

## Konfigurasi

```yaml
rabbitmq:
  image: rabbitmq:3-management-alpine
  container_name: ecoguard-rabbitmq
  ports:
    - "5672:5672"    # AMQP
    - "15672:15672"  # Management UI
  environment:
    RABBITMQ_DEFAULT_USER: guest
    RABBITMQ_DEFAULT_PASS: guest
```

## Management UI

```
URL: http://localhost:15672
User: guest
Pass: guest
```

Fitur: lihat queue, exchanges, koneksi, publish message manual.

## Exchange: `ecoguard.events`

Topic exchange for all inter-service events.

```mermaid
graph LR
    TW[Twitter Service] -->|tweet.ingested| EX[(ecoguard.events)]
    CL[Classification] -->|classification.completed| EX
    IS[Issue Service] -->|issue.created| EX
    EX -->|subscribe| GW[Gateway GraphQL]
    EX -->|subscribe| NO[Notification Service]
```

## Routing Keys

| Routing Key | Publisher | Consumer | Payload |
|-------------|-----------|----------|---------|
| `tweet.ingested` | Twitter Service | Gateway (Subscription) | `{ id, tweet_id }` |
| `classification.completed` | Classification Service | Notification Service | `{ tweet_id, label, confidence }` |
| `issue.created` | Issue Service | Notification Service | `{ issue_id, tweet_id, type }` |

## Publisher (Python)

```python
import pika, json

conn = pika.BlockingConnection(
    pika.URLParameters("amqp://guest:guest@rabbitmq:5672")
)
channel = conn.channel()
channel.basic_publish(
    exchange="ecoguard.events",
    routing_key="classification.completed",
    body=json.dumps({"tweet_id": "123", "label": "garbage", "confidence": 0.95}),
)
conn.close()
```

## Consumer (Node.js)

```javascript
import amqp from "amqplib";

const conn = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
const ch = await conn.createChannel();
await ch.assertExchange("ecoguard.events", "topic", { durable: true });
const q = await ch.assertQueue("", { exclusive: true });
await ch.bindQueue(q.queue, "ecoguard.events", "tweet.ingested");

ch.consume(q.queue, (msg) => {
    const event = JSON.parse(msg.content.toString());
    console.log("Received:", event);
    ch.ack(msg);
});
```
