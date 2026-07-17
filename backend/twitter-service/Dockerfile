# ─── Build ────────────────────────────────────────────────────
FROM rust:slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build

# ponytail: proto files dibutuhkan oleh build.rs
COPY protobuf /build/protobuf/
COPY backend/twitter-service /build/backend/twitter-service/

WORKDIR /build/backend/twitter-service
# ponytail: ignore rust-version check — some deps require nightly
RUN cargo build --release --ignore-rust-version

# ─── Runtime ──────────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/backend/twitter-service/target/release/twitter-service \
    /usr/local/bin/twitter-service

EXPOSE 8000 50052

ENTRYPOINT ["twitter-service"]
