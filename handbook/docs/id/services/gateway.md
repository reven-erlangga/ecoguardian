# Gateway Service

Single entry point untuk semua client. Menyediakan **GraphQL endpoint** yang menerjemahkan query ke gRPC calls ke backend services.

## Tech Stack

- **Node.js** + **GraphQL Mesh** v0.100
- `@graphql-mesh/cli` — GraphQL Gateway framework
- `@graphql-mesh/grpc` — gRPC source handler
- `amqplib` — RabbitMQ consumer untuk subscriptions
- `graphql` — Runtime GraphQL

## Lokasi Kode

```
infra/gateway/
├── .meshrc.yaml          # Config: sources, handlers, typedefs
├── subscription.js       # RabbitMQ consumer + GraphQL Subscription resolver
├── package.json
└── Dockerfile
```

## Cara Kerja

### 1. Mesh Config (`.meshrc.yaml`)

Mendaftarkan 8 backend service sebagai **gRPC sources**:

```yaml
sources:
  - name: Classification
    handler:
      grpc:
        endpoint: classification-service:50053
        source:
          file: proto/classification/service.proto
```

Gateway otomatis:
- Load `.proto` files
- Generate GraphQL types + resolvers dari gRPC methods
- Expose sebagai endpoint GraphQL tunggal

### 2. Custom TypeDefs + Subscriptions

```yaml
additionalTypeDefs: |
  type Subscription {
    issueCreated: IssueCreatedEvent
  }
additionalResolvers:
  - ./subscription.js
```

Karena GraphQL Mesh gak support subscriptions dari gRPC, dibuat manual via `subscription.js` yang consume RabbitMQ events.

### 3. Subscription Handler (`subscription.js`)

```javascript
// subscribe ke RabbitMQ topic "tweet.ingested"
await ch.bindQueue(q.queue, "ecoguard.events", "tweet.ingested");

// publish ke GraphQL Subscription
ch.consume(q.queue, (msg) => {
  const payload = JSON.parse(msg.content.toString());
  pubsub.publish("ISSUE_CREATED", { issueCreated: {...} });
});
```

## Port

| Port | Fungsi |
|------|--------|
| 4000 | GraphQL endpoint |

## Proto Sources

| Source | gRPC Endpoint | Methods |
|--------|---------------|---------|
| Classification | `classification-service:50053` | `ClassifyImage` |
| User | `user-auth-service:50051` | `Register`, `Login`, etc |
| Twitter | `twitter-service:50052` | `IngestTweet`, `QueryTweets` |
| Notification | `notification-service:50054` | `SendNotification`, etc |
| NLP | `nlp-service:50055` | `AnalyzeText`, `Geocode` |
| Blockchain | `blockchain-service:50056` | `RecordClassification`, etc |
| Issue | `issue-service:50057` | `ListIssues`, `GetIssue` |
| Asset | `asset-service:50058` | `UploadAsset`, `GetAsset` |

## Key Code: `.meshrc.yaml`

```yaml
serve:
  port: 4000
  hostname: 0.0.0.0
  healthCheckEndpoint: /health

sources:
  - name: Classification
    handler:
      grpc:
        endpoint: classification-service:50053
        source:
          file: proto/classification/service.proto
          load:
            includeDirs:
              - proto
  # ... 7 more sources
```

## Cara Running

```bash
cd infra/gateway
npm install
npm run dev
```

Atau via Docker Compose (port 4000):

```bash
cd infra
docker compose up gateway -d
```

## GraphQL Query Example

```graphql
query {
  classifyImage(imageData: "...", imageFormat: "jpg") {
    label
    confidence
  }
}

subscription {
  issueCreated {
    id
    tweet_id
    status
  }
}
```
