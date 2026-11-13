# 14. Appendices

## A. Glossary

- **Design / design state:** the serialized JSON describing a customized trophy (2D and/or 3D). The unit of work in the customization engine.
- **Custom trophy line item:** a cart/order line referencing a `design_id`. Contrast with a **standard product** line item.
- **Preset / template:** a `DesignPreset` — a seed design a customer clones and modifies.
- **Production job:** a fulfillment task created per custom line item, routed to a workshop by complexity + material.
- **LOD:** Level of Detail — high/low-poly model variants served by device capability.
- **PBR:** Physically Based Rendering — realistic material model used in the 3D viewer.
- **Draco / KTX2:** geometry and GPU-texture compression for glTF assets.
- **RSC / ISR / PPR:** React Server Components / Incremental Static Regeneration / Partial Pre-Rendering (Next.js rendering strategies).
- **Idempotency:** processing a repeated webhook event id has no additional effect.

## B. Proposed repository / folder structure

```
trophy-heaven/
  apps/
    storefront/                 # Next.js 16 App Router
      app/(shop|customize|account|admin)/
      components/{ui,features}/
      lib/{medusa,stores,hooks}/
    medusa/                     # Medusa v2 backend
      src/modules/{trophy-customization,production-workflow,bulk-order,corporate-account}/
      src/subscribers/  src/workflows/  src/api/{store,admin}/
      src/migrations/
  packages/
    schemas/                    # shared Zod schemas (design state, entities)
    config/                     # shared tsconfig/eslint
  docs/                         # THIS doc set
  docker-compose.yml
```

## C. Architecture Decision Records (ADR)

Append-only. Each records context → decision → consequences.

- **ADR-001 — Medusa v2 over Shopify.** Deep customization (2D/3D engine, approval pipeline, bulk/corporate, production routing) needs schema/API ownership. Consequence: we self-host and own DevOps; gain full extensibility.
- **ADR-002 — Next.js 16 App Router over Pages Router.** RSC + ISR/PPR for SEO and speed; streaming for interactive islands. Consequence: server-first mental model; client islands for editor/viewer/cart.
- **ADR-003 — Upgrade to current stable versions.** Next 16.3 / React 19.2 / Fabric 7 / R3F 9 / Node 24 LTS / Postgres 18 supersede the brief's older versions. Consequence: newer APIs (Turbopack default, React Compiler, Fabric v7 imports); watch migration notes per library.
- **ADR-004 — Fabric.js 7 over Konva/PixiJS.** Mature object model, JSON round-trip, SVG parsing. Consequence: canvas is client-only, lazy-loaded; server preview uses node-canvas/Puppeteer.
- **ADR-005 — React Three Fiber over raw Three.js.** Declarative, integrates with React state. Consequence: pair R3F major with React major; keep viewer in a dynamic chunk.
- **ADR-006 — Design state as versioned JSON.** Human-readable, DB-storable, AI-friendly, forward-compatible. Consequence: strict Zod validation + schema `version` field on every state.
- **ADR-007 — Server-side re-validation of bulk uploads.** Client parse (SheetJS) is UX only; server is source of truth. Consequence: two validators kept in agreement via shared schema.
- **ADR-008 — Dual payment gateways.** Razorpay (India/UPI) + Stripe (international) for coverage and resilience. Consequence: idempotent webhook handling per provider; reconciliation runbook.

## D. Environment variable reference (starter)

> Names are indicative; keep real values in a managed secret store, never in the repo.

```
# Core
NODE_ENV=production
DATABASE_URL=postgres://…            # PostgreSQL 18
REDIS_URL=redis://…                  # Redis 7 / Valkey 8
MEDUSA_BACKEND_URL=…
STORE_CORS=…   ADMIN_CORS=…   AUTH_CORS=…
JWT_SECRET=…   COOKIE_SECRET=…

# Search
MEILISEARCH_HOST=…   MEILISEARCH_API_KEY=…    # or ALGOLIA_APP_ID / ALGOLIA_API_KEY

# Storage / CDN / media
S3_BUCKET=…  S3_REGION=…  S3_ACCESS_KEY_ID=…  S3_SECRET_ACCESS_KEY=…   # or R2_* equivalents
CDN_BASE_URL=…
CLOUDINARY_URL=…

# Payments
RAZORPAY_KEY_ID=…  RAZORPAY_KEY_SECRET=…  RAZORPAY_WEBHOOK_SECRET=…
STRIPE_SECRET_KEY=…  STRIPE_WEBHOOK_SECRET=…

# Shipping
SHIPROCKET_EMAIL=…  SHIPROCKET_PASSWORD=…    # or DELHIVERY_API_TOKEN=…

# Notifications
RESEND_API_KEY=…                     # or SENDGRID_API_KEY=…
TWILIO_ACCOUNT_SID=…  TWILIO_AUTH_TOKEN=…    # or MSG91_AUTH_KEY=…

# Observability / analytics
SENTRY_DSN=…
NEXT_PUBLIC_GA4_ID=…  MIXPANEL_TOKEN=…

# Frontend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=…
NEXT_PUBLIC_CDN_BASE_URL=…
```

## E. Design-state envelope (both modes)

When a design has been edited in both modes, `state_json` uses an envelope so each mode's state is preserved and the shared fields stay in sync (see [06 §6.8](./06-data-models.md#68-3d-design-state-json-schema-threejs-scene-graph-subset)):

```jsonc
{
  "shared": { "engravingText": "…", "logoUrl": "…", "material": "polished_gold" },
  "2d": { /* Design2DState */ },
  "3d": { /* Design3DState */ }
}
```
