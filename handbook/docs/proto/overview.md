# Protobuf Contracts

All gRPC service communication is defined in **Protobuf** (`.proto` files) and managed using **buf**.

## Lokasi

```
protobuf/
├── buf.yaml              # Project config
├── buf.gen.yaml          # Code gen config
├── common/
│   └── common.proto      # Shared types
├── asset/                # AssetService
├── blockchain/           # BlockchainService
├── classification/       # ClassificationService
├── dashboard/            # DashboardService
├── issue/                # IssueService
├── nlp/                  # NLPService
├── notification/         # NotificationService
├── twitter/              # TwitterService
└── user/                 # UserService + AuthService
```
