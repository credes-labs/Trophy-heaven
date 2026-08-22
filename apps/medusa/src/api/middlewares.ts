import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { requireCapability } from "../lib/rbac"

/**
 * Simple in-memory sliding-window rate limiter (NFR-4 / docs/kit/03 §3.7).
 * Anonymous ~100 req/min, authenticated ~1000 req/min. In production this is
 * backed by Redis counters; the in-memory version is a safe default for a single
 * node and local dev. Stricter limits apply to upload + auth routes via config.
 */
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function rateLimit(opts: { windowMs: number; max: number; key?: string; strict?: boolean }) {
  return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const now = Date.now()
    const authed = Boolean((req.headers.authorization || req.headers.cookie) as string)
    const key = `${req.ip ?? "anon"}:${authed ? "auth" : "anon"}:${opts.key ?? "global"}`
    const max = authed && !opts.strict ? opts.max * 10 : opts.max

    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + opts.windowMs }
      buckets.set(key, bucket)
    }
    bucket.count += 1

    res.setHeader("X-RateLimit-Limit", String(max))
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)))

    if (bucket.count > max) {
      res.status(429).json({
        error: { code: "RATE_LIMITED", message: "Too many requests, please retry shortly." },
      })
      return
    }
    next()
  }
}

export default defineMiddlewares({
  routes: [
    { matcher: "/store/*", middlewares: [rateLimit({ windowMs: 60_000, max: 100 })] },
    { matcher: "/admin/*", middlewares: [rateLimit({ windowMs: 60_000, max: 200 })] },
    { matcher: "/auth/*", middlewares: [rateLimit({ windowMs: 60_000, max: 20 })] },
    // Write-sensitive endpoints get strict per-customer limits (no authed multiplier).
    {
      matcher: "/store/reviews",
      method: ["POST"],
      middlewares: [rateLimit({ windowMs: 60_000, max: 5, key: "reviews", strict: true })],
    },
    {
      matcher: "/store/wishlist",
      method: ["POST"],
      middlewares: [rateLimit({ windowMs: 60_000, max: 30, key: "wishlist", strict: true })],
    },
    // Bulk upload is heavier — tighten the window for the upload endpoint.
    { matcher: "/store/bulk-orders/*/upload", middlewares: [rateLimit({ windowMs: 60_000, max: 10 })] },
    // Razorpay webhooks: preserve raw body for HMAC; no JWT (signature-verified).
    {
      matcher: "/webhooks/razorpay",
      method: ["POST"],
      bodyParser: { preserveRawBody: true },
      middlewares: [rateLimit({ windowMs: 60_000, max: 1000 })],
    },
    // Admin corporate management requires the `corporate:manage` capability.
    {
      matcher: "/admin/corporate-profiles/*",
      method: ["PUT", "POST", "DELETE"],
      middlewares: [requireCapability("corporate:manage")],
    },
    // Production board is visible to designers + production managers + admins.
    {
      matcher: "/admin/production-jobs",
      method: ["GET"],
      middlewares: [requireCapability("production:view")],
    },
    // Mutating a job (status, shipping) requires `production:update`.
    {
      matcher: "/admin/production-jobs/*",
      method: ["POST", "PUT"],
      middlewares: [requireCapability("production:update")],
    },
    // Viewing the approvals queue needs `production:view`.
    {
      matcher: "/admin/design-approvals",
      method: ["GET"],
      middlewares: [requireCapability("production:view")],
    },
    // Approving/rejecting requires the `designs:approve` capability.
    {
      matcher: "/admin/design-approvals/*",
      method: ["POST"],
      middlewares: [requireCapability("designs:approve")],
    },
  ],
})
