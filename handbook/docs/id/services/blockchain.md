# Blockchain Service

Implementasi **simple blockchain** untuk mencatat hasil klasifikasi dan resolusi issue secara immutable.

## Tech Stack

- **Python** (Flask + grpcio)
- **MongoDB** — penyimpanan blockchain + blocks
- **RabbitMQ** — publish event

## Lokasi Kode

```
backend/blockchain-service/
├── chain/
│   ├── block.py          # Block structure + hashing
│   ├── service.py        # Blockchain business logic
│   └── repository.py     # MongoDB operations
├── common/
│   ├── config.py
│   └── grpc_server.py
├── proto/
├── server.py
└── requirements.txt
```

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50056 | gRPC | `BlockchainService` RPC |

## Proto Contract

```protobuf
service BlockchainService {
  rpc RecordClassification(RecordClassificationRequest) returns (RecordClassificationResponse);
  rpc RecordResolution(RecordResolutionRequest) returns (RecordResolutionResponse);
  rpc GetHistory(GetHistoryRequest) returns (GetHistoryResponse);
  rpc VerifyChain(Empty) returns (VerifyChainResponse);
}
```

## Block Structure

```python
# chain/block.py
import hashlib
import json

class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data          # classification / resolution data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "timestamp": str(self.timestamp),
            "data": self.data,
            "previous_hash": self.previous_hash,
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
```

## Cara Running

```bash
cd infra
docker compose up blockchain-service -d
```
