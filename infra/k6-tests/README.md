# k6 Load Tests — Ecoguard

Performance and soak tests for the Ecoguard backend services.  
Scripts are standalone — no external dependencies beyond [k6](https://k6.io/).

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo apt install k6
# or
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install k6

# Windows (chocolatey)
choco install k6

# All platforms — direct binary
# See: https://k6.io/docs/getting-started/installation/
```

All target services must be running (locally or on a remote host).

## Scripts

| Script | Endpoint | What it tests |
|---|---|---|
| `script-graphql.js` | Gateway GraphQL (port 4000) | GraphQL query parsing, aggregation, end-to-end latency |
| `script-classification.js` | Twitter Service `/trigger-classify` (port 8000) | Image classification pipeline via HTTP trigger |
| `script-tweet-ingest.js` | Twitter Service `/trigger-classify` (port 8000) | Concurrent tweet ingest payloads |

## Running

```bash
# Navigate to the k6-tests directory
cd infra/k6-tests

# GraphQL gateway
k6 run script-graphql.js

# Classification pipeline (error path — uses unreachable image URL)
k6 run script-classification.js

# Tweet ingest (high concurrency)
k6 run script-tweet-ingest.js
```

### Run Against a Different Host

```bash
# Override the default localhost:4000 for GraphQL
k6 run -e GRAPHQL_URL=http://192.168.1.50:4000/graphql script-graphql.js

# Override the default localhost:8000 for Twitter Service
k6 run -e TWITTER_BASE=http://192.168.1.50:8000 script-classification.js
k6 run -e TWITTER_BASE=http://192.168.1.50:8000 script-tweet-ingest.js
```

### Modify Load Profile

Edit the `stages` array inside each script, or override thresholds:

```bash
# Run with more virtual users for a longer duration
# (edit the script directly for custom stage profiles)
```

### Output Results to a JSON File

```bash
k6 run --out json=results.json script-graphql.js
```

## Interpreting Results

Key metrics printed after each run:

| Metric | Meaning |
|---|---|
| `http_req_duration` | End-to-end request latency (ms) |
| `p(95)` | 95th percentile — 95% of requests are at or below this value |
| `http_req_failed` | Fraction of failed requests |
| `iterations` | Total requests completed |
| `vus` | Virtual users at peak |

### Example Output

```
  ✓ status is 200
  ✓ response time < 2s

  checks.........................: 100.00% ✓ 450      ✗ 0
  data_received..................: 1.2 MB  13 kB/s
  data_sent......................: 480 kB  5.3 kB/s
  http_req_blocked...............: avg=32µs   min=2µs     med=10µs   max=4ms
  http_req_connecting............: avg=8µs    min=0s      med=0s     max=2ms
  http_req_duration..............: avg=245ms  min=89ms    med=210ms  max=1.2s
  http_req_failed................: 0.00%   ✓ 0        ✗ 450
  http_req_receiving.............: avg=128µs  min=25µs    med=95µs   max=1.2ms
  http_req_sending...............: avg=42µs   min=12µs    med=30µs   max=380µs
  http_req_tls_handshaking.......: avg=0s     min=0s      med=0s     max=0s
  http_req_waiting...............: avg=244ms  min=89ms    med=209ms  max=1.2s
  http_reqs......................: 450     5.0/s
  iteration_duration.............: avg=1.25s  min=1.09s   med=1.21s  max=2.22s
  iterations.....................: 450     5.0/s
  vus............................: 1       min=0      max=10
  vus_max........................: 10      min=10     max=10
```
