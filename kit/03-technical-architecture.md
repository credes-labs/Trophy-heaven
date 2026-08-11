# 3. Technical Architecture

## 3.1 System overview

```
                              ┌─────────────────────────────────────────────┐
                              │                 CLIENTS                       │
                              │  Mobile web · Tablet · Desktop · (PWA)        │
                              └───────────────────────┬───────────────────────┘
                                                      │ HTTPS
                              ┌───────────────────────▼───────────────────────┐
                              │        Next.js 16 (App Router, Turbopack)       │
                              │  RSC pages (catalog/PDP/CMS) · SSR/ISR · SEO    │
                              │  Client islands: 2D editor, 3D viewer, cart     │
                              │  BFF route handlers (thin) · Zustand · TanStack │
                              └───────────┬───────────────────────┬────────────┘
                                          │ Store API (REST/SDK)   │ asset URLs
                              ┌───────────▼───────────┐   ┌────────▼─────────────┐
                              │    Medusa.js v2        │   │  CDN (CloudFront /    │
                              │  Core modules +        │   │  Cloudflare) +        │
                              │  Custom modules:       │   │  Cloudinary transforms│
                              │  • TrophyCustomization │   └────────┬─────────────┘
                              │  • ProductionWorkflow  │            │
                              │  • BulkOrder           │   ┌────────▼─────────────┐
                              │  • CorporateAccount    │   │  S3 / R2 object store │
                              │  Workflows·Subscribers │   │  3D models · previews │
                              └───┬─────────┬──────┬───┘   │  logos · invoices     │
                                  │         │      │       └───────────────────────┘
                    ┌─────────────▼──┐  ┌───▼───┐ ┌▼────────────┐
                    │ PostgreSQL 18   │  │Redis 7│ │ Meilisearch  │
                    │ core + custom   │  │cache· │ │ product +    │
                    │ tables          │  │queue· │ │ preset index │
                    └─────────────────┘  │pubsub │ └──────────────┘
                                         └───────┘
        External: Razorpay · Stripe · ShipRocket/Delhivery · Resend · Twilio/MSG91 · Sentry · GA4/Mixpanel
```

Layering: **Client** (Next.js) → **BFF/route handlers** (thin, mostly for auth-scoped fetches and webhooks that shouldn't hit the browser) → **Medusa v2** (business logic, modules, workflows) → **data layer** (Postgres/Redis/Meilisearch) → **assets** (S3/CDN/Cloudinary) → **external services**. The 2D/3D asset pipeline sits alongside (see [§3.5](#35-3d2d-asset-pipeline)).

---

## 3.2 Frontend architecture

**Stack:** Next.js 16.3 (App Router), React 19.2, TypeScript, Tailwind v4, shadcn/ui, Zustand 5, TanStack Query v5, Motion.

**App Router structure** (route groups):

```
app/
  (shop)/            # catalog, PDP, cart, checkout — mostly RSC + ISR
    products/[handle]/
    categories/[...slug]/
    cart/
    checkout/
  (customize)/       # the engine — client-heavy
    [productId]/2d/
    [productId]/3d/
  (account)/         # dashboard, designs, orders, addresses
  (admin)/           # admin surfaces (or Medusa Admin app)
  @modal/            # parallel route for product quick view
  ...cart drawer via intercepting route (.)cart
```

- **Component architecture:** atomic-ish. Shared primitives in `components/ui` (shadcn), feature components in `components/features/{editor2d,viewer3d,cart,checkout,bulk}`.
- **State:** Zustand stores for `cart`, `editor` (2D), `viewer` (3D), `ui` (modals/toasts). TanStack Query for server state (designs, orders, product lists on client surfaces). Server Components fetch catalog data directly via the Medusa JS SDK — no client fetch for PDPs.
- **Rendering strategy:** RSC + **ISR** for product/category pages (SEO + speed); interactive parts (editor, viewer, cart, checkout) are Client Components inside Suspense boundaries. Consider **Cache Components / PPR** (Next 16) so a cached shell renders instantly while dynamic parts stream.
- **2D editor architecture:** Fabric.js 7 wrapped in a `useFabricCanvas` hook. Editor state is serializable JSON (design state), kept in the `editor` Zustand store; undo/redo via an immutable history stack (bounded at 50). Canvas is lazy-loaded (`dynamic(() => ..., { ssr: false })`).
- **3D viewer architecture:** R3F `<Canvas>` with Suspense for `useGLTF` model loads; `<Bounds>`/`OrbitControls` from drei; `@react-three/drei` `Stats` (dev) for perf; device-capability detection selects LOD + texture resolution. Whole viewer is a dynamically imported client chunk.
- **Responsive strategy:** mobile-first Tailwind breakpoints. Editor = fullscreen modal on mobile with bottom-sheet tools; tablet = split view; desktop = 3-column (tools / canvas / properties). Feature-gate AR to supported devices. Abstract pointer vs touch handling in a shared hook.
- **PWA:** service worker for offline cart read + queued mutations; web app manifest; push for order updates (P2).
- **Performance:** Next `<Image>` with a Cloudinary loader; code-split the 2D and 3D chunks so they never load on catalog pages; prefetch on hover/viewport; ISR for PDPs; keep 3D behind an explicit user gesture to protect LCP.

---

## 3.3 Backend architecture — Medusa.js v2.18

**Stack:** Medusa v2.18, Node.js 24 LTS, TypeScript, MikroORM 6.6.14.

**Module system.** Medusa v2 is module-based: each module owns its data models, services, and (optionally) API routes, and stays decoupled from others at the DB level. Core commerce modules (Product, Pricing, Inventory, Cart, Order, Customer, Payment, Fulfillment, Tax, Promotion, Auth, File, Notification) are enabled and configured. Cross-module orchestration uses **Workflows**; reactive side effects use **Subscribers**.

**Custom modules to build**

1. **TrophyCustomizationModule**
   - Models: `Design`, `DesignPreset`, `DesignRevision`.
   - Services: `DesignService` (CRUD, clone-from-preset, share-link), `PreviewGenerationService` (design JSON → 800×800 PNG).
   - API routes: `POST /store/designs`, `GET /store/designs`, `GET /store/designs/:id`, `PUT /store/designs/:id`, `DELETE /store/designs/:id`, `POST /store/designs/:id/preview`, `POST /store/designs/:id/clone`, `POST /store/designs/:id/share`.

2. **ProductionWorkflowModule**
   - Models: `ProductionJob`, `DesignApproval`.
   - Services: `ProductionQueueService` (routing by complexity + material), `DesignApprovalService`.
   - Subscribers: `order.placed → create ProductionJob(s)`; `design.approved → advance job`.
   - Admin routes: production-jobs list/detail/status, design-approval approve/reject.

3. **BulkOrderModule**
   - Models: `BulkOrder`, `BulkOrderLine`.
   - Services: `BulkOrderService`, `ExcelParserService` (server-side re-validation of client-parsed uploads).
   - Routes: `POST /store/bulk-orders`, `POST /store/bulk-orders/upload`, `GET /store/bulk-orders/:id`, `POST /store/bulk-orders/:id/confirm`.

4. **CorporateAccountModule**
   - Models: `CorporateProfile`, `TeamMember`.
   - Services: `CorporateService` (credit limits, net terms, PO, account-manager assignment).
   - Routes: create/get profile, add team member, corporate order history.

**Module skeleton (illustrative):**

```ts
// src/modules/trophy-customization/index.ts
import { Module } from "@medusajs/framework/utils"
import DesignService from "./service"
export const TROPHY_CUSTOMIZATION = "trophyCustomization"
export default Module(TROPHY_CUSTOMIZATION, { service: DesignService })

// src/modules/trophy-customization/models/design.ts
import { model } from "@medusajs/framework/utils"
export const Design = model.define("design", {
  id: model.id().primaryKey(),
  customer_id: model.text().nullable(),      // null = guest/session design
  name: model.text(),
  mode: model.enum(["2d", "3d"]),
  product_id: model.text(),                   // base product being customized
  variant_id: model.text().nullable(),
  state_json: model.json(),                   // full design state
  preview_url: model.text().nullable(),
  status: model.enum([
    "draft","submitted_for_review","changes_requested","approved","rejected_with_feedback",
  ]).default("draft"),
  is_template: model.boolean().default(false),
  share_token: model.text().nullable(),
})
```

- **API design:** REST via Medusa Store/Admin API conventions; Zod-validated request bodies; webhook endpoints for Razorpay/Stripe with signature verification + idempotency keys.
- **Authentication:** Medusa Auth module; JWT access (short-lived) + refresh; sessions and refresh state in Redis; httpOnly/Secure/SameSite cookies.
- **File handling:** custom S3/Cloudinary file provider; image transform pipeline via Cloudinary; 3D model storage + signed delivery.
- **Event system (custom events):** `design.submitted`, `design.approved`, `design.rejected`, `production.started`, `production.completed`, `bulkorder.parsed`, `corporate.credit_exceeded`. Each has subscribers (notifications, job creation, status sync).
- **Background jobs:** use Medusa's workflow/job engine (or BullMQ on Redis) for preview generation, email/SMS dispatch, bulk-order processing, search index sync.
- **Middleware:** CORS, rate limiting, Zod request validation, RBAC auth guards.

---

## 3.4 Database architecture

**Primary: PostgreSQL 18** (async I/O, `uuidv7()` for time-ordered IDs, virtual generated columns, skip-scan indexes).

Core Medusa tables (managed by core modules): `product`, `product_variant`, `price`, `inventory_item`, `cart`, `line_item`, `order`, `customer`, `payment`, `fulfillment`, etc.

**Custom tables** (full field lists + Zod/TS in [06-data-models.md](./06-data-models.md)):

| Table | Purpose | Key relations |
|-------|---------|---------------|
| `design` | Saved 2D/3D design + status | → customer, → product/variant |
| `design_preset` | Template catalog | → category |
| `design_revision` | Version history of a design | → design |
| `production_job` | Production task per custom line | → order, → design, → workshop |
| `design_approval` | Review record + feedback | → design, → reviewer(user) |
| `corporate_profile` | Company account | → customer, → account_manager(user) |
| `team_member` | Corporate team seat | → corporate_profile |
| `bulk_order` | Uploaded bulk order | → customer |
| `bulk_order_line` | One recipient row | → bulk_order, → design, → order |

**Indexes (minimum):** `design(customer_id)`, `design(share_token)`, `design_revision(design_id, revision_number)`, `production_job(status)`, `production_job(order_id)`, `design_approval(design_id, status)`, `corporate_profile(customer_id)`, `bulk_order_line(bulk_order_id)`. Use partial indexes for hot statuses (e.g., `WHERE status IN ('pending_design_approval','in_production')`).

**Migrations:** Medusa core migrations + per-custom-module MikroORM migrations. Rule: never edit a shipped migration; always add a new one. Back up before every production migration; test on staging; keep rollback scripts (see [10 §runbooks](./10-documentation-requirements.md)).

**Cache — Redis 7** (Valkey 8 acceptable): sessions + refresh state, guest/auth cart, rate-limit counters, product-list response cache, cart inventory reservations (with TTL), pub/sub for real-time notifications.

**Search — Meilisearch v1** (Algolia = managed alternative):
- Product index: searchable = name, description, material, occasion, tags; filterable = category, material, occasion, price, customization_level, availability, rating; sortable = price, created_at, popularity.
- Preset index: for template search.
- Configure synonyms + typo tolerance. Sync on product/preset create/update/delete events.

---

## 3.5 3D/2D asset pipeline

- **3D model creation:** Blender → model → UV unwrap → texture → export `.glb` with **Draco** compression (and **meshopt** where useful) → validate with glTF Validator → optional **KTX2** texture compression for GPU-friendly delivery. Produce **LOD variants** (high/low poly).
- **3D storage:** `s3://.../3d-models/{product_id}/{variant}/model.glb` and `.../textures/`; LODs suffixed (`model.high.glb`, `model.low.glb`).
- **3D delivery:** CDN (CloudFront/Cloudflare) with origin access; correct `Content-Type`; Brotli/Gzip; signed URLs for premium models.
- **2D assets:** Figma/Photoshop → export SVG/PNG → Cloudinary upload → dynamic transforms (`f_auto,q_auto,w_800`).
- **Template assets:** preset design JSON in DB + associated preview images in S3/Cloudinary.
- **User uploads (logos):** validate type/size → malware/moderation scan (ClamAV or Cloudinary moderation) → optional format conversion/vectorization suggestion → store.
- **Preview generation:** server-side render of design JSON → 800×800 PNG. For 2D, a headless Fabric render (node-canvas) or Puppeteer; for 3D, a headless WebGL/off-screen render or a snapshot captured client-side and uploaded. Store preview URL on the design.

---

## 3.6 Integration architecture

| Integration | Purpose | Implementation approach |
|-------------|---------|-------------------------|
| **Razorpay** | India payments (UPI, cards, netbanking, wallets, EMI, PayLater) | Medusa payment provider; webhook handling; signature verification; idempotency. |
| **Stripe** | International payments | Medusa payment provider; Stripe Elements/hosted fields for PCI scope. |
| **ShipRocket / Delhivery** | Shipping | Custom fulfillment provider; label generation + tracking. |
| **Resend / SendGrid** | Transactional email | Medusa notification provider; HTML templates. |
| **Twilio / MSG91** | SMS / OTP | OTP + order-status SMS. |
| **Cloudinary** | Image/video/3D optimize | Upload widget, transforms, video/GIF delivery. |
| **AWS S3 / Cloudflare R2** | File storage | SDK v3, presigned URLs, lifecycle policies. |
| **Meilisearch / Algolia** | Search | Index sync on product events; search UI. |
| **GA4** | Web analytics | Next `<Script>`; e-commerce events. |
| **Mixpanel / Amplitude** | Product analytics | Design-funnel + conversion events. |
| **Sentry** | Error monitoring | Next.js + Medusa integration; source maps. |
| **WebXR / 8th Wall** | AR preview | Conditional load; camera permission handling. |

---

## 3.7 Security architecture

- **Authentication:** JWT access (~15 min) + refresh (~7 days); httpOnly, Secure, SameSite cookies; refresh rotation.
- **Authorization:** RBAC matrix (Customer, Corporate Buyer, Admin, Production Manager, Designer); permission middleware on every non-public route; re-check permissions per request (no trust in stale tokens after role change).
- **Data protection:** PII encryption at rest (AES-256); GDPR-style data export + right-to-erasure hooks; secrets in a managed secret store, never in the repo.
- **File upload security:** type whitelist (PNG/JPG/SVG for logos; GLB/GLTF for models), size limits, content-type validation, malware/moderation scan; sanitize SVGs (strip scripts/external refs).
- **API security:** rate limiting (e.g., ~100 req/min anon, ~1000 req/min authenticated; stricter on upload + auth endpoints); input sanitization; ORM-parameterized queries; CSRF protection on cookie-authed mutations.
- **Payment security:** no raw card data on our servers (tokenization/hosted fields); PCI scope minimized.
- **3D model protection:** signed CDN URLs for premium assets; correct CORS.

**RBAC matrix (abridged):**

| Capability | Customer | Corporate Buyer | Designer | Production Mgr | Admin |
|------------|:--:|:--:|:--:|:--:|:--:|
| Create/save designs | ✅ | ✅ | ✅ | – | ✅ |
| Approve/reject designs | – | – | ✅ | – | ✅ |
| View production queue | – | – | ✅ | ✅ | ✅ |
| Update job status | – | – | – | ✅ | ✅ |
| Manage products/pricing | – | – | – | – | ✅ |
| Manage corporate credit/terms | – | own (view) | – | – | ✅ |
| Manage users/roles | – | – | – | – | ✅ |

---

## 3.8 DevOps & deployment

- **Environments:** Development → Staging → Production; parity via infra-as-config.
- **Containerization:** Dockerfiles for Next.js and Medusa; Docker Compose for local (Postgres + Redis + Meilisearch + Medusa + storefront).
- **CI/CD:** GitHub Actions — lint → type-check (TS7) → unit/integration tests → build → deploy. Branch protection on `main`; preview deploys for PRs.
- **Hosting (reference):** storefront on Vercel; Medusa on Railway/Render; Postgres on managed RDS/Neon; Redis on Upstash; Meilisearch self-hosted on Railway or Algolia managed. (Cost tradeoffs in [08](./08-services-and-costs.md).)
- **Backups:** automated daily `pg_dump` + point-in-time recovery; test restores.
- **Monitoring:** structured logs (Pino/Winston); Sentry for errors; uptime monitoring (UptimeRobot); optional Prometheus/Grafana for infra metrics.
- **CDN:** cache invalidation on deploy; image optimization at the edge; long-cache immutable assets (models, hashed bundles).
