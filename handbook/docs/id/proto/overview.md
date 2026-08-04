# Protobuf Contracts

Semua komunikasi gRPC antar service didefinisikan dalam **Protobuf** (`.proto` files). Tooling menggunakan **buf**.

## Lokasi

```
protobuf/
├── buf.yaml              # Buf config
├── buf.gen.yaml          # Code generation config
├── common/
│   └── common.proto      # Shared types
├── asset/
│   ├── asset.proto
│   └── service.proto
├── blockchain/
│   ├── blockchain.proto
│   └── service.proto
├── classification/
│   ├── classification.proto
│   └── service.proto
├── dashboard/
│   ├── dashboard.proto
│   └── service.proto
├── issue/
│   ├── issue.proto
│   └── service.proto
├── nlp/
│   ├── nlp.proto
│   └── service.proto
├── notification/
│   ├── notification.proto
│   └── service.proto
├── twitter/
│   ├── twitter.proto
│   └── service.proto
└── user/
    ├── user.proto
    └── service.proto
```

## Shared Types (`common/common.proto`)

```protobuf
message Timestamp {
  int64 seconds = 1;
  int32 nanos = 2;
}

message Pagination {
  int32 page = 1;
  int32 per_page = 2;
}

message Empty {}

message Error {
  string code = 1;
  string message = 2;
}
```

## Service Matrix

| Proto Package | Service | RPC Methods |
|---------------|---------|-------------|
| `asset` | AssetService | UploadAsset, GetAsset, ListAssets |
| `blockchain` | BlockchainService | RecordClassification, RecordResolution, GetHistory, VerifyChain |
| `classification` | ClassificationService | ClassifyImage |
| `dashboard` | DashboardService | GetStats |
| `issue` | IssueService | ListIssues, GetIssue |
| `nlp` | NLPService | AnalyzeText, Geocode |
| `notification` | NotificationService | SendNotification, GetNotifications, MarkRead |
| `twitter` | TwitterService | IngestTweet, GetTweet, QueryTweets |
| `user` | UserService | Register, Login, GetUser, UpdateUser, GetUserCount |
| `user` | AuthService | ValidateToken, RefreshToken, Logout |

## Cara Generate Proto

```bash
cd protobuf
buf generate
```

## Cara Kerja

1. Service mendefinisikan contract di `protobuf/<service>/`
2. `buf generate` menghasilkan stub di masing-masing service (`protogen/` atau `proto/`)
3. Service implement gRPC server berdasarkan generated stub
4. Gateway dan service lain menggunakan generated client untuk komunikasi
