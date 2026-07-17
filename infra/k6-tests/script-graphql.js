import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // ramp up to 10 users
    { duration: "1m", target: 10 },  // stay at 10
    { duration: "30s", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests under 2s
    http_req_failed: ["rate<0.01"],    // <1% errors
  },
};

const GRAPHQL_URL = __ENV.GRAPHQL_URL || "http://localhost:4000/graphql";

export default function () {
  // Minimal query — no arguments so it doesn't depend on external data
  const query = `
    query {
      classification_classifyImage(imageData: "", imageFormat: "jpeg") {
        result {
          label
          confidence
        }
      }
    }
  `;

  const payload = JSON.stringify({ query });
  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(GRAPHQL_URL, payload, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 2s": (r) => r.timings.duration < 2000,
  });

  // Wait between iterations to simulate real user pacing
  sleep(1);
}
