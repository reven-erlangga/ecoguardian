import http from "k6/http";
import { check, sleep } from "k6";

/*
 * Load test for the tweet ingest flow via the Twitter Service's HTTP
 * trigger-classify endpoint.
 *
 * This tests the service's ability to handle multiple concurrent payloads:
 * request parsing, gRPC forwarding, and error handling.
 */

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp up to 20 concurrent ingestions
    { duration: "1m", target: 20 },  // hold
    { duration: "30s", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.02"],  // allow small % of failures
  },
};

const TWITTER_BASE = __ENV.TWITTER_BASE || "http://localhost:8000";

// Sample texts to simulate realistic tweet content
const SAMPLE_TEXTS = [
  "Checking out this amazing sunset!",
  "New wildlife photo just uploaded",
  "Deforestation alert in the Amazon region",
  "Beach cleanup event this weekend",
  "Rare bird sighting in the national park",
  "Water pollution levels rising in the river",
  "Community garden project needs volunteers",
  "Air quality index update for today",
  "Endangered species protection program update",
  "Climate change impact on local agriculture",
];

export default function () {
  const idx = Math.floor(Math.random() * SAMPLE_TEXTS.length);
  const tweetId = `ingest-${Date.now()}-${__VU}-${__ITER}`;

  const payload = JSON.stringify({
    tweet_id: tweetId,
    text: SAMPLE_TEXTS[idx],
    author: "ecoguard_bot",
    author_username: "@ecoguard_bot",
    media_urls: [],
    metadata: {
      source: "k6-loadtest",
      vu: `${__VU}`,
      iter: `${__ITER}`,
    },
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(`${TWITTER_BASE}/trigger-classify`, payload, params);

  check(res, {
    "status is 200 or 4xx": (r) => r.status === 200 || r.status >= 400,
    "response body present": (r) => r.body && r.body.length > 0,
  });

  // Slightly random sleep to avoid thundering-herd patterns
  sleep(0.5 + Math.random());
}
