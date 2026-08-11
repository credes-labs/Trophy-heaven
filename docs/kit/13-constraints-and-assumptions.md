# 13. Constraints & Assumptions

## 13.1 Locked technical decisions (finalized August 2026)

- **Commerce engine:** Medusa.js **v2.18** (not Shopify/WooCommerce/Magento).
- **Frontend framework:** Next.js **16.3** App Router (upgraded from the brief's Next 15), React **19.2**, TypeScript.
- **Styling/UI:** Tailwind CSS **v4** + shadcn/ui (Base UI default).
- **State:** Zustand **5** (client) + TanStack Query **v5** (server) + Motion (animation).
- **2D editor:** Fabric.js **7** (upgraded from the brief's 6.0).
- **3D:** React Three Fiber **9** + drei **9.116+** + Three.js latest, glTF/Draco (+ KTX2), WebXR for AR.
- **Runtime:** Node.js **24 LTS**.
- **Data:** PostgreSQL **18**, Redis **7** (Valkey 8 acceptable), Meilisearch **v1** (Algolia = managed alt).
- **Storage/CDN:** S3 or Cloudflare R2 + CDN; Cloudinary for image/3D transforms.
- **Payments:** Razorpay (India) + Stripe (international); COD with rules.
- **Shipping:** ShipRocket or Delhivery (BlueDart optional).
- **Notifications:** Resend (email) + Twilio/MSG91 (SMS).

These supersede any older versions named in the source brief. Every choice has an ADR entry in [14 §C](./14-appendices.md#c-architecture-decision-records-adr).

## 13.2 Business & market assumptions

- **Primary market: India**, with global-expansion capability (multi-region/currency-ready).
- **UPI support is mandatory** (Razorpay requirement for the India market).
- **Mobile traffic ≈ 60%+** of total — mobile-first is non-negotiable.
- **Custom trophy production lead time ≈ 7–14 days** — surfaced in delivery estimates with buffer.
- The business **operates its own production facility or contracted workshops** — the production queue routes to internal/vendor workshops.
- **3D models are created externally in Blender** and imported (not procedurally generated).
- **Custom orders are non-returnable**; standard products carry a 7-day return window.

## 13.3 Explicit non-goals (this document set)

- **Pixel-level UI/UX specification** — deferred to a Figma-driven phase (see [00-index.md](./00-index.md)).
- **Time estimates, sprint plans, Gantt charts** — excluded by the brief; roadmap is dependency-ordered only.
- **Final production code** — code blocks are contracts/skeletons to implement against.

## 13.4 Open items to confirm before/at build time
- Vendor pricing (verify current rates — see [08](./08-services-and-costs.md)).
- Which SMS provider (Twilio vs MSG91) and email provider (Resend vs SendGrid) per region/cost.
- Storage choice (S3 vs R2) based on projected 3D egress.
- Search choice (self-hosted Meilisearch vs Algolia) based on catalog size.
- Preview generation approach for 3D (headless render vs client-captured upload).
