# Gateway

Single GraphQL entry point using **GraphQL Mesh** that translates queries to gRPC calls.

## Tech Stack

- **Node.js** + **GraphQL Mesh** v0.100
- `@graphql-mesh/cli` + `@graphql-mesh/grpc`
- `amqplib` — RabbitMQ subscriptions

## Config (`.meshrc.yaml`)

Registers 8 backend services as gRPC sources:

```yaml
sources:
  - name: Classification
    handler:
      grpc:
        endpoint: classification-service:50053
        source:
          file: proto/classification/service.proto
```

## Port

| Port | Function |
|------|----------|
| 4000 | GraphQL endpoint |

## Service Sources

| Source | gRPC Endpoint |
|--------|---------------|
| Classification | `:50053` |
| User | `:50051` |
| Twitter | `:50052` |
| Notification | `:50054` |
| NLP | `:50055` |
| Blockchain | `:50056` |
| Issue | `:50057` |
| Asset | `:50058` |

## Subscriptions

Custom RabbitMQ consumer for GraphQL subscriptions (`subscription.js`):

```javascript
await ch.bindQueue(q.queue, "ecoguard.events", "tweet.ingested");
ch.consume(q.queue, (msg) => {
  pubsub.publish("ISSUE_CREATED", { issueCreated: {...} });
});
```
