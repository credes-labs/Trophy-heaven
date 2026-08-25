# L2 — Work packages

A paragraph per work package: what, why, key files, verification. Deep detail in the
linked L3 files. Newest first; anchor IDs (WP-NN) are stable — reference them from L1
and L3.

## WP-17 — CI pipeline gates (2026-08-25)
**What:** `listProducts` returns an empty catalog when Medusa is unreachable so `next build` can prerender `/corporate/bulk` in CI. Moved pnpm `--if-present` before the script name (it was being forwarded to Jest/Playwright). Integration script allows zero module specs. E2E job now builds the storefront and installs Chromium before Playwright. **Why:** PR #10 Lint·Typecheck·Unit passed; Build, Integration, and E2E did not. **Files:** `catalog.ts`, `.github/workflows/ci.yml`, `apps/medusa/package.json`. **Verified:** storefront `next build`; integration script `--passWithNoTests`. → [L3/016](L3/016-ci-pipeline.md)

## WP-16 — Photo PNG → JPEG (2026-08-24)
**What:** converted 18 photographic RGB PNGs (hero/category/product/blog) to JPEG q=90 4:4:4 (q=95 on three lower-PSNR files), Huffman-optimized, updated storefront + seed paths. Left transparent hero PNGs and PWA icons alone. **Why:** lossless oxipng could not shrink photos; user asked to optimize. **Files:** those 18 assets; `category-config.ts`, `mega-menu.tsx`, `layout.tsx`, `craftsmanship-story.tsx`, `images/manifest.json`, Medusa `seed.ts` / `seed-content.ts`. **Verified:** PSNR ≥ 41.8 dB vs PNG; `public` 29.54 → 8.89 MB. → [L3/015](L3/015-photo-png-to-jpeg.md)

## WP-15 — Lossless image optimization (2026-08-24)
**What:** recompressed the 46 PNG/JPEG files in `apps/storefront/public` with oxipng 10.2 (`-o 4 --strip safe`, no `--alpha`) and jpegoptim 1.5.6 without `-m`. **Why:** several product/hero PNGs were 1–2.8 MB; user required no quality loss. pngquant/pingo skipped after reviews (lossy or mixed). **Files:** those public images; `scripts/optimize-images.ps1`. **Verified:** Pillow RGBA diff vs originals — 46/46 identical; 34.59 → 29.54 MB (−14.6%). → [L3/014](L3/014-lossless-image-opt.md)

## WP-14 — Trophy catalog seed (2026-08-24)
**What:** first pass added a 223-product trophy generator; that was a misread of “2–3 or some.” Removed `trophy-catalog.ts` and the seed loop. The existing sample seed already creates four trophies (`Crystal Star Award`, `Champion Metal Cup`, `Acrylic Award Plaque`, `Engraved Wooden Plaque`) with images, stock, and shipping. **Why:** the user only needed a handful of SKUs to exercise cart → checkout. **Files:** `apps/medusa/src/scripts/seed.ts` (catalog block removed); deleted `trophy-catalog.ts` / `trophy-catalog.spec.ts`. **Verified:** seed still typechecks; live seed/checkout blocked until Docker Desktop/Postgres is up. → [L3/013](L3/013-trophy-catalog-seed.md)

## WP-13 — Shared site nav + editorial shop (2026-08-24)
**What:** extracted the homepage overlay nav into `SiteNav` with per-item hover flyouts (trigger + panel in the same `<li>`, close on pointer leave / blur / Escape — no full-viewport overlay). Inner pages render that nav on a walnut bar instead of the old Shop/Blog header. `/shop` uses cream Outfit chrome and Explore-style product tiles. **Why:** shop still looked like the previous catalog, and the mega-menu overlay kept the Shop panel open after hover-out. **Files:** `components/layout/site-nav/*`, `site-header.tsx`, `header.tsx`, `hero-nav.tsx`, `shop-client.tsx`, `editorial-product-card.tsx`. **Verified:** storefront typecheck + lint + browser hover/leave on `/` and `/shop`. → [L3/012](L3/012-shop-nav-editorial.md)

## WP-12 — Figma home explore & footer (2026-08-24)
**What:** added the Figma Explore frame (1440×2542) under products: 54px headline + 28px body, hairline, 1360×634 hero, filter/sort row, left accordion (category / price / Colors / brand / rating + clear-filters pill), 3×3 of 302×374 cards with category, rating, name, price. Parsed `temp/explore.css` for the top paint (later layers win; identically named rectangles are the grid, not buried comps). Replaced the walnut footer with the Figma CTA+footer: 54px headline, body, Shop the Collection pill, five tilted polaroids, 242px “legacy” wordmark, Shop/Company/Support. ChatGPT + Rectangle stills copied to `public/images/{explore,footer}/`. **Why:** next two homepage frames after products & categories. **Files:** `components/sections/explore/*`, `explore-section.tsx`, `app/page.tsx`, `components/layout/footer/*`, `public/images/explore/*`, `public/images/footer/*`. Homepage no longer mounts `CraftsmanshipStory`, `BrandValues`, `BestsellersCarousel`, `Testimonials`, or `Newsletter` (those files stay for blog / later frames). **Verified:** storefront typecheck + lint + browser. → [L3/011](L3/011-figma-home-explore-footer.md)

## WP-11 — Figma home products & categories (2026-08-24)
**What:** replaced the old category tiles + featured-products grid with the Figma 1440×1280 Products & Categories frame: `//products` eyebrow, New arrival / Bestsellers / Discounted tabs, a horizontal drag rail of 322px cards whose frosted “drag me” badge magnetically follows the pointer and snaps on fling, then `//categories` with Seating/Storage/Bedroom/Outdoor/Tables. Bedroom is the default large row; hover, keyboard, and wheel cycle the active name with a type spring and direction-aware polaroid overlap. Same rem/`em` recipe as about (`1em` = `min(1rem, 100vw/90)` from `lg`). ChatGPT stills copied to `public/images/catalog/`. **Why:** third section of the new Figma homepage pass; “drag me” is a real drag affordance, not a static sticker. **Files:** `components/sections/products-categories/*`, `products-categories-section.tsx`, `app/page.tsx`, `public/images/catalog/*`. **Verified:** storefront typecheck + lint + browser. → [L3/010](L3/010-figma-home-products-categories.md)

## WP-10 — Figma home about (2026-08-24)
**What:** added the Figma About frame (1440×1473) under the hero: Outfit eyebrow + 54px mission line, //Legacy in numbers stats with 7° rules, 242×282 portrait, body + MORE ABOUT US, 1360×664 atelier still with frosted play mark and “From Concept to Comfort” overlay. All Figma px converted to rem/`em`; from `lg` the section font-size is `min(1rem, 100vw/90)` so the 90em canvas scales. **Why:** second section of the new Figma homepage pass. **Files:** `components/sections/about/*`, `about-section.tsx`, `app/page.tsx`, `public/images/about/*`. **Verified:** storefront typecheck + lint. → [L3/009](L3/009-figma-home-about.md)

## WP-09 — Figma home hero (2026-08-23)
**What:** replaced the Ken Burns carousel hero with the Figma `hero` frame (1440×874): Outfit 437px “legacy” watermark, wordmark top-left, double-crest behind the logo / after Collection, studio photo, bordered chair + sideboard frames, copy + pill CTA, overlay nav (Collection → cart). Homepage hides the global announcement bar and sticky header so the Figma chrome is the only top nav. Runtime assets in `public/images/{hero,brand}/`; Figma comp at `docs/design/figma-home-hero.png`. **Why:** first section of the new Figma homepage pass. **Files:** `components/sections/hero/*`, `layout.tsx`, `globals.css`, `site-chrome.tsx`, `public/images/{hero,brand}/*`, `docs/design/figma-home-hero.png`. **Verified:** storefront typecheck + lint. → [L3/008](L3/008-figma-home-hero.md)

## WP-08 — Documentation & change logging (2026-08-22)
**What:** rewrote `README.md` (setup, stack rationale, scripts, doc map); wrote
`AGENTS.md` (AI readme with golden rules, gotchas, brand contract, architecture
decisions); created the 3-layer change log in `docs/changes/`. **Why:** the repo had
setup docs but no agent-facing conventions, no record of stack decisions (no-Payload,
pricing units, image localization), and no durable change memory. **Files:**
`README.md`, `AGENTS.md`, `docs/changes/*`. **Verified:** doc links resolve; rules
match the actual gates that ran green.

## WP-07 — QA, accessibility & merge (2026-08-22)
**What:** fixed WCAG failures found by axe (gold-on-champagne text → new
`--color-gold-dark` token applied to all on-light text; `role="img"` on star ratings);
fixed e2e flakiness from scroll-reveal animations (scroll-and-settle before axe);
fixed account-shell auth guard for the new forgot/reset pages; ran the full gate suite
and merged `kimi` → `main` (`23715ce`, fast-forward). **Why:** "done" means verified —
a11y is a brand requirement, and the merge integrates 340 files of work. **Files:**
`globals.css`, eyebrow/label usages across 15 files, `e2e/smoke.spec.ts`,
`account-shell.tsx`, `testimonials.tsx`, `product-reviews.tsx`. **Verified:** 22/22
e2e, 72 unit tests, typecheck/lint/build green. → [L3/007](L3/007-qa-verification.md)

## WP-06 — Auth, account & platform fixes (2026-08-22)
**What:** favicon + PWA icons rendered from the four-petal monogram; real password
change (re-login verification + `auth.updateProvider`); forgot/reset-password pages
on the Medusa reset flow; register phone field + terms consent; orders Reorder and
4-step status timeline; footer dead-link removal + site-wide link audit; per-route
rate limits (5/min reviews, 30/min wishlist, 200/min admin); seeded promotions with
active campaign; price normalization (seed + dev DB repair, paise→major units);
`localizeImageUrl` for optimizer-blocked localhost images; category heroes using real
imagery; blog cover localization. **Why:** a mixed bag of audited stubs and
runtime-discovered bugs blocking a coherent demo. **Verified:** typecheck per change;
visual checks on shop/PDP/blog/category pages; `/store/promotions` returns both codes.
→ [L3/006](L3/006-auth-account-platform.md)

## WP-05 — UX polish: shop, PDP, landing, cart (Wave C, 2026-08-22)
**What:** shop dual-handle price slider (300ms debounce), subcategory nesting,
in-stock/customizable toggles, category counts, ItemList JSON-LD; category-page
Price/Material filters + trophies CTA → customizer; PDP share/compare-price/EMI/SKU/
OOS-variant states/gallery hover-zoom + lightbox keyboard nav; landing hero parallax +
Ken Burns + word-by-word reveal (a11y-safe), brand-values ring draw-in, testimonials
autoplay with monogram avatars; cart cross-sell, empty-state bestsellers, sticky mobile
checkout bar. **Why:** remaining spec gaps in `.cursor/plans/pages/02–05`. **Files:**
`filter-sidebar.tsx`, `shop-client.tsx`, `range-slider.tsx` (new), `product-actions.tsx`,
`image-gallery.tsx`, `hero-section.tsx`, `testimonials.tsx`, `cart-recommendations.tsx`
(new), `lib/product-filters.ts` (new, tested). **Verified:** 40 storefront tests incl.
new filter-helper tests; typecheck/lint green. → [L3/005](L3/005-ux-polish.md)

## WP-04 — Content, SEO & imagery (Wave B, 2026-08-21→22)
**What:** bestsellers carousel; order-confirmation page (real order fetch, `#LC-`
display id, delivery estimate, share); PDP reviews tab on the real reviews module
(average, distribution, sort, moderated write-a-review); JSON-LD (BlogPosting,
BreadcrumbList, Organization+WebSite, FAQPage); placeholder panels → real generated
imagery (craftsmanship story, category stories, related-category cards); hero image
crossfade across all three hero PNGs; blog article sticky TOC + author card +
newsletter CTA; designs "Open" → real customizer routes; final privacy/terms copy. **Why:**
audited content/SEO gaps; the brand forbids placeholder boxes. **Verified:**
typecheck/lint/test green; OG/JSON-LD present in built HTML. → [L3/004](L3/004-content-seo.md)

## WP-03 — Storefront commerce wiring (Wave A2, 2026-08-21→22)
**What:** Razorpay checkout passes `order_id` + session amount and HMAC-verifies the
signature server-side (`app/api/checkout/verify-razorpay/route.ts`) before completing
the cart; promo codes apply/remove on the cart via `promo_codes`; order summary shows
discounts; coupons page reads a new `GET /store/promotions` route; wishlist hearts
sync via `use-wishlist` (optimistic, 401→login); env templates gained
`NEXT_PUBLIC_RAZORPAY_*`; newsletter/contact forms POST to the backend. **Why:** the
checkout chain previously completed orders without payment verification; coupons were
hardcoded samples. **Verified:** storefront typecheck/test/lint green; code review of
the verification chain. → [L3/003](L3/003-commerce-wiring.md)

## WP-02 — Backend hardening (Wave A1, 2026-08-21→22)
**What:** fixed 8 seed typecheck errors; Razorpay webhook now processes
captured/authorized/failed via the payment module with a new `webhook-events`
idempotency module; `authorizePayment` verifies against the Razorpay API (unpaid
orders can no longer confirm); unique/composite index migrations (blog/wishlist/
reviews); seeds extended to all 9 product images + 6 new products + blog covers/SEO
fields + 5 reviews per product, all idempotent; `/store/contact` + `/store/newsletter`
routes; wrote missing plan doc `backend/03-razorpay.md`. **Why:** payment integrity
and catalog depth are launch blockers. **Verified:** medusa typecheck + 14 tests;
live smoke — migrations applied, seeds run twice idempotently against dev Postgres.
→ [L3/002](L3/002-backend-hardening.md)

## WP-01 — Brand foundation, audit & execution system (2026-08-21)
**What:** extracted the 15-page identity deck (image-rendered); confirmed the brand
contract (palette, type, maker's mark, materials, voice); ran a three-way audit
(storefront/backend/assets) against `.cursor/plans/` producing the gap list that
drove WP-02…WP-07; installed skills.sh skills (`.agents/skills/`: react-best-practices,
web-design-guidelines, view-transitions, composition-patterns); wrote
`.cursor/plans/KIMI-EXECUTION-STATUS.md`; created the `kimi` branch. **Why:** the goal
demanded brand fidelity and a resumable multi-agent execution system. **Verified:**
audit findings each resolved in later WPs. → [L3/001](L3/001-brand-foundation.md)
