# L1 — Milestones

One or two lines per milestone. Detail lives in [L2](L2-work-packages.md) and [L3/](L3/).
Newest first.

## 2026-10-25 — Nav bar drops “Collection”
The site nav, on desktop and mobile, no longer has a COLLECTION item; CATALOG now leads. The shop pages and the footer link stay. → L2 WP-59

## 2026-10-25 — Design studio becomes a 3D plaque configurator
`/customize` now lets customers turn an engraved plaque in 3D. They choose the form, timber, plate, display and size, type their engraving onto the model live, share the exact design by link, and add it to the cart as a saved design. → L2 WP-56 · [L3/043](L3/043-customize-3d-configurator.md)

## 2026-10-25 — Category furniture spins a full turn, uncut, and swaps smoothly
When a category changes, the old piece now sinks out of its slot while the new one eases in, instead of vanishing. Switching no longer redraws textures, so the swap no longer hitches. Every piece now turns a full 360° every 15 seconds. Each is sized to its slot so that no angle cuts it off at the slot edge. → L2 WP-53 · [L3/041](L3/041-category-furniture-transitions.md)

## 2026-10-25 — Homepage drops the client quotes
“//in their words” (“What clients say after the ceremony.”) is unmounted from the homepage; “//for organisations” now follows “Explore the collection”. The component stays in the repo. → L2 WP-54

## 2026-10-25 — Categories show 3D furniture instead of photos
The `//categories` stage draws three procedural 3D pieces per category, with no backgrounds: lounge chair, bouclé armchair, oak coffee table, walnut dining table, fluted-glass side table, and bookcase, all modelled on the catalog photos. The pieces swap in when a category is picked. → L2 WP-52 · [L3/040](L3/040-category-furniture-3d.md)

## 2026-10-25 — Materials section is six 3D specimens
“We name what we use.” keeps its eyebrow and headline. The text grid is now one shared WebGL canvas: walnut, brass, Belgian linen, teak, leather, and hand-loomed jute. Optical crystal and honed stone are gone from this section. → L2 WP-51 · [L3/039](L3/039-materials-specimens.md)

## 2026-10-25 — Mobile hero stacks the headline, then the chair
Below the desktop breakpoint the chair follows the headline and overlaps its lower lines. The caption and both actions sit clear of the bottom navigation. → L2 WP-50

## 2026-10-25 — Material specimens stay in their slots while scrolling
The shared materials canvas is fixed to the viewport, so the six objects no longer slip off their names when the page moves. → L2 WP-49

## 2026-10-25 — Install prompt is a full-width bar
The PWA install prompt spans the screen with a hairline border, paper ground, and the ink Install button. On a phone it sits above the bottom navigation. → L2 WP-48

## 2026-10-25 — Hero chair sits on the lower headline; collection filters stick
The studio photograph is the hero background and the walnut chair cutout overlaps “intention.” and “Built to last.” The Explore filters stick beside the product grid on desktop and release at the end of that section. → L2 WP-47 · [L3/038](L3/038-hero-chair-sticky-filters.md)

## 2026-10-25 — Organisations band sits between quotes and the journal
“//for organisations” moves from after recent work to between “//in their words” and “//journal”, on desktop and on the phone order. → L2 WP-46

## 2026-10-25 — Homepage drops three studio sections
“//three disciplines”, “//design it first”, and “//how it works” are unmounted from the homepage. The section components stay in the repo. → L2 WP-45

## 2026-10-25 — Footer wordmark “l” matches the rest of the word
The extra bold weight and wide shadow on the footer “l” are gone. A hair of horizontal shadow keeps the stem even with “egacy”. → L2 WP-44

## 2026-10-25 — Letter column left-aligned; trust lines match the footer sentence
The “A letter, not a blast.” column is left-aligned. The four trust lines drop semibold ink for the footer sentence’s regular weight, muted color, and tracking. → L2 WP-43

## 2026-10-25 — Footer CTA line hides below the desktop breakpoint
The ceremony sentence and Shop the collection button stay beside the orbit from `lg` up, and leave the layout on smaller screens. The orbit, wordmark, and link columns stay. → L2 WP-42

## 2026-10-25 — Letter form and trust lines share one row
The newsletter sits on the left; the four trust lines stack on the right, evenly spaced and semibold. The separate trust strip is gone. → L2 WP-41 · [L3/037](L3/037-signup-trust-row.md)

## 2026-10-25 — Footer orbit moves left; CTA sits beside it
No orbit line, no visible headline; the line and button sit right of the revolving pieces, which clear the footer links. → L2 WP-40 (amends [L3/036](L3/036-footer-orbit.md))

## 2026-10-25 — Footer pieces revolve on a 3D ring
Five furniture cutouts orbit above the footer links in a lazy-loaded three.js scene, with a static row for reduced motion. → L2 WP-39 · [L3/036](L3/036-footer-orbit.md)

## 2026-10-25 — Footer wordmark fills the row; link columns stay on the gray
The white strip under the footer was the page background showing past a fixed-height row. “legacy” now fills the width beside the columns, and the Support links sit above a padded footer edge. → L2 WP-38 · [L3/035](L3/035-footer-wordmark.md)

## 2026-10-25 — Homepage hero is a full-bleed poster
The tagline is set large on the studio photograph, with a single-row nav and the existing caption and actions on the lower right. Same copy, same images. → L2 WP-37 · [L3/034](L3/034-hero-poster.md)

## 2026-10-25 — Editorial type meets WCAG on paper
Washed-out ink (as low as 4% opacity) and gold focus rings are now muted ink `#6B635C` and 2px ink outlines. Account pages that were still gold cards match the editorial system. → L2 WP-36 · [L3/033](L3/033-editorial-contrast.md)

## 2026-10-03 — Vercel production hardening for revised storefront
Canonical site URL + Medusa-down resilience so `/` renders on Vercel without localhost metadata. → L2 WP-35 · [L3/032](L3/032-vercel-production-hardening.md)

## 2026-10-03 — Homepage becomes three-discipline Legacy Crafts + sitemap pages
Homepage grew from 4 to 14 sections (INR, customizer-led), with copy deck and 14 new routes for browse-to-order. → L2 WP-34 · [L3/031](L3/031-homepage-sitemap.md)

## 2026-10-03 — pnpm 10 allowlist for dependency install scripts
Fresh installs skipped esbuild, SWC, and canvas postinstalls, so native binaries never built. `pnpm-workspace.yaml` now allows those builds. → L2 WP-33

## 2026-09-01 — Vercel storefront build compiles shared schemas first
`next build` on Vercel failed because `@legacy-crafts/schemas` had no `dist/`. Storefront build now compiles that package first. → L2 WP-32 · [L3/030](L3/030-vercel-schemas-build.md)

## 2026-08-31 — Retired six leftover sample SKUs from Medusa
Crystal Star Award, Champion Metal Cup, Acrylic Award Plaque, Walnut Dining Chair, Teak Wall Shelf, and Handmade Ceramic Vase are deleted and no longer re-seeded. → L2 WP-31 · [L3/029](L3/029-retire-sample-skus.md)

## 2026-08-31 — Homepage furniture cards open the matching PDP
Product rail and Explore tiles link to `/products/[handle]`; those SKUs are seeded in Medusa. → L2 WP-30 · [L3/028](L3/028-homepage-pdp-links.md)

## 2026-08-31 — Address edit panel matches checkout editorial
The `/account/addresses` add/edit dialog is cream Outfit, PIN-first, Home/Work — not the old white card. → L2 WP-29 · [L3/027](L3/027-addresses-editorial.md)

## 2026-08-31 — Addresses no longer logs you out; password fields have an eye
Visiting `/account/addresses` no longer clears the session. Login, register, reset, checkout, and settings password fields can be revealed. → L2 WP-28 · [L3/026](L3/026-addresses-session-password-reveal.md)

## 2026-08-31 — Checkout requires login; wishlist stays account-only
Guests can add to cart. Checkout asks for sign-in, then saved or new addresses. Hearts and wishlist still require login. Payment stays open. → L2 WP-27 · [L3/025](L3/025-checkout-auth-wishlist.md)

## 2026-08-31 — Login and wishlist match shop editorial
Auth cards and gold account chrome replaced with Outfit / cream / watermark. Wishlist uses editorial tiles. → L2 WP-26 · [L3/024](L3/024-login-wishlist-editorial.md)

## 2026-08-29 — Footer links go to real routes; journal matches shop
Gift Cards / Best Sellers / invalid shop sort and duplicate About dumps replaced with category, journal, corporate, and terms URLs. Journal restyled to the editorial system. → L2 WP-25 · [L3/023](L3/023-footer-journal.md)

## 2026-08-29 — Informational & support pages redesigned to homepage editorial system
Replaced all 10 generic templates (`/about`, `/faq`, `/contact`, `/shipping-returns`, `/privacy`, `/terms`, `/corporate`, `/corporate/bulk`, `/offline`, `/api-docs`) with Outfit typography, fluid scaling, and rich editorial atelier layouts. → L2 WP-24 · [L3/022](L3/022-informational-pages-redesign.md)

## 2026-08-26 — Logic-layer critical and high integrity fixes
Razorpay paise conversion, unpaid complete, guest design/corporate IDOR, cart transfer/stock, and production/search hardening. → L2 WP-23 · [L3/021](L3/021-logic-layer-critical-high.md)

## 2026-08-25 — Footer “legacy” L optically thickened
Outfit’s lowercase l is a single stem; at the 242px wordmark it read thinner than the rest of the letters. First letter is now 700 with a horizontal thicken. → L2 WP-12

## 2026-08-25 — Sidebar cart shows shipping, tax, subtotal, total
Drawer footer matches the full cart totals breakdown. → L2 WP-20 · [L3/020](L3/020-cart-page-layout.md)

## 2026-08-25 — Announcement bar is walnut, not trophy burgundy
The rotating top strip uses `#131111` / cream text so it sits flush with the header. → L2 WP-22

## 2026-08-25 — Cart page + sidebar match screenshot structure
Full cart is 2/3 items | 1/3 totals with coupon under the list. Drawer matches. Type and color stay the homepage Outfit/cream system. → L2 WP-20 · [L3/020](L3/020-cart-page-layout.md)

## 2026-08-25 — PDP gallery redo + multi-image SKUs
Page-local `pdp.css` plus three images on Champion Metal Cup and Oak Side Table so thumbs/arrows/01–03 can be checked against the screenshot structure. → L2 WP-21 · [L3/019](L3/019-pdp-gallery-redo.md)

## 2026-08-25 — Product page matches screenshot structure
PDP is breadcrumb + gallery | buy + centered tabs + 4-up related. Type and color stay the homepage Outfit/cream system. → L2 WP-19 · [L3/018](L3/018-pdp-structure-layout.md)

## 2026-08-25 — Shop browse→filter reflow
Filter layout puts the sidebar beside the banner/toolbar/grid. Toggle is a CSS reflow (hero first, then chrome) instead of stacked folds or a hard swap. → L2 WP-18 · [L3/017](L3/017-shop-browse-filter-layout.md)

## 2026-08-25 — Shop browse vs filter-open layouts
`/shop` default is hero + 4-column recent grid + testimonials + banner. **filter** opens sidebar + toolbar + 3-column grid in the same tree (clip/reflow, not a hard swap). Chrome stays the homepage Outfit/cream system. → L2 WP-18 · [L3/017](L3/017-shop-browse-filter-layout.md)

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
