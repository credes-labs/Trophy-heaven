import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// Medusa forces TLS for any non-localhost database. Render's private network is plain
// Postgres, so DATABASE_SSL=false turns that off (modules read DATABASE_URL directly).
if (process.env.DATABASE_SSL === "false" && process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL
  if (!/ssl_?mode=/i.test(url)) {
    process.env.DATABASE_URL = `${url}${url.includes("?") ? "&" : "?"}sslmode=disable`
  }
}

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
// Render sets RENDER_EXTERNAL_URL to the service's public URL.
const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:9000"
const STORE_CORS = process.env.STORE_CORS || "http://localhost:3000"
const IS_PRODUCTION = process.env.NODE_ENV === "production"

// Production must have durable file storage: a host's disk is wiped on every deploy,
// which would silently lose customers' uploaded designs. `medusa build` runs without
// NODE_ENV=production in the Dockerfile, so this only applies when the app really runs.
// ALLOW_LOCAL_FILE_STORAGE=true is for a short preview with a volume mounted at ./static.
if (
  IS_PRODUCTION &&
  !process.env.S3_ENDPOINT &&
  process.env.ALLOW_LOCAL_FILE_STORAGE !== "true"
) {
  throw new Error("S3_ENDPOINT (Cloudflare R2) is required in production for customer uploads.")
}

/**
 * Trophy Heaven Medusa v2.18 configuration.
 *
 * Core commerce modules (Product, Pricing, Inventory, Cart, Order, Customer,
 * Payment, Fulfillment, Tax, Promotion, Auth, File, Notification) are enabled by
 * default. Here we wire the Redis-backed cache / event bus / workflow engine
 * (see docs/kit/03 §3.3, §3.4) plus providers and, per phase, custom modules.
 *
 * Custom business modules are added to `modules` in their respective phases:
 *   - Phase 2: ./src/modules/trophy-customization
 *   - Phase 4: ./src/modules/bulk-order, ./src/modules/corporate-account
 *   - Phase 5: ./src/modules/production-workflow
 *
 * NOTE: the kit pins MikroORM 6.6.14 (CVE-2026-44680 patch) for production; the
 * dependency here tracks the version verified with Medusa 2.18 — bump in a
 * dedicated security PR once validated against the 2.18 migration set.
 */
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    // `shared` runs API + background jobs together; split with `server` / `worker` to scale.
    workerMode: (process.env.MEDUSA_WORKER_MODE || "shared") as "shared" | "worker" | "server",
    http: {
      storeCors: STORE_CORS,
      adminCors: process.env.ADMIN_CORS || BACKEND_URL,
      authCors: process.env.AUTH_CORS || `${STORE_CORS},${BACKEND_URL}`,
      // No fallback in production: Medusa refuses to start without real secrets.
      jwtSecret: process.env.JWT_SECRET || (IS_PRODUCTION ? undefined : "supersecret"),
      cookieSecret: process.env.COOKIE_SECRET || (IS_PRODUCTION ? undefined : "supersecret"),
    },
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  modules: [
    // ── Redis-backed infrastructure (sessions, cart, reservations, pub/sub) ──
    { resolve: "@medusajs/medusa/cache-redis", options: { redisUrl: REDIS_URL } },
    { resolve: "@medusajs/medusa/event-bus-redis", options: { redisUrl: REDIS_URL } },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { redisUrl: REDIS_URL } },
    },
    // ── File storage: S3 / Cloudflare R2 in prod, local on-disk in dev ───────
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: process.env.S3_ENDPOINT
          ? [
              {
                resolve: "@medusajs/medusa/file-s3",
                id: "s3",
                options: {
                  file_url: process.env.CDN_BASE_URL,
                  access_key_id: process.env.S3_ACCESS_KEY_ID,
                  secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                  region: process.env.S3_REGION,
                  bucket: process.env.S3_BUCKET,
                  endpoint: process.env.S3_ENDPOINT,
                  additional_client_config: { forcePathStyle: true },
                  // R2 access is set on the bucket; it has no per-object ACLs.
                  acl: false,
                },
              },
            ]
          : [
              {
                resolve: "@medusajs/medusa/file-local",
                id: "local",
                options: { upload_dir: "static", backend_url: `${BACKEND_URL}/static` },
              },
            ],
      },
    },
    // ── Payments: Razorpay (India, primary) + Stripe (international) ──────────
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          ...(process.env.RAZORPAY_KEY_ID
            ? [
                {
                  resolve: "./src/modules/razorpay",
                  id: "razorpay",
                  options: {
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
                  },
                },
              ]
            : []),
          ...(process.env.STRIPE_SECRET_KEY
            ? [
                {
                  resolve: "@medusajs/medusa/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_SECRET_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                  },
                },
              ]
            : []),
        ],
      },
    },
    // ── Notifications: Resend (email) + MSG91 (SMS) in prod, local in dev ─────
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          ...(process.env.RESEND_API_KEY
            ? [
                {
                  resolve: "./src/modules/resend",
                  id: "resend",
                  options: {
                    channels: ["email"],
                    api_key: process.env.RESEND_API_KEY,
                    from: process.env.RESEND_FROM || "Trophy Heaven <orders@trophyheaven.example>",
                  },
                },
              ]
            : []),
          ...(process.env.MSG91_AUTH_KEY
            ? [
                {
                  resolve: "./src/modules/msg91",
                  id: "msg91",
                  options: {
                    channels: ["sms"],
                    auth_key: process.env.MSG91_AUTH_KEY,
                    sender_id: process.env.MSG91_SENDER_ID,
                  },
                },
              ]
            : []),
          {
            // Logs channels with no real provider. Medusa refuses two providers on one channel.
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              channels: [
                "feed",
                ...(process.env.RESEND_API_KEY ? [] : ["email"]),
                ...(process.env.MSG91_AUTH_KEY ? [] : ["sms"]),
              ],
            },
          },
        ],
      },
    },
    // ── Custom modules ────────────────────────────────────────────────────────
    // Phase 2: 2D/3D trophy customization (Design / DesignPreset / DesignRevision)
    { resolve: "./src/modules/trophy-customization" },
    // Phase 4: bulk orders + corporate accounts
    { resolve: "./src/modules/bulk-order" },
    { resolve: "./src/modules/corporate-account" },
    // Phase 5: production workflow (jobs + design approvals)
    { resolve: "./src/modules/production-workflow" },
    // Phase 6: content + engagement
    { resolve: "./src/modules/blog" },
    { resolve: "./src/modules/wishlist" },
    { resolve: "./src/modules/reviews" },
    // Webhook idempotency store (processed provider event ids)
    { resolve: "./src/modules/webhook-events" },
  ],
})
