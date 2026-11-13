# 054 - Category collection 3D heroes

- Date: 2026-10-29
- Layer-2 anchor: WP-80

## Context / why
The artwork, furniture and trophy listings used tinted photo banners and a page surface that differed from the footer. The user requested the same product WebGL components used in the homepage categories instead.

## Changes
- `catalog/category-hero.tsx`: replaces the photo/gradient banner with an editorial heading and three product models; retains breadcrumbs, copy and product count.
- `catalog/category-hero-models.tsx`: maps artwork to sculptures, furniture to tables and trophies to awards using the homepage discipline tuples and shared CategoryCanvas. Lazy client-only loading, viewport pausing, reduced motion, accessible product labels and photo fallbacks remain available.
- `products-categories/canvas-boundary.tsx`: extracts the existing error boundary so both placements restore photos after canvas failure.
- `catalog/category-page.tsx`: uses the footer's #F2F1EF surface across loading/content and behind the transparent site header.

## Decisions and limits
Models reuse the existing photo-informed procedural geometry, studio environment and fitted camera. The collection header presents only its own discipline, without the homepage category switcher or wheel interception. The three slots share a single transparent canvas and use the same responsive DOM slots on desktop/mobile. The canvas pauses when the model area leaves the viewport.

## Verification
Pending repository and browser checks.

## Verification results
- Root lint passed with 7 pre-existing warnings; root typecheck passed.
- Root unit command hit the documented Windows TEST_TYPE syntax issue after 18 schema tests. Direct storefront Vitest passed 110 tests and PowerShell Medusa Jest passed 44, for 172 total.
- Chromium/SwiftShader rendered each collection at 1440px and 390px: correct three product labels, no horizontal overflow, matching page/footer rgb(242, 241, 239). Screenshots of all six layouts were inspected.
- Reduced-motion model screenshots were byte-identical; rotation resumed after changing the preference. Forced WebGL context loss restored all three loaded photo fallbacks and removed the canvas. Sorting still updates the listing URL.
- No JavaScript runtime errors. Anonymous product-card wishlist requests return existing 401 responses from /store/wishlist; these are unrelated to the hero renderer.
- Scrolled through the artwork listing/footer boundary to verify the unified surface and that offscreen hero models do not remain over the listing.
- Source whitespace check passed. Production build pending.

**Production build follow-up:** Root pnpm build passed for schemas, observability, storefront and Medusa backend/admin. Existing Next Edge runtime deprecation warning remains.
