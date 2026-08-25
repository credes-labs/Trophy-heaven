# L1 — Milestones

One or two lines per milestone. Detail lives in [L2](L2-work-packages.md) and [L3/](L3/).
Newest first.

## 2026-08-25 — CI build, integration, and e2e unblocked
Catalog fetch no longer fails `next build` without Medusa; integration `--if-present` is a pnpm flag; e2e job builds the storefront and installs Chromium. → L2 WP-17 · [L3/016](L3/016-ci-pipeline.md)

## 2026-08-24 — Photo PNGs recoded to JPEG
18 RGB photos (no alpha) converted to JPEG q=90/95 4:4:4; public assets 29.5 MB → 8.9 MB. PSNR ≥ 41.8 dB. → L2 WP-16 · [L3/015](L3/015-photo-png-to-jpeg.md)

## 2026-08-24 — Storefront images lossless-compressed
oxipng + jpegoptim (no quality/palette pass) cut `apps/storefront/public` from 34.6 MB to 29.5 MB; decoded pixels unchanged. → L2 WP-15 · [L3/014](L3/014-lossless-image-opt.md)

## 2026-08-24 — Four sample trophies for cart/checkout (not 223)
Dropped the 223-SKU generator. Seed already publishes four trophies (crystal star, metal cup, acrylic plaque, wooden plaque) plus furniture/decor — enough to add to cart and place a test order. → L2 WP-14 · [L3/013](L3/013-trophy-catalog-seed.md)

## 2026-08-24 — Shop chrome matches home; nav flyouts close on leave
Inner pages use the homepage wordmark nav. Hovering COLLECTION / CATALOG / INFO / NEWS / CONTACT / FAVORITES opens a cream flyout that closes when the pointer leaves that item. `/shop` listing uses the Explore cream/Outfit language. → L2 WP-13 · [L3/012](L3/012-shop-nav-editorial.md)

## 2026-08-24 — Home explore + footer from Figma
Cream explore PLP under products (hero, filter/sort, 3×3 furniture grid) and a site-wide cream CTA footer (polaroids + giant “legacy” wordmark). Leftover pre-Figma home blocks (story, values, bestsellers, testimonials, newsletter) dropped from `/`. rem/`em` scaling matches about. → L2 WP-12 · [L3/011](L3/011-figma-home-explore-footer.md)

## 2026-08-24 — Home products & categories from Figma
Cream catalog block under about: Outfit tabs + drag-to-browse product rail (magnetic “drag me” cursor), then a scrollable category list (Seating → Tables) with polaroids that slide with the type. rem/`em` scaling matches about. → L2 WP-11 · [L3/010](L3/010-figma-home-products-categories.md)

## 2026-08-24 — Home about section from Figma
Cream `#F2F1EF` about block under the hero: Outfit type, stats, portrait + atelier stills, rem/`em` scaling (`1em` = `min(1rem, 100vw/90)` from `lg` up). → L2 WP-10 · [L3/009](L3/009-figma-home-about.md)

## 2026-08-24 — Hero statics moved out of temp
Wordmark, crest, studio JPG, chair/sideboard PNGs are in `public/images`. Figma comp saved as `docs/design/figma-home-hero.png`. `temp/` can be deleted. → L2 WP-09 · [L3/008](L3/008-figma-home-hero.md)

## 2026-08-23 — Home hero rebuilt from Figma
Pixel-perfect 1440×874 hero: Outfit type, wordmark + crest vectors, studio photo, product frames, overlay nav. Global header hidden on `/`. → L2 WP-09 · [L3/008](L3/008-figma-home-hero.md)

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
