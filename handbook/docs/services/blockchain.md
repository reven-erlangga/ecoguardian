# Blockchain Service

Simple blockchain implementation for immutable logging of classifications and issue resolutions.

- **Python** (Flask + grpcio)
- **MongoDB** — block storage
- **SHA-256** hashing

**Port**: `50056` (gRPC)

**Proto**: `BlockchainService` (RecordClassification, RecordResolution, GetHistory, VerifyChain)

**Block structure**:

```python
class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()  # SHA-256
```

## Tests

| File | Coverage |
|------|----------|
| `tests/test_blockchain.py` | Genesis, block creation, hash integrity, chain validation, tamper detection, PoW difficulty, empty chain |
