#!/bin/bash
# Test GraphQL Mesh gateway → classification service
set -e

# Port forward
kubectl port-forward -n ecoguard svc/gateway 4000:4000 > /dev/null &
PID=$!
sleep 4

# Generate base64 image
B64=$(cd /home/erlangga/projects/ecoguard/backend/classification-service && source venv/bin/activate && python3 -c "
import base64
with open('/tmp/test_deploy.jpg','rb') as f:
    print(base64.b64encode(f.read()).decode())
")

# Build query JSON
cat > /tmp/gql.json << ENDJSON
{"query":"mutation { classification_ClassificationService_ClassifyImage(input: { image_data: \"$B64\", image_format: \"jpeg\" }) { result { label confidence } } }"}
ENDJSON

echo "=== Response ==="
curl -s http://localhost:4000/graphql -X POST -H "Content-Type: application/json" -d @/tmp/gql.json | python3 -m json.tool

kill $PID 2>/dev/null
