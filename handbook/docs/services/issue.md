# Issue Service

Issue/citizen report management.

- **Python** (grpcio only)
- **MongoDB** — issue storage
- **RabbitMQ** — publish `issue.created` event

**Port**: `50057` (gRPC)

**Proto**: `IssueService` (ListIssues, GetIssue)

## Tests

| File | Coverage |
|------|----------|
| `tests/test_issue_service.py` | List (empty, with results), Get (existing, not-found), Resolve (success, not-found), Doc conversion (minimal, location, resolution) |
