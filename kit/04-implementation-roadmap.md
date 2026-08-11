# 4. Implementation Roadmap

Organized by **phase** (dependency order, not time). Each phase lists what to build, the approach + key decisions, dependencies, and a Definition of Done (DoD). No dates or estimates per the brief.

---

## Phase 1 — Foundation & Core Commerce

**Build**
1. Medusa v2 setup: install, Postgres 18 config, Redis, enable core modules, Node 24 runtime.
2. Product catalog: category hierarchy, product types, variants + options, media upload.
3. Next.js storefront shell: App Router, Tailwind v4 + shadcn/ui theme, layout + navigation.
4. Product listing pages: category pages, filters, sorting, pagination (RSC + ISR).
5. Product detail pages: gallery, variant selector, add-to-cart, related products.
6. Cart: add/remove/update, persistent (guest + auth), mini-cart / drawer.
7. Checkout: address form, shipping method, payment (Razorpay first, Stripe scaffold).
8. Auth: registration, verification, login, password reset, profile.
9. Orders: placement, confirmation, basic status tracking + email.
10. Admin: sales overview, product management, order list (Medusa Admin + custom widgets).

**Key decisions**
- Medusa v2 over v1 — modular architecture, cleaner customization.
- App Router over Pages Router — RSC for catalog/SEO, streaming.
- shadcn/ui over MUI/Ant — unstyled primitives, Tailwind-native, fully ownable.

**Dependencies:** none (this is the base).

**DoD:** a guest can browse → add a standard product → check out with Razorpay (test mode) → receive a confirmation email; an admin can create/publish a product; auth + roles enforced on protected routes; ISR live on PDPs.

---

## Phase 2 — Trophy Customization Engine (2D)

**Build**
1. Fabric.js 7 editor integration: responsive canvas, drawing surface, lazy-loaded chunk.
2. Text tool: Google-Fonts loading, text objects, styling panel.
3. Logo upload tool: file input + drag-drop, image object, manipulation handles, resolution check.
4. Layer manager: list UI, reorder, visibility, lock, delete, rename.
5. Material texture overlay on base preview (blend modes).
6. Design state management: JSON serialization format + `editor` Zustand store.
7. Undo/redo: immutable history stack, bounded 50.
8. Design save/load: API + DB storage + user gallery.
9. Preview generation: server-side design JSON → PNG (node-canvas/Puppeteer).
10. Design-to-cart: attach `design_id` to line item, show preview in cart.
11. Template system: preset DB, clone-and-modify.
12. Design validation: boundary, resolution, character-limit enforcement.

**Key decisions**
- Fabric.js 7 over Konva/PixiJS — mature ecosystem, JSON (de)serialization, SVG parsing.
- Server-side preview over client-only — consistent quality, shareable URLs.
- Design state as JSON — human-readable, versionable, DB-storable.

**Dependencies:** Phase 1 (products, cart, auth). TrophyCustomizationModule from [03 §3.3](./03-technical-architecture.md#33-backend-architecture--medusajs-v218).

**DoD:** a user can open a customizable trophy → design in 2D → validate → save (appears in gallery) → add to cart with a correct preview → the design JSON round-trips (save→load→edit) losslessly; presets clone into an editable design.

---

## Phase 3 — 3D Simulation & AR

**Build**
1. R3F scene: camera, renderer, lighting.
2. Model loading: `useGLTF` + Draco decoder, loading states, error boundaries.
3. Trophy base models: import/optimize 6 bases, LOD variants.
4. Material system: PBR library, environment maps, real-time switching.
5. Camera controls: OrbitControls + touch, auto-rotate, reset.
6. 3D text engraving: CanvasTexture (text→canvas→texture) or geometry extrusion.
7. Logo mapping: UV projection onto surface.
8. Screenshot/export: canvas capture, PNG, transparent option.
9. 360° spin export: automated rotation capture → GIF/MP4.
10. AR preview: WebXR hit-test (8th Wall fallback), surface detection, placement.
11. Performance: LOD switching, KTX2 textures, frustum culling, device-capability detection.
12. 3D↔2D sync: preserve text/logo/material across mode switches.

**Key decisions**
- R3F over raw Three.js — declarative, React-state integration.
- glTF/Draco over OBJ/FBX — web standard, compression, single-file delivery.
- WebXR over native AR — no app install, progressive enhancement.

**Dependencies:** Phase 2 (shared design state; 3D reads the same state contract).

**DoD:** a user can preview a base in 3D → change material live → apply engraving text + logo → capture a screenshot → (on supported devices) place it in AR; low-end devices auto-serve low-poly LOD; WebGL-unavailable users fall back to the 2D editor without losing their design.

---

## Phase 4 — Corporate & Bulk Features

**Build**
1. Corporate account system: company profile, tax ID, credit limits, team members.
2. Bulk order upload: client-side Excel/CSV parse (SheetJS) + server re-validation, error reporting.
3. Bulk design generation: auto-generate per-recipient designs from a name list, preview grid.
4. Purchase-order flow: PO capture, approval, net terms.
5. Multi-address shipping: split order across addresses, per-address shipping calc.
6. Corporate dashboard: order history, invoice downloads, spending reports.
7. Account-manager assignment + notification.

**Key decisions**
- SheetJS client-side parse for instant validation UX, with **server-side re-validation** as the source of truth (never trust the client parse).
- Net terms via provider invoicing or a controlled manual process — standard B2B practice.

**Dependencies:** Phases 1–2 (auth/roles, designs, cart). BulkOrder + CorporateAccount modules.

**DoD:** a verified corporate buyer uploads a 100-row name list → sees validation errors inline → previews all generated designs → confirms → a multi-recipient order is created with a PO and (if eligible) net terms; invoices download as GST-compliant PDFs.

---

## Phase 5 — Production & Operations

**Build**
1. Design approval workflow: admin/designer review UI, status transitions, annotated feedback.
2. Production queue management: status board, workshop assignment, capacity view.
3. Materials inventory: raw stock (acrylic sheets, metal blanks, crystal blocks).
4. Vendor portal (P2): multi-vendor catalogs, commission tracking.
5. Shipping integration: ShipRocket/Delhivery labels + tracking URLs.
6. Notification system: event-driven email/SMS per status change, template management.
7. Return/exchange handling: policy enforcement, RMA, reverse logistics.

**Key decisions**
- Custom workflow over off-the-shelf ERP — tailored to trophy production, Medusa-extensible.
- Event-driven via Medusa subscribers — decoupled, testable, extensible.

**Dependencies:** Phases 1–3 (orders, designs, approvals). ProductionWorkflow module + event system.

**DoD:** an `order.placed` for a custom item creates a `ProductionJob` and a `pending_design_approval` state → designer approves/rejects with feedback → approved jobs route to a workshop by complexity/material → status changes fire customer notifications → shipping label + tracking generated on `packed → shipped`.

---

## Phase 6 — Scale & Polish

**Build**
1. Search enhancement: Meilisearch/Algolia, faceted search, visual-search MVP.
2. Performance: edge caching, image optimization, code splitting, Core Web Vitals tuning.
3. SEO: dynamic sitemap, structured data, meta tags, canonical, hreflang.
4. Analytics: GA4 e-commerce events, Mixpanel funnel (design-completion rate).
5. A/B testing: feature flags, experiment tracking.
6. PWA completion: service worker, offline cart, push, install prompt.
7. Mobile app (optional): React Native / Capacitor wrapper for core flows.
8. AI features: occasion-based design recommendation, auto-layout suggestions, design-help chatbot.

**Dependencies:** all prior phases (this hardens and scales them).

**DoD:** Lighthouse 90+ across categories on key pages; search returns typo-tolerant faceted results synced to catalog changes; funnel analytics report design-start → add-to-cart conversion; PWA installs with an offline-readable cart.
