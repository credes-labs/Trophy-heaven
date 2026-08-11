import http from "k6/http"
import { check, sleep } from "k6"

/**
 * k6 load smoke for the money path (docs/kit/07 §7.7). Exercises catalog + search
 * read endpoints under moderate concurrency. Run:
 *   k6 run -e BASE=http://localhost:9000 -e PUBKEY=pk_… docs/load/k6-smoke.js
 */
export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
}

const BASE = __ENV.BASE || "http://localhost:9000"
const PUBKEY = __ENV.PUBKEY || ""

export default function () {
  const headers = { "x-publishable-api-key": PUBKEY }

  const products = http.get(`${BASE}/store/products?limit=12`, { headers })
  check(products, { "products 200": (r) => r.status === 200 })

  const search = http.get(`${BASE}/store/search?q=trophy`, { headers })
  check(search, { "search 200": (r) => r.status === 200 })

  sleep(1)
}
