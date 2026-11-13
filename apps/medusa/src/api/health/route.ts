import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/** Liveness probe for uptime monitoring (see docs/kit/03 §3.8). */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({ status: "ok", service: "trophy-heaven-medusa", time: new Date().toISOString() })
}
