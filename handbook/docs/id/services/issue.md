# Issue Service

Mengelola **laporan masalah** (issues) dari warga. CRUD issue, status tracking, dan publish event ke RabbitMQ.

## Tech Stack

- **Python** (grpcio only, no Flask)
- **MongoDB** — penyimpanan issues
- **RabbitMQ** — publish event `issue.created`

## Lokasi Kode

```
backend/issue-service/
├── lib/
│   ├── service.py        # Business logic
│   └── db.py             # MongoDB repository
├── rabbitmq/
│   └── publisher.py      # Event publisher
├── proto/
├── server.py
└── requirements.txt
```

## Port

| Port | Protokol | Fungsi |
|------|----------|--------|
| 50057 | gRPC | IssueService RPC |

## Proto Contract

```protobuf
service IssueService {
  rpc ListIssues(ListIssuesRequest) returns (ListIssuesResponse);
  rpc GetIssue(GetIssueRequest) returns (GetIssueResponse);
}
```

## Cara Running

```bash
cd infra
docker compose up issue-service -d
```
