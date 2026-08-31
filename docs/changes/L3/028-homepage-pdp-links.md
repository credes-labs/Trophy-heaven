# 028 — Homepage cards to Medusa PDPs

- Date: 2026-08-31 · Branch: current · Status: shipped
- Layer-2 anchor: WP-30

## Context / why

Homepage `#products` and `#explore` cards were Figma static data with `href: "/shop"`. Clicking Luno 210 or Eclipse Maple never opened a product page.

## Decisions made (and alternatives rejected)

- Keep editorial names, USD copy, and local JPEGs on the homepage; only the destination is a Medusa handle.
- Seed the 21 unique pieces into Medusa so `/products/[handle]` resolves. Do not replace the homepage with a live `listProducts` grid (that would swap USD Figma prices for INR catalog prices).
- INR seed price is USD × 85 (major units). Duplicate names across tabs share one handle.

## Changes (file → what)

- `products-categories/constants.ts` — PDP href map
- `explore/constants.ts` — each tile `/products/{id}`
- `medusa/src/scripts/homepage-furniture.ts` — seed payload
- `medusa/src/scripts/seed.ts` — create missing homepage SKUs

## Gotchas for future work

- Homepage still shows `$` copy; PDP shows region currency from Medusa.
- Re-run `pnpm --filter @legacy-crafts/medusa seed` after clone; skip if title/handle already exists.
- The products rail only suppresses a click after an 8px horizontal drag, so a tap still follows the PDP link.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront test` (homepage link unit tests)
- `pnpm --filter @legacy-crafts/medusa seed`
- Browser: home Luno card → `/products/luno-210-lounge-chair`; Eclipse Maple → `/products/eclipse-maple`
