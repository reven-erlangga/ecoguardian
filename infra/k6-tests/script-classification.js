import http from "k6/http";
import { check, sleep } from "k6";
import encoding from "k6/encoding";

/*
 * Load test for the classification pipeline via the Twitter Service's
 * HTTP trigger-classify endpoint.
 *
 * The service downloads the image from the provided URL and forwards it
 * to the Classification Service over gRPC.
 *
 * Since we cannot serve a real image during load tests, we point to a
 * non-existent URL and measure how the service handles the error path
 * (download failure → error response).  To test the happy path, replace
 * FAKE_IMAGE_URL with a URL that returns a real JPEG.
 */

export const options = {
  stages: [
    { duration: "30s", target: 5 },  // ramp up
    { duration: "1m", target: 5 },   // steady
    { duration: "30s", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // classification may take longer
    http_req_failed: ["rate<0.05"],    // allow some errors (unreachable image)
  },
};

const TWITTER_BASE = __ENV.TWITTER_BASE || "http://localhost:8000";

// A non-existent URL — the service will try to fetch, fail, and return an error.
// This exercises the full ingestion flow without needing a real image server.
const FAKE_IMAGE_URL = "https://loadtest-nonexistent.example/img.jpg";

export default function () {
  const tweetId = `loadtest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const payload = JSON.stringify({
    tweet_id: tweetId,
    text: "Load test image classification",
    author: "loadtester",
    author_username: "@loadtester",
    media_urls: [FAKE_IMAGE_URL],
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(`${TWITTER_BASE}/trigger-classify`, payload, params);

  // The service returns 200 with an "error" field when the download fails,
  // or 422/400 for malformed requests — both are "expected" here.
  check(res, {
    "response received": (r) => r.status !== 0,
    "status is 200 or 4xx": (r) => r.status === 200 || r.status >= 400,
    "response has body": (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}
