import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { requireCapability } from "../lib/rbac"
import { isJwtBearer } from "../lib/rate-limit-auth"

/**
 * Simple in-memory sliding-window rate limiter (NFR-4 / docs/kit/03 §3.7).
 * Store routes only get the authenticated multiplier for a real JWT, not a
 * dummy Authorization header. `/auth/*` is always strict.
 */
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function rateLimit(opts: {
  windowMs: number
  max: number
  key?: string
  strict?: boolean
  trust?: "jwt" | "any"
}) {
  return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const now = Date.now()
    const authed =
      !opts.strict &&
      (opts.trust === "any"
        ? Boolean((req.headers.authorization || req.headers.cookie) as string)
        : isJwtBearer(req.headers.authorization as string | undefined))
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
    {
      matcher: "/admin/*",
      middlewares: [rateLimit({ windowMs: 60_000, max: 200, trust: "any" })],
    },
    { matcher: "/auth/*", middlewares: [rateLimit({ windowMs: 60_000, max: 20, strict: true })] },
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
    { matcher: "/store/bulk-orders/*/upload", middlewares: [rateLimit({ windowMs: 60_000, max: 10 })] },
    {
      matcher: "/webhooks/razorpay",
      method: ["POST"],
      bodyParser: { preserveRawBody: true },
      middlewares: [rateLimit({ windowMs: 60_000, max: 1000 })],
    },
    {
      matcher: "/admin/corporate-profiles/*",
      method: ["PUT", "POST", "DELETE"],
      middlewares: [requireCapability("corporate:manage")],
    },
    {
      matcher: "/admin/production-jobs",
      method: ["GET"],
      middlewares: [requireCapability("production:view")],
    },
    {
      matcher: "/admin/production-jobs/*",
      method: ["GET"],
      middlewares: [requireCapability("production:view")],
    },
    {
      matcher: "/admin/production-jobs/*",
      method: ["POST", "PUT"],
      middlewares: [requireCapability("production:update")],
    },
    {
      matcher: "/admin/design-approvals",
      method: ["GET"],
      middlewares: [requireCapability("production:view")],
    },
    {
      matcher: "/admin/design-approvals/*",
      method: ["POST"],
      middlewares: [requireCapability("designs:approve")],
    },
    {
      matcher: "/admin/blog/*",
      middlewares: [requireCapability("content:manage")],
    },
    {
      matcher: "/admin/reviews/*",
      middlewares: [requireCapability("reviews:moderate")],
    },
    {
      matcher: "/admin/search/*",
      middlewares: [requireCapability("search:manage")],
    },
  ],
})
