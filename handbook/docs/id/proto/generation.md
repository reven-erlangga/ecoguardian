# Code Generation

Menggunakan **buf** untuk generate kode dari proto.

## Generate

```bash
cd protobuf
buf generate
```

## Python

```bash
cd backend/classification-service
python -m grpc_tools.protoc \
  -I ../../protobuf \
  --python_out=protogen \
  --grpc_python_out=protogen \
  ../../protobuf/classification/service.proto
```

## Rust

`build.rs` otomatis compile proto tiap `cargo build`.
