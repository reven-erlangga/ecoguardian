# NLP Service

Natural language processing for **text analysis** and **geocoding**.

- **Python** (Flask + grpcio)
- **PostgreSQL** — analysis results
- **Redis** — geocoding cache
- **Nominatim** — OpenStreetMap geocoding

**Port**: `50055` (gRPC)

**Proto**: `NLPService` (AnalyzeText, Geocode, **GenerateReply**)

**Features**: text classification, named entity recognition, paraphrase detection, address → coordinates, **natural reply generation**.

## GenerateReply (NEW)

Menghasilkan balasan natural berbahasa Indonesia berdasarkan konteks laporan:

```protobuf
rpc GenerateReply(GenerateReplyRequest) returns (GenerateReplyResponse);

message GenerateReplyRequest {
  string tweet_text = 1;
  repeated string missing_fields = 2;  // "media", "location"
  string classification_label = 3;
  float classification_confidence = 4;
}
```

Contoh output:
- `"Halo! Laporannya udah diterima nih. Tapi biar makin jelas, boleh kirim foto/gambarnya juga? 📸"`
- `"Lokasinya di mana ya? Boleh kasih alamat atau titik koordinat biar kami bisa tindaklanjutin 🙏"`

## Tests

| File | Coverage |
|------|----------|
| `tests/test_reply.py` | Reply generator — media missing, location missing, both, low confidence, high confidence, fallback, Indonesian language, variation |
