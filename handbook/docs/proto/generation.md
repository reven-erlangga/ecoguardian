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

## Generate Rust Stubs

Rust uses `tonic-build` in `build.rs` — automatically compiled on each `cargo build`:

```rust
// backend/twitter-service/build.rs
fn main() {
    tonic_build::configure()
        .build_client(true)
        .build_server(true)
        .include_dot_paths(true)
        .compile(&["../../protobuf/twitter/service.proto"], &["../../protobuf"])
        .unwrap();
}
```

## Output Structure

Setiap service punya generated stubs di direktori masing-masing:

| Service | Directory | Tools |
|---------|-----------|-------|
| Python services | `proto/` or `protogen/` | `grpc_tools.protoc` |
| Rust services | `src/protos/` | `tonic-build` |
| Gateway | `.mesh/` (cache) | GraphQL Mesh otomatis |
