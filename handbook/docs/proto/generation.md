# Code Generation

Using **buf** to manage and generate code from proto definitions.

## Install Buf

```bash
# Windows (choco)
choco install buf

# Linux / Mac
brew install buf

# Atau download binary
# https://github.com/bufbuild/buf/releases
```

## Generate Stubs

```bash
cd protobuf
buf generate
```

## Konfigurasi

### `buf.yaml` — Project config

```yaml
version: v2
modules:
  - path: .
lint:
  use:
    - STANDARD
breaking:
  use:
    - FILE
```

### `buf.gen.yaml` — Code generation

```yaml
version: v2
plugins:
  - local: protoc-gen-go
    out: .
    opt: paths=source_relative
  - local: protoc-gen-go-grpc
    out: .
    opt: paths=source_relative
```

> For Python, use `grpc_tools.protoc` directly.

## Generate Python Stubs

```bash
cd backend/classification-service

python -m grpc_tools.protoc \
  -I ../../protobuf \
  --python_out=protogen \
  --grpc_python_out=protogen \
  ../../protobuf/common/common.proto \
  ../../protobuf/classification/classification.proto \
  ../../protobuf/classification/service.proto
```

## Generate Node.js Stubs

Twitter Service (Node.js) memuat proto langsung saat runtime via `@grpc/proto-loader` — tidak perlu generate stubs terpisah. Proto dibaca dari `protobuf/` (di-copy ke `/app/proto` saat build Docker).

## Output Structure

Setiap service punya generated stubs di direktori masing-masing:

| Service | Directory | Tools |
|---------|-----------|-------|
| Python services | `proto/` or `protogen/` | `grpc_tools.protoc` |
| Twitter Service (Node) | runtime `proto-loader` | `@grpc/proto-loader` |
| Gateway | `.mesh/` (cache) | GraphQL Mesh otomatis |
