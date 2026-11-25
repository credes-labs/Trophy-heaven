# Change Log — Index

This directory is the project's durable memory. It logs **what changed, why, where,
and how it was verified** — for everything done so far and everything done from now on.
It is organized as an index plus **3 layers of increasing detail**. Read the layer
that matches how much you need to know.

## The layers

| Layer | File(s) | Granularity | Read this when… |
|-------|---------|-------------|-----------------|
| **L1 — Milestones** | [`L1-milestones.md`](L1-milestones.md) | One or two lines per milestone/release | you want the story of the project in 2 minutes |
| **L2 — Work packages** | [`L2-work-packages.md`](L2-work-packages.md) | A paragraph per work package: what, why, key files, verification | you're reviewing a change or onboarding |
| **L3 — Deep details** | [`L3/`](L3/) — one file per work package | Full technical entry: context, decisions, file-by-file changes, gotchas, verification evidence | you're modifying that area and must not break it |

## L3 entries

| # | Title | Layer-2 anchor |
|---|-------|----------------|
| 058 | [Trophy Heaven rebrand: trophy-only fork](L3/058-trophy-heaven-rebrand.md) | WP-87 |
| 059 | [Editorial poster homepage, trophy cut-outs, Urbanist](L3/059-editorial-homepage-urbanist.md) | WP-88 |
| 060 | [OTP sign-in, cart designs, 10% advance + COD](L3/060-otp-designs-advance-cod.md) | WP-94 |
| 070 | [Preview uploads without R2](L3/070-preview-without-r2.md) | WP-110 |
| 071 | [The owner's own catalogue](L3/071-owner-catalogue.md) | WP-115 |
| 069 | [Client test site](L3/069-client-test-site.md) | WP-109 |
| 068 | [Render and Vercel deployment](L3/068-render-vercel-deployment.md) | WP-107 |
| 067 | [Match designs to trophies](L3/067-design-mapping.md) | WP-106 |
| 066 | [Shop filter count and category price sort](L3/066-filter-form-search-pass.md) | WP-105 |
| 065 | [Trophy listing filters](L3/065-trophy-filters.md) | WP-104 |
| 064 | [Reframe Palace Crystal and Ribbon Medallion](L3/064-reframe-award-tiles.md) | WP-103 |
| 063 | [Shop seed from photographed awards](L3/063-shop-seed-awards.md) | WP-102 |
| 062 | [Next.js 16.4.6 Google font build fix](L3/062-next-font-google-turbopack.md) | WP-101 |
| 061 | [Design and document uploads that reach the owner](L3/061-order-file-uploads.md) | WP-97 |
| 057 | [Mixed-product silhouette mosaic](L3/057-silhouette-mosaic.md) | WP-86 |
| 056 | [WebP imagery and image performance](L3/056-webp-imagery-performance.md) | WP-85 |
| 055 | [Studio choices and mobile trophy hero](L3/055-studio-picker-mobile-hero.md) | WP-81 |
| 054 | [Category collection 3D heroes](L3/054-category-collection-heroes.md) | WP-80 |
| 053 | [Gold contact globe](L3/053-contact-globe.md) | WP-78 |
| 052 | [Photo-referenced trophy studio](L3/052-trophy-studio.md) | WP-76 |
| 051 | [Mobile header and menu](L3/051-mobile-navigation.md) | WP-74 |
| 050 | [Category product WebGL](L3/050-category-product-webgl.md) | WP-73 |
| 001 | [Brand foundation & design system](L3/001-brand-foundation.md) | WP-01 |
| 002 | [Backend hardening: Razorpay chain, modules, seeds](L3/002-backend-hardening.md) | WP-02 |
| 003 | [Storefront commerce wiring](L3/003-commerce-wiring.md) | WP-03 |
| 004 | [Content, SEO & imagery](L3/004-content-seo.md) | WP-04 |
| 005 | [UX polish: shop, PDP, landing, cart](L3/005-ux-polish.md) | WP-05 |
| 006 | [Auth, account & platform fixes](L3/006-auth-account-platform.md) | WP-06 |
| 007 | [QA: accessibility, e2e, visual verification](L3/007-qa-verification.md) | WP-07 |
| 008 | [Figma home hero](L3/008-figma-home-hero.md) | WP-09 |
| 009 | [Figma home about](L3/009-figma-home-about.md) | WP-10 |
| 010 | [Figma home products & categories](L3/010-figma-home-products-categories.md) | WP-11 |
| 011 | [Figma home explore & footer](L3/011-figma-home-explore-footer.md) | WP-12 |
| 012 | [Shared site nav + editorial shop](L3/012-shop-nav-editorial.md) | WP-13 |
| 013 | [Four sample trophies for checkout](L3/013-trophy-catalog-seed.md) | WP-14 |
| 014 | [Lossless storefront image optimization](L3/014-lossless-image-opt.md) | WP-15 |
| 015 | [Photo PNG → JPEG](L3/015-photo-png-to-jpeg.md) | WP-16 |
| 016 | [CI pipeline: build, integration, e2e](L3/016-ci-pipeline.md) | WP-17 |
| 017 | [Shop browse + filter layouts](L3/017-shop-browse-filter-layout.md) | WP-18 |
| 018 | [Product page structure layout](L3/018-pdp-structure-layout.md) | WP-19 |
| 019 | [Product page gallery and layout redo](L3/019-pdp-gallery-redo.md) | WP-21 |
| 020 | [Cart page and sidebar cart](L3/020-cart-page-layout.md) | WP-20 |
| 021 | [Logic-layer critical and high fixes](L3/021-logic-layer-critical-high.md) | WP-23 |
| 023 | [Footer destinations + journal editorial](L3/023-footer-journal.md) | WP-25 |
| 024 | [Login + wishlist editorial](L3/024-login-wishlist-editorial.md) | WP-26 |
| 025 | [Checkout auth and saved addresses](L3/025-checkout-auth-wishlist.md) | WP-27 |
| 027 | [Addresses editorial add/edit](L3/027-addresses-editorial.md) | WP-29 |
| 028 | [Homepage cards to Medusa PDPs](L3/028-homepage-pdp-links.md) | WP-30 |
| 029 | [Retire leftover sample SKUs](L3/029-retire-sample-skus.md) | WP-31 |
| 030 | [Vercel schemas prebuild](L3/030-vercel-schemas-build.md) | WP-32 |
| 031 | [Homepage sections, copy deck, and sitemap](L3/031-homepage-sitemap.md) | WP-34 |
| 032 | [Vercel production hardening](L3/032-vercel-production-hardening.md) | WP-35 |
| 033 | [Editorial contrast and type](L3/033-editorial-contrast.md) | WP-36 |
| 034 | [Homepage hero poster](L3/034-hero-poster.md) | WP-37 |
| 044 | [Catalogue hero: turning silhouette grid](L3/044-shop-silhouette-hero.md) | WP-64 |
| 045 | [Plaque studio: fullscreen, wood art, panel spacing](L3/045-customize-studio.md) | WP-65 |
| 046 | [Seamless editorial headers + chair sheet on auth pages](L3/046-seamless-headers-auth-chair-sheet.md) | WP-66 |
| 047 | [Product pages: seamless nav and paper gallery](L3/047-pdp-seamless-nav-paper-gallery.md) | WP-68 |
| 048 | [Checkout editorial layout](L3/048-checkout-editorial.md) | WP-69 |
| 035 | [Footer wordmark and column padding](L3/035-footer-wordmark.md) | WP-38 |
| 036 | [Footer 3D orbit](L3/036-footer-orbit.md) | WP-39 |
| 037 | [Letter form and trust row](L3/037-signup-trust-row.md) | WP-41 |
| 038 | [Hero chair and sticky filters](L3/038-hero-chair-sticky-filters.md) | WP-47 |
| 039 | [Homepage material specimens](L3/039-materials-specimens.md) | WP-51 |
| 040 | [Categories 3D furniture](L3/040-category-furniture-3d.md) | WP-52 |
| 041 | [Category furniture transitions](L3/041-category-furniture-transitions.md) | WP-53 |
| 049 | [New photography: hero, sculpture collection, campaign set](L3/049-new-photography.md) | WP-70 |
| 043 | [/customize 3D plaque configurator](L3/043-customize-3d-configurator.md) | WP-56 |



## Rules for future changes (mandatory)

1. **Every change** gets a one-line entry in L1 (date + what + link).
2. **Every work package** gets a paragraph in L2 with: what, why, key files, how verified.
3. **Non-trivial changes** (new module, new integration, schema change, design-system
   change) get an L3 file `NNN-short-title.md` with the template below, and a row in
   the table above.
4. Write entries **before or with** the change, not after the fact. Keep them factual —
   what a future engineer needs, not narration.
5. Never edit history: corrections are new entries referencing the old ones.

## L3 template

```markdown
# NNN — Title

- Date: YYYY-MM-DD · Branch: … · Status: shipped | in-progress | deferred
- Layer-2 anchor: WP-NN

## Context / why
## Decisions made (and alternatives rejected)
## Changes (file → what)
## Gotchas for future work
## Verification (commands + evidence)
```
