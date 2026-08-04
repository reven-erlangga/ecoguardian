# Message Types

Tipe pesan utama yang digunakan.

## Common

```protobuf
message Timestamp { int64 seconds = 1; int32 nanos = 2; }
message Pagination { int32 page = 1; int32 per_page = 2; }
message Empty {}
```

## Key Messages

| Message | Service | Fungsi |
|---------|---------|--------|
| ClassificationResult | classification | label + confidence + candidates |
| Tweet | twitter | Data tweet dengan media_urls |
| Issue | issue | Laporan dengan status, location |
| Cluster | issue | Group issues by location |
| Block | blockchain | Block dengan hash + data |
| ValidationMessage | twitter | Auto-reply validation |
