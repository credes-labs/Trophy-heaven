# L1 — Milestones

One or two lines per milestone. Detail lives in [L2](L2-work-packages.md) and [L3/](L3/).
Newest first.

## 2026-08-22 — Docs & change-logging system
Rewrote `README.md` (setup, stack, scripts, doc map), added `AGENTS.md` (AI readme:
conventions, gotchas, rules), created this 3-layer change log under `docs/changes/`. → L2 WP-08

## 2026-08-22 — Full build merged to `main`
All work committed on `kimi` and fast-forwarded to `main` (`23715ce`; 340 files,
+32,331/−676). Final gates green: typecheck, lint, 72 unit tests, 22 e2e (incl. axe
WCAG AA), production build ×4 projects. → L2 WP-07 · [L3/007](L3/007-qa-verification.md)

## 2026-08-22 — UX polish wave (Wave C)
Shop filters (price slider, subcats, availability/customizable toggles), PDP extras
(share, EMI, SKU, OOS states, gallery zoom + keyboard), hero parallax/Ken Burns/word
reveal, testimonials autoplay, cart cross-sell + sticky mobile bar. → L2 WP-05 · [L3/005](L3/005-ux-polish.md)

## 2026-08-22 — Platform fixes alongside waves
Favicon + PWA icons from the monogram; real password change + forgot/reset flow;
reorder; order timeline; footer dead links; per-route rate limits; seeded promotions
(WELCOME10, LEGACY500); price normalization to major units; `localizeImageUrl` image
fix; category hero imagery. → L2 WP-06 · [L3/006](L3/006-auth-account-platform.md)

## 2026-08-21→22 — Content, SEO & imagery wave (Wave B)
Bestsellers carousel, real order-confirmation page, PDP reviews from the reviews
module, JSON-LD suite, placeholder→real imagery, blog TOC/author/newsletter, final
legal copy. → L2 WP-04 · [L3/004](L3/004-content-seo.md)

## 2026-08-21→22 — Storefront commerce wiring (Wave A2)
Razorpay checkout verification chain, promo codes on cart, coupons page on real
`/store/promotions`, wishlist sync, env templates, newsletter/contact forms to backend. → L2 WP-03 · [L3/003](L3/003-commerce-wiring.md)

## 2026-08-21→22 — Backend hardening (Wave A1)
Seed typecheck fixed; Razorpay webhook processing + idempotency module; real payment
verification; DB index migrations; catalog/content seeds with imagery; contact/newsletter
routes; `backend/03-razorpay.md` plan doc. → L2 WP-02 · [L3/002](L3/002-backend-hardening.md)

## 2026-08-21 — Baseline: brand extraction, audit, plan, `kimi` branch
Identity deck (PDF, 15 pages) extracted; brand tokens confirmed; three-way audit
(storefront/backend/assets) against `.cursor/plans/`; skills installed from skills.sh;
execution tracker written; `kimi` branch created. → L2 WP-01 · [L3/001](L3/001-brand-foundation.md)

## 2026-08-20 — Foundation (pre-`kimi`, Cursor phases)
Monorepo scaffold, Medusa modules (trophy-customization, bulk-order, corporate,
production), design system + core pages, generated image set — carried into `kimi`
as uncommitted work and completed there.
