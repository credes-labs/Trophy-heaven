# 2. Product Requirements Document

Requirement IDs follow `FR-<module>-<n>`; non-functional ones live in [2.11](#211-non-functional-requirements). Priorities: P0 (MVP-blocking), P1 (MVP), P2 (fast-follow), P3 (post-MVP).

---

## 2.1 Product Catalog & Inventory

**Functional requirements**

- `FR-CAT-1` (P0) Hierarchical categories: **Trophies** (Sports, Corporate, Academic, Memorial, Acrylic, Crystal, Metal), **Furniture** (Tables, Chairs, Shelves, Cabinets, Stools), **Home Decor** (Vases, Wall Art, Lamps, Mirrors, Clocks, Planters), **Gift Sets**. Nesting to at least 2 levels; a product may sit in one primary + multiple secondary categories.
- `FR-CAT-2` (P0) Variants with options: size, material, finish, color. Variant-level price, SKU (auto-generated `LC-{category}-{shape}-{material}-{size}`), and inventory.
- `FR-CAT-3` (P0) Media: hero image, gallery, 360° spin video, 3D model files (`.glb`/`.gltf`), 2D template overlays. Media ordered and per-variant assignable.
- `FR-CAT-4` (P0) Attributes: dimensions (mm), weight (g), material composition, care instructions, shipping class.
- `FR-CAT-5` (P0) Searchable metadata driving filters: occasion, material, price range, customization level (`none | text_only | text_and_logo | full_3d`).
- `FR-CAT-6` (P0) Product states: `draft | published | archived`. Only `published` visible in storefront.
- `FR-CAT-7` (P1) Bulk import/export via CSV/Excel with column mapping + a downloadable template; import returns a per-row error report.
- `FR-CAT-8` (P0) Inventory reservation during active cart sessions, backed by Redis with TTL; released on cart expiry/abandonment.
- `FR-CAT-9` (P1) Low-stock alerts (admin) and auto-hide out-of-stock variants (configurable threshold).
- `FR-CAT-10` (P1) Relationships: "You may also need" (trophy + engraving plate), "Complete the look" (furniture sets), "Similar designs."
- `FR-CAT-11` (P1) Tiered/bulk pricing rules per variant (quantity breakpoints).

**User stories**

- As an admin, I upload a `.glb` for a trophy so customers can preview it in 3D.
- As a customer, I filter trophies by material (crystal/metal/acrylic) to narrow choices.
- As an admin, I set quantity-break prices so corporate buyers get tiered pricing.

**Acceptance criteria (sample)**

- Publishing a product with no `published` variant is blocked with a clear error.
- Adding to cart decrements *available* (not on-hand) inventory via a Redis reservation; abandoning restores it within the TTL window.
- A variant at 0 available auto-hides if `auto_hide_out_of_stock` is on; the product page still renders if other variants remain.

**Edge cases:** concurrent reservation of the last unit (atomic decrement, second buyer sees "just sold out"); CSV import with duplicate SKUs (row rejected, others proceed); 3D model upload that fails glTF validation (rejected, product stays `draft`).

---

## 2.2 Trophy Customization Engine — core differentiator

The engine has three faces: a 2D editor, a 3D simulator, and a guided input flow. All three read/write the same **design state** (see [06-data-models.md](./06-data-models.md#67-2d-design-state-json-schema)). Mode switches must preserve shared choices (text, logo, material).

### 2.2.1 2D Simulation Mode (Fabric.js 7)

- `FR-2D-1` (P0) Canvas editor; drag-and-drop base selection.
- `FR-2D-2` (P0) Text tool: multi-line input, Google-Fonts family selector, size, color, alignment, bold/italic/underline, letter spacing, line height.
- `FR-2D-3` (P1) Text effects: arch/curve, shadow, outline/stroke.
- `FR-2D-4` (P0) Logo upload (PNG/JPG/SVG); suggest vectorization for low-res raster logos.
- `FR-2D-5` (P0) Logo manipulation: resize with aspect lock, rotate, position with snap guides, opacity.
- `FR-2D-6` (P1) Layer panel: reorder, lock/hide, rename.
- `FR-2D-7` (P1) Material texture overlay on base preview (gold, silver, bronze, rose-gold, matte black, acrylic).
- `FR-2D-8` (P0) Real-time preview at ~60fps; zoom and pan.
- `FR-2D-9` (P0) Undo/redo history, ≥50 states.
- `FR-2D-10` (P1) Grid/ruler toggle; safe-area guides for engraving boundaries.
- `FR-2D-11` (P0) Design validation: text fits engraving area; logo resolution adequate for print (min DPI check).
- `FR-2D-12` (P0) Export: PNG preview, PDF for production, JSON state for re-editing.
- `FR-2D-13` (P0) Save design to account with custom name; load for re-editing.
- `FR-2D-14` (P1) Share via public view-only URL before purchase.

**Acceptance criteria (sample):** engraving text exceeding the safe area shows an inline warning and blocks "add to cart" until resolved; undo past 50 steps is disabled, not silently dropped; exported production PDF embeds fonts and is vector where possible.

**Edge cases:** SVG logo with external references (sanitize/strip); font that fails to load from Google Fonts (fall back + warn); extremely large uploaded image (downscale before placing on canvas).

### 2.2.2 3D Simulation Mode (React Three Fiber 9 + drei + Three.js)

- `FR-3D-1` (P0) Pre-loaded bases: Cup, Star, Shield, Abstract/Modern, Column, Wreath (≥6).
- `FR-3D-2` (P0) Model loading: Draco-compressed `.glb`, progress indicator, error boundary.
- `FR-3D-3` (P0) Camera: orbit/zoom/pan; touch (single-finger rotate, pinch zoom, double-tap reset).
- `FR-3D-4` (P0) PBR materials: polished gold, brushed silver, antique bronze, matte black, clear crystal, white acrylic, rose gold.
- `FR-3D-5` (P1) Studio HDRI environment for reflections.
- `FR-3D-6` (P1) Dynamic text engraving mapped to surface via canvas→texture (bump/normal) or geometry extrusion.
- `FR-3D-7` (P1) Logo UV-mapped onto surface.
- `FR-3D-8` (P2) Lighting controls (ambient/directional/spot toggle + intensity); auto-rotate with speed; fullscreen.
- `FR-3D-9` (P1) Screenshot capture (PNG, optional transparent background).
- `FR-3D-10` (P2) 360° spin export → GIF/MP4.
- `FR-3D-11` (P2) AR preview via WebXR (8th Wall fallback) to place trophy on a real surface.
- `FR-3D-12` (P0) Performance tiers: detect capability (`navigator.hardwareConcurrency`, `navigator.deviceMemory`) → low-poly (mobile) vs high-poly (desktop) via LOD.
- `FR-3D-13` (P0) Fallback: if WebGL unavailable, show the 2D editor with an explanatory message.

**Acceptance criteria (sample):** on a device reporting ≤4 cores / ≤4GB memory, the low-poly LOD and reduced texture resolution load; switching material updates the mesh without reloading the model; losing WebGL context mid-session recovers or degrades to 2D without data loss.

**Edge cases:** WebGL context loss (listen for `webglcontextlost`, restore); model that exceeds size budget on mobile (block high-poly, serve low-poly + note); AR unsupported (hide AR entry point, no dead button).

### 2.2.3 Customization Input Flow

- `FR-FLOW-1` (P0) Wizard: (1) Base → (2) Size → (3) Material/Finish → (4) Engraving → (5) Logo → (6) Review → (7) Add to Cart. Each step shows a live price update.
- `FR-FLOW-2` (P0) Size selector with visual dimension reference (S 6", M 8", L 10", XL 12").
- `FR-FLOW-3` (P0) Material selector with swatches + 3D preview update.
- `FR-FLOW-4` (P1) Engraving plate style (rectangular, oval, custom); base/plinth style + color.
- `FR-FLOW-5` (P0) Quantity selector with live bulk pricing.
- `FR-FLOW-6` (P1) Design complexity score (simple/medium/complex) for production estimation.
- `FR-FLOW-7` (P1) "Start from template": browse 100+ presets, clone and modify.
- `FR-FLOW-8` (P2) "Occasion Wizard": 3–5 questions (occasion, budget, quantity, delivery date) → recommended templates.

**Edge cases:** user jumps back a step after adding a logo (state preserved); price recalculation while offline (queue + reconcile); template clone when the underlying base is later archived (design keeps a snapshot of required assets).

### 2.2.4 Design Data Model & Approval

- `FR-DESIGN-1` (P0) Serializable JSON for both 2D and 3D state (schemas in [06](./06-data-models.md)).
- `FR-DESIGN-2` (P1) Version history; auto-save every 30s.
- `FR-DESIGN-3` (P0) Design ↔ order linkage: each custom line item references a `design_id`.
- `FR-DESIGN-4` (P0) Server-side preview image generation (headless render / canvas), 800×800 PNG.
- `FR-DESIGN-5` (P0) Approval status: `draft → submitted_for_review → approved → rejected_with_feedback` (+ `changes_requested`).

---

## 2.3 User Account & Authentication

- `FR-AUTH-1` (P0) Email/password registration with verification.
- `FR-AUTH-2` (P1) Social login: Google, Apple (mobile), Microsoft (corporate).
- `FR-AUTH-3` (P0) Roles: Customer, Corporate Buyer, Admin, Production Manager, Designer (RBAC — see [03 §3.7](./03-technical-architecture.md#37-security-architecture)).
- `FR-AUTH-4` (P0) Dashboard: order history, saved designs, addresses, wishlist, reorder.
- `FR-AUTH-5` (P0) Design gallery: thumbnail grid with edit/delete/share.
- `FR-AUTH-6` (P0) Address book: multiple shipping/billing, default selection.
- `FR-AUTH-7` (P1) Corporate profile: company name, GST/Tax ID, PO support.
- `FR-AUTH-8` (P1) Notification prefs: email, SMS, WhatsApp.
- `FR-AUTH-9` (P0) Sessions: JWT access + refresh, secure httpOnly cookies.

**Edge cases:** unverified account attempting checkout (allow browsing/designing, block order until verified or via guest path); social + password on same email (link accounts, single identity); reorder of a custom item whose base is archived (use design snapshot, warn if unfulfillable).

---

## 2.4 Cart & Checkout

- `FR-CART-1` (P0) Persistent cart for guest + authenticated; merge guest cart on login.
- `FR-CART-2` (P0) Item types: standard product, customized trophy (design reference + preview thumb), gift set.
- `FR-CART-3` (P0) Summary: image, customization preview, per-item price breakdown.
- `FR-CART-4` (P1) Bulk order cart: table view; name-list upload for individual engravings.
- `FR-CART-5` (P1) Save-for-later.
- `FR-CART-6` (P0) Mini-cart dropdown (desktop) / full-screen drawer (mobile).
- `FR-CART-7` (P0) Checkout: shipping address → delivery method → payment → review → confirmation. Guest checkout supported.
- `FR-CART-8` (P1) Multiple shipping addresses per order (corporate split shipments).
- `FR-CART-9` (P1) Gift options: wrap, message, hide prices.
- `FR-CART-10` (P0) Promo/coupon with validation.
- `FR-CART-11` (P3) Loyalty/wallet (future-proof schema hooks only).

**Edge cases:** design deleted while its line item is in cart (block checkout for that line, offer re-edit); price or stock changes between add and checkout (re-validate + surface diff); coupon that becomes invalid at payment time (fail closed, explain).

---

## 2.5 Payment Integration

- `FR-PAY-1` (P0) **India: Razorpay** — UPI, cards, net banking, wallets, EMI, PayLater.
- `FR-PAY-2` (P1) **International: Stripe** — cards, Apple Pay, Google Pay, PayPal.
- `FR-PAY-3` (P1) Cash on Delivery with eligibility rules (value cap, pincode serviceability, non-custom only by default).
- `FR-PAY-4` (P1) Partial payments for large corporate orders (e.g., 50% advance).
- `FR-PAY-5` (P0) Retry mechanism for failed transactions.
- `FR-PAY-6` (P0) Invoice PDF with GST breakdown.
- `FR-PAY-7` (P0) Refund/cancellation workflow.
- `FR-PAY-8` (P0) Webhook handling with **idempotency** (dedupe by event ID; signature verification).

**Edge cases:** duplicate webhook delivery (idempotent no-op); payment success but order-create failure (reconcile job + alert, never charge without order); COD selected on a custom, non-returnable item (require advance or block per policy).

---

## 2.6 Order Management & Production Pipeline

- `FR-ORD-1` (P0) Status lifecycle: `pending_payment → payment_confirmed → pending_design_approval → design_approved → in_production → quality_check → packed → shipped → out_for_delivery → delivered → completed` (+ `cancelled`, `refunded`).
- `FR-ORD-2` (P0) Design approval workflow: designer/admin reviews custom designs, approves or requests changes with annotated feedback.
- `FR-ORD-3` (P1) Production queue: orders tagged by complexity + material → routed to workshop/vendor.
- `FR-ORD-4` (P1) Internal notes + communication thread per order.
- `FR-ORD-5` (P1) Shipping label generation (ShipRocket/Delhivery/BlueDart).
- `FR-ORD-6` (P1) Real-time tracking URL + customer notification.
- `FR-ORD-7` (P1) Modification rules: what can change before production starts.
- `FR-ORD-8` (P0) Return/exchange policy: custom orders non-returnable; standard 7-day return.
- `FR-ORD-9` (P0) Automated email/SMS at each status change.

**Edge cases:** design rejected after payment (pause production, notify, allow re-submit; refund if unresolved); split shipment where one workshop is delayed (partial fulfillment status); customer requests change after `in_production` (blocked with explanation).

---

## 2.7 Bulk & Corporate Order Flow

- `FR-BULK-1` (P1) Corporate landing page with bulk pricing calculator.
- `FR-BULK-2` (P1) Excel/CSV upload for bulk engraving (name, designation, award category columns).
- `FR-BULK-3` (P1) Validation: duplicates, missing fields, character limits; error preview before submit.
- `FR-BULK-4` (P1) Preview grid: render all individual designs before confirming.
- `FR-BULK-5` (P1) PO number support.
- `FR-BULK-6` (P2) Net-30/Net-60 terms for verified corporate accounts.
- `FR-BULK-7` (P2) Dedicated account-manager assignment.
- `FR-BULK-8` (P1) Corporate dashboard: order history, pending approvals, invoice downloads, team management.

**Edge cases:** 500-row upload with 12 bad rows (surface all 12, let user fix inline or download a corrected template); name with unsupported characters for chosen font (flag per-row); credit limit exceeded on net terms (block + notify account manager).

---

## 2.8 Search & Discovery

- `FR-SRCH-1` (P1) Full-text search with typo tolerance (Meilisearch).
- `FR-SRCH-2` (P1) Faceted filters: category, price, material, occasion, customization level, rating, availability.
- `FR-SRCH-3` (P2) Visual search: upload image → similar products (color histogram MVP, embeddings later).
- `FR-SRCH-4` (P3) "Shop the Room" AR furniture placement.
- `FR-SRCH-5` (P1) Recently viewed; trending/bestsellers.
- `FR-SRCH-6` (P2) Personalized recommendations (category-based MVP).
- `FR-SRCH-7` (P0) SEO-optimized pages with JSON-LD structured data.

**Edge cases:** search index lag after product update (sync on create/update event, show eventual consistency note in admin); zero-result query (spelling suggestion + popular items).

---

## 2.9 Content & Marketing

- `FR-CMS-1` (P1) CMS pages: About, Contact, FAQ, Shipping, Return, Customization Guide.
- `FR-CMS-2` (P2) Blog/editorial for SEO.
- `FR-CMS-3` (P1) Reviews + ratings with photo upload (moderated).
- `FR-CMS-4` (P2) UGC gallery: "Customer trophies in action."
- `FR-CMS-5` (P1) Email marketing: abandoned cart, browse abandonment, post-purchase, design-completion reminder.
- `FR-CMS-6` (P1) Social sharing of designs (Instagram/WhatsApp) before purchase.
- `FR-CMS-7` (P2) Referral program; seasonal collections/promotions.

**Edge cases:** review with prohibited content (moderation queue); shared design URL after design deletion (graceful 410 page).

---

## 2.10 Admin Dashboard

- `FR-ADM-1` (P0) Sales analytics: revenue, orders, AOV, conversion, top products.
- `FR-ADM-2` (P0) Design queue: pending custom designs for approval.
- `FR-ADM-3` (P1) Production dashboard: orders by status, workshop workload, material inventory.
- `FR-ADM-4` (P0) Customer management: profiles, order history, communication log.
- `FR-ADM-5` (P1) Coupon/promotion management.
- `FR-ADM-6` (P1) Content management: pages, banners, blog.
- `FR-ADM-7` (P0) User management: roles, permission matrix.
- `FR-ADM-8` (P1) System settings: tax rates, shipping zones, payment methods, email templates.
- `FR-ADM-9` (P0) Audit log: all admin actions tracked (actor, action, before/after, timestamp).

**Edge cases:** two admins editing the same product (optimistic lock + conflict prompt); role downgrade of a logged-in admin (enforce on next request via fresh permission check).

---

## 2.11 Non-Functional Requirements

- `NFR-1` **Performance:** FCP < 1.5s, TTI < 3.5s on 4G. 3D viewer initial load < 2s after user interaction (post-gesture). 2D editor real-time preview ~60fps.
- `NFR-2` **Accessibility:** WCAG 2.1 AA. Keyboard navigation for the 2D editor. Screen-reader support across flows. Min touch target 44px.
- `NFR-3` **SEO:** SSR for all product/category pages; dynamic sitemap; JSON-LD structured data; canonical + hreflang hooks.
- `NFR-4` **Security:** OWASP Top 10 mitigations; ORM-based injection prevention; XSS/CSRF protection; API rate limiting; file upload validation + scanning. (Detail in [03 §3.7](./03-technical-architecture.md#37-security-architecture).)
- `NFR-5` **Scalability:** stateless backend; horizontal scaling ready; DB connection pooling.
- `NFR-6` **Reliability:** 99.9% uptime target; graceful degradation (2D works if 3D fails); idempotent payment handling.
- `NFR-7` **Mobile-first:** all features usable on mobile; touch-optimized 2D/3D controls.
- `NFR-8` **Browser support:** Chrome, Firefox, Safari, Edge (last 2 versions); iOS Safari 15+, Android Chrome 100+.
- `NFR-9` **Observability:** structured logs, error tracking (Sentry), core web vitals + funnel analytics.
