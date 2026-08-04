# Service Overview

Ecoguard memiliki **9 backend services** yang saling terhubung via gRPC dan RabbitMQ.

## Architecture Diagram

```mermaid
graph TB
    subgraph Gateway["GATEWAY"]
        GM[GraphQL Mesh<br/>Node.js · :4000]
    end

    subgraph DataServices["DATA SERVICES"]
        UA[User Auth<br/>Python · :50051<br/>PostgreSQL]
        TW[Twitter<br/>Rust · :50052<br/>MongoDB]
        CL[Classification<br/>Python · :50053<br/>ONNX]
        NO[Notification<br/>Python · :50054<br/>PostgreSQL]
        NLP[NLP<br/>Python · :50055<br/>PostgreSQL]
        BC[Blockchain<br/>Python · :50056<br/>MongoDB]
        IS[Issue<br/>Python · :50057<br/>MongoDB]
        AS[Asset<br/>Python · :50058<br/>ImageKit]
    end

    GM -->|gRPC| UA & TW & CL & NO & NLP & BC & IS & AS
    TW -->|gRPC| CL & NLP & AS
```

## Service Matrix

| Service | Bahasa | gRPC Port | HTTP Port | Database | Proto Package |
|---------|--------|-----------|-----------|----------|---------------|
| **Gateway** | Node.js | - | 4000 | - | - |
| **User Auth** | Python | 50051 | - | PostgreSQL | `user` |
| **Twitter** | Rust | 50052 | 8000 | MongoDB | `twitter` |
| **Classification** | Python | 50053 | 8083 | ONNX model | `classification` |
| **Notification** | Python | 50054 | - | PostgreSQL | `notification` |
| **NLP** | Python | 50055 | - | PostgreSQL | `nlp` |
| **Blockchain** | Python | 50056 | - | MongoDB | `blockchain` |
| **Issue** | Python | 50057 | - | MongoDB | `issue` |
| **Asset** | Python | 50058 | 8088 | ImageKit | `asset` |

## Communication Patterns

### gRPC (Sync)
Request-response via protobuf contracts:

```mermaid
sequenceDiagram
    participant G as Gateway
    participant S as Service

    G->>S: gRPC Request (protobuf)
    Note over G,S: Service:50051 - 50058
    S-->>G: gRPC Response
```

### RabbitMQ (Async)
Event bus dengan topic exchange `ecoguard.events`:

```mermaid
graph LR
    TW[Twitter Service] -->|tweet.ingested| RMQ[(RabbitMQ)]
    CL[Classification] -->|classification.completed| RMQ
    IS[Issue Service] -->|issue.created| RMQ
    RMQ -->|subscribe| GW[Gateway]
    RMQ -->|subscribe| NO[Notification]
```

### Database Isolation
Tiap service punya database sendiri — **no sharing**:

```mermaid
graph TB
    subgraph PG["PostgreSQL"]
        UA[(ecoguard_user)]
        NO[(ecoguard_notif)]
    end
    subgraph MG["MongoDB"]
        TW[(ecoguard_twitter)]
        IS[(ecoguard_issue)]
        BC[(ecoguard_blockchain)]
    end
    subgraph Cloud["Cloud"]
        IK[(ImageKit)]
    end
    subgraph File["File"]
        OX[(ONNX model.onnx)]
    end
```
