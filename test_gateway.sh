#!/usr/bin/env bash
# Quick test: start classification service + gateway, test classify
set -e

CLASS_DIR="/home/erlangga/projects/ecoguard/backend/classification-service"
GATEWAY_DIR="/home/erlangga/projects/ecoguard/backend/gateway"

echo "=== Starting Classification Service ==="
cd "$CLASS_DIR"
source venv/bin/activate
python server.py &
CLASS_PID=$!
sleep 2

echo "=== Starting Gateway ==="
cd "$GATEWAY_DIR"
./target/release/ecoguard-gateway &
GATEWAY_PID=$!
sleep 2

echo "=== Health Check ==="
curl -sf http://localhost:8083/health && echo " [classification OK]"
curl -sf http://localhost:8000/health && echo " [gateway OK]"

echo "=== GraphQL Test ==="
curl -s http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ classifyImage(imageBase64: \"dummy\", imageFormat: \"jpeg\") { result { label confidence } } }"}'

echo ""
echo "=== Done: kill processes ==="
kill $CLASS_PID $GATEWAY_PID 2>/dev/null
