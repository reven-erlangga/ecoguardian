# Arsitektur

Ecoguard menggunakan arsitektur **microservices** dengan **GraphQL Gateway** sebagai single entry point.

## Diagram Arsitektur

```mermaid
graph TB
    subgraph Frontend["FRONTEND"]
        A[Astro + Svelte<br/>URQL GraphQL Client]
    end

    subgraph Gateway["GRAPHQL GATEWAY"]
        G[GraphQL Mesh<br/>Node.js]
    end

    subgraph Services["BACKEND SERVICES"]
        TS[Twitter Service<br/>Node.js · MongoDB]
        CS[Classification Service<br/>Python · ONNX]
        US[User & Auth Service<br/>Python · PostgreSQL]
        NS[Notification Service<br/>Python · PostgreSQL]
        NL[NLP Service<br/>Python · PostgreSQL]
        BS[Blockchain Service<br/>Python · MongoDB]
        IS[Issue Service<br/>Python · MongoDB]
        AS[Asset Service<br/>Python · ImageKit]
    end

    subgraph Infra["INFRASTRUCTURE"]
        RMQ[RabbitMQ<br/>Event Bus]
        PG[pgBouncer<br/>Connection Pool]
    end

    A -->|HTTP/WS| G
    G -->|gRPC| TS
    G -->|gRPC| CS
    G -->|gRPC| US
    G -->|gRPC| NS
    G -->|gRPC| NL
    G -->|gRPC| BS
    G -->|gRPC| IS
    G -->|gRPC| AS

    TS -->|gRPC| CS
    TS -->|gRPC| NL
    TS -->|AMQP| RMQ

    CS -->|AMQP| RMQ
    IS -->|AMQP| RMQ
    G -.->|AMQP Subscription| RMQ

    US -->|SQL| PG
    NS -->|SQL| PG
```

## Prinsip Desain

### Service Isolation
- **Satu service, satu responsibility** — tidak ada service yang ngurusin lebih dari satu domain.
- **Tiap service punya database sendiri** — no sharing database antar service.
- Komunikasi **sync** lewat **gRPC** (protobuf).
- Komunikasi **async** lewat **RabbitMQ** (event bus).

### Gateway
- Gateway **tidak punya business logic** — hanya translate GraphQL queries ke gRPC calls.
- **JWT validation** dilakukan di gateway dengan memanggil `AuthService.ValidateToken`.
- Gateway melakukan **aggregation** — satu query GraphQL bisa fetch dari multiple service.

### Feature-Driven Structure
Kode diorganisir per **fitur**, bukan per layer:

```
user-auth-service/
├── user/           # Feature: user CRUD
│   ├── models.py
│   ├── repository.py
│   └── service.py
├── auth/           # Feature: auth
│   ├── jwt.py
│   ├── password.py
│   └── service.py
└── common/         # Shared utilities
```

## Alur Data

### Citizen Report Flow

```mermaid
sequenceDiagram
    actor Warga
    participant Frontend
    participant Gateway
    participant CS as Classification
    participant IS as Issue
    participant NS as Notification

    Warga->>Frontend: Upload foto laporan
    Frontend->>Gateway: GraphQL Mutation
    Gateway->>CS: gRPC ClassifyImage
    CS-->>Gateway: label + confidence
    Gateway->>IS: gRPC CreateIssue
    IS->>NS: RabbitMQ event
    NS-->>Warga: Email/Telegram notifikasi
```

### Twitter Ingestion Flow

```mermaid
sequenceDiagram
    participant Twitter
    participant TW as Twitter Service
    participant CS as Classification
    participant NL as NLP
    participant RMQ as RabbitMQ

    Twitter->>TW: Ingest tweet
    TW->>CS: gRPC classify image
    TW->>NL: gRPC analyze text
    TW->>RMQ: publish tweet.ingested
    RMQ-->>Gateway: Subscription
```

## Service Communication Map

```mermaid
graph LR
    G[Gateway<br/>:4000] -->|gRPC 50051| UA[User Auth]
    G -->|gRPC 50052| TW[Twitter]
    G -->|gRPC 50053| CL[Classification]
    G -->|gRPC 50054| NO[Notification]
    G -->|gRPC 50055| NLP[NLP]
    G -->|gRPC 50056| BC[Blockchain]
    G -->|gRPC 50057| IS[Issue]
    G -->|gRPC 50058| AS[Asset]

    TW -->|gRPC| CL
    TW -->|gRPC| NLP
    TW -->|gRPC| AS

    subgraph RMQ["RabbitMQ – ecoguard.events"]
        topic[(Topic Exchange)]
    end

    TW -->|publish| RMQ
    CL -->|publish| RMQ
    IS -->|publish| RMQ
    G -.->|subscribe| RMQ
```

## Event Map

| Event | Publisher | Consumer | Routing Key |
|-------|-----------|----------|-------------|
| Tweet ingested | Twitter Service | Gateway (Subscription) | `tweet.ingested` |
| Classification completed | Classification Service | Notification Service | `classification.completed` |
| Issue created | Issue Service | Notification Service | `issue.created` |
