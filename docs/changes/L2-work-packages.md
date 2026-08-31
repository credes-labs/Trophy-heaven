# L2 — Work packages

A paragraph per work package: what, why, key files, verification. Deep detail in the
linked L3 files. Newest first; anchor IDs (WP-NN) are stable — reference them from L1
and L3.

## WP-32 — Vercel schemas prebuild (2026-09-01)
**What:** Storefront `build` runs `pnpm --filter @legacy-crafts/schemas build` before `next build`; `apps/storefront/vercel.json` sets the same command. **Why:** Vercel Root Directory is `apps/storefront`, so `pnpm run build` skipped the workspace `schemas:build` step and TypeScript could not resolve `@legacy-crafts/schemas`. **Files:** `apps/storefront/package.json`, `apps/storefront/vercel.json`. **Verified:** storefront typecheck after schemas build. → [L3/030](L3/030-vercel-schemas-build.md)

## WP-31 — Retire leftover sample SKUs (2026-08-31)
**What:** Soft-delete six original seed products from Medusa and stop recreating them. Shop fallback, trophies CTA, and e2e handles now use remaining SKUs (Oak Side Table, Engraved Wooden Plaque, homepage furniture). **Why:** Those samples were leftover catalog noise next to the homepage furniture set. **Files:** `seed.ts`, shop/category fallbacks, e2e specs. **Verified:** seed delete + storefront typecheck. → [L3/029](L3/029-retire-sample-skus.md)

## WP-30 — Homepage cards to Medusa PDPs (2026-08-31)
**What:** `#products` rail and `#explore` grid cards go to `/products/[handle]` instead of `/shop`. Seed creates the 21 matching furniture SKUs (idempotent by title/handle). **Why:** Figma homepage pieces were static and every card dumped to the listing. **Files:** `products-categories/constants.ts`, `explore/constants.ts`, `medusa/src/scripts/homepage-furniture.ts`, `seed.ts`. **Verified:** storefront unit tests + seed; browser Luno and Eclipse Maple PDPs. → [L3/028](L3/028-homepage-pdp-links.md)

## WP-29 — Addresses editorial add/edit (2026-08-31)
**What:** `/account/addresses` list and add/edit dialog use the shop editorial system: cream panel, Outfit, PIN-first Home/Work form (same as checkout), underline actions. **Why:** Edit opened a white shadcn card with gold save, which broke the account shell. **Files:** `account/addresses/page.tsx`, `checkout/address-form.tsx`. **Verified:** storefront typecheck + tests; browser add and edit on `/account/addresses`. → [L3/027](L3/027-addresses-editorial.md)

## WP-28 — Addresses session + password reveal (2026-08-31)
**What:** `/account/addresses` no longer logs the customer out; password fields on login/register/reset/checkout/settings have a show/hide control. **Why:** the addresses page called `loadCustomer` on mount, which set `loading: true` and unmounted the account shell in a loop until retrieve failed and the session was cleared. **Files:** `auth-store.ts`, `account-shell.tsx`, `addresses/page.tsx`, `password-field.tsx`. **Verified:** storefront unit tests + typecheck; browser addresses stay signed in and login eye toggles. → [L3/026](L3/026-addresses-session-password-reveal.md)

## WP-27 — Checkout auth and saved addresses (2026-08-31)
**What:** Checkout now requires login or signup, then pick a saved address or create/save another (PIN-first Home/Work form). Wishlist stays login-only. Payment/Razorpay is left open. **Why:** checkout let anyone skip an account; address needed a saved-list + create flow. **Files:** `checkout/*`, `login`/`register` `next` param, `/api/pincode/[pin]`. **Verified:** storefront unit tests + typecheck; browser checkout gate + wishlist login redirect. → [L3/025](L3/025-checkout-auth-wishlist.md)

## WP-26 — Login + wishlist editorial (2026-08-31)
**What:** Login (and the linked register / forgot / reset screens) plus the logged-in account shell and wishlist now use the shop editorial system. **Why:** those routes were still gold Cards, serif titles, and Lucide sidebar after the rest of the storefront moved on. **Files:** `auth-frame.tsx`, `account-shell.tsx`, `account/{login,register,forgot-password,reset-password,wishlist}/page.tsx`. **Verified:** browser on login + wishlist; storefront typecheck. → [L3/024](L3/024-login-wishlist-editorial.md)

## WP-25 — Footer destinations + journal editorial (2026-08-29)
**What:** Footer and header flyouts now point at real catalog, about hashes, journal, corporate, and terms routes; journal index and articles use the same Outfit / cream / watermark language as shop, with workshop JPEG covers when a post has none. The footer wordmark is no longer a full-width home hit-target. **Why:** Several footer labels looked clickable but landed on `/shop` or `/about` with no matching page or sort; the giant wordmark and polaroids could intercept clicks. **Files:** `footer/constants.ts`, `footer-nav.tsx`, `cta-band.tsx`, `site-nav/constants.ts`, `about/page.tsx`, `blog/*`, `lib/blog.ts`. **Verified:** Playwright footer clicks + journal screenshots; storefront typecheck. → [L3/023](L3/023-footer-journal.md)

## WP-24 — Informational & Support Pages Redesign (2026-08-29)
**What:** Redesigned 10 previously generic/old pages (`/about`, `/faq`, `/contact`, `/shipping-returns`, `/privacy`, `/terms`, `/corporate`, `/corporate/bulk`, `/offline`, `/api-docs`) using the custom Figma editorial design language: `Outfit` typography, fluid clamp typography, `#131111` / `#F2F1EF` / `#FBFBF7` surfaces, interactive FAQ filters, brief form with inquiry categories, segmented shipping & returns tiers, and structured legal document layouts. **Why:** Eliminates the visual disparity between the redesigned homepage/catalog and remaining legacy informational routes. **Files:** `apps/storefront/src/app/(shop)/{about,faq,contact,shipping-returns,privacy,terms,corporate,corporate/bulk}/page.tsx`, `offline/page.tsx`, `bulk-calculator.tsx`, `faq-client.tsx`, `contact-form.tsx`, `shipping-returns-tabs.tsx`. **Verified:** Playwright MCP screenshots of homepage/shop + all 10 routes (FAQ accordion, Shipping Returns tab, bulk underline fields); Cursor IDE browser walk of the same routes; storefront `typecheck` green. → [L3/022](L3/022-informational-pages-redesign.md)

## WP-23 — Logic-layer critical and high fixes (2026-08-26)
**What:** Closed the payment unit mismatch (Medusa ₹ → Razorpay paise), blocked unpaid `completeCart` when Razorpay is configured, issued guest `owner_token`s so `null === null` is not ownership, made clone/corporate/reviews/returns ID-safe, transferred guest carts on login, always create carts with a region, pick in-stock cheapest variants, and made bulk confirm / production jobs / search / rate-limit / seed amounts consistent with major units. **Why:** a logic audit found undercharge, unpaid orders, and several IDOR/integrity holes. **Files:** Razorpay provider + webhook; cart complete hook; design/corporate/reviews routes; storefront cart/auth/checkout; seed. **Verified:** Medusa unit specs + storefront vitest (currency, ownership, cart complete, product-filters, checkout). → [L3/021](L3/021-logic-layer-critical-high.md)

## WP-22 — Announcement bar walnut (2026-08-25)
**What:** `AnnouncementBar` background is `#131111` with cream text instead of `bg-trophy`. **Why:** the burgundy strip clashed with the walnut header. **Files:** `announcement-bar.tsx`. **Verified:** browser on an inner page with the bar visible.

## WP-21 — Product page gallery and layout redo (2026-08-25)
**What:** PDP layout moved into page-local `pdp.css` (square well, overlay arrows, thumbs, 55/45 hero, 2-col reviews, 4-col related). Champion Metal Cup and Oak Side Table now seed three existing product JPEGs so the gallery can be checked against the screenshot structure. **Why:** the first PDP pass hid thumbs on single-image SKUs and lost grids in stale CSS. **Files:** `pdp.css`, `image-gallery.tsx`, `product-actions.tsx`, `product-tabs.tsx`, `product-reviews.tsx`, `related-products.tsx`, `seed.ts`. **Verified:** live `/products/champion-metal-cup` — thumb 2 → 02/03. → [L3/019](L3/019-pdp-gallery-redo.md)

## WP-20 — Cart page and sidebar cart (2026-08-25)
**What:** `/cart` follows the screenshot structure: Back, thin uppercase YOUR CART, X + square thumb + title/variant + qty + line total, coupon + APPLY + UPDATE CART under the list, CART TOTALS behind a vertical hairline (shipping 3–5 days, tax, subtotal, total), walnut PROCEED TO CHECKOUT and Continue shopping. Sidebar cart uses the same cream Outfit language and the same totals breakdown. **Why:** cart still looked like the old catalog card; the screenshot was placement-only after shop was locked. **Files:** `cart/page.tsx`, `cart.css`, `cart-item.tsx`, `order-summary.tsx`, `promo-code.tsx`, `cart-drawer.tsx`, `cart-store.ts`. **Verified:** storefront typecheck; browser on `/cart` and the header drawer. → [L3/020](L3/020-cart-page-layout.md)

## WP-19 — Product page structure layout (2026-08-25)
**What:** `/products/[handle]` follows the screenshot structure: slash breadcrumb, ~55/45 square gallery | buy column, OPTIONS + qty/ATC/heart, centered Description / Specifications / Reviews (reviews = list | form), 4-column related tiles. Chrome stays homepage Outfit/cream — not the demo-theme headers. **Why:** two PDP refs were placement-only after shop was locked. **Files:** `products/[handle]/page.tsx`, `image-gallery.tsx`, `product-actions.tsx`, `product-tabs.tsx`, `product-reviews.tsx`, `related-products.tsx`. **Verified:** storefront typecheck + lint; browser on a live product. → [L3/018](L3/018-pdp-structure-layout.md)

## WP-18 — Shop browse + filter layouts (2026-08-25)
**What:** `/shop` now has two structures. Browse: featured hero, centered “Recent pieces,” 4-column editorial tiles, load more, testimonials, dining-table banner. Filter-open: breadcrumb above both columns, then sidebar **beside** category still + toolbar + 3-column grid + numbered pages (filled active + showing count). Browse↔filter is one tree: `.shop-page.is-filter` eases the sidebar open, collapses the hero first, reveals the banner in the product column, and swaps load-more/pagination in one height. **Why:** structure refs for browse vs filter-clicked; visual language stays the landing page; exclusive trees and stacked hero+banner folds made the toggle feel like a page swap. **Files:** `shop-client.tsx`, `shop-fold.tsx`, `filter-sidebar.tsx`, `shop-hero.tsx`, `shop-toolbar.tsx`, `shop-testimonials.tsx`, `shop-banner.tsx`, `shop-pagination.tsx`, `shop/page.tsx`, `globals.css`. **Verified:** storefront typecheck + lint; browser toggle on `/shop`. → [L3/017](L3/017-shop-browse-filter-layout.md)

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
**Update 2026-08-25:** footer wordmark `l` is Outfit 700 with horizontal `text-shadow` so the stem matches “egacy” at display size. Outfit loader now includes 700. **Files:** `footer-nav.tsx`, `footer-nav.css`, `layout.tsx`.

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
