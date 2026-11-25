# 071 — The owner's own catalogue

- Date: 2026-11-25 · Branches: client-preview, main · Status: deployed with the next bootstrap
- Layer-2 anchor: WP-115

## Context / why

The owner sent photos of 23 pieces his workshop actually sells (item numbers 1282, 1585, 1648, 4066, 4091, 4092, 4120, 4131, 4228, 4264, 4275, 4338, 4373, 4385, 4390, 5051, 831, 925 SR Lady, JH089, JH096, JH203, JH234, JH263) and asked for products that are not his to be removed.

## Decisions made (and alternatives rejected)

- Removed the six demo trophies (Laurel Cup, Pedestal Cup, Flame Award, Palace Crystal, Ribbon Medallion, Excellence Crystal) through the seed's retired-handle list, so every database converges on re-seed.
- Kept the three 3D studio pieces (Achievement Statuette, Ascent Figure Award, Engraved Wooden Plaque) in the shop, as the owner's team chose. The designer depends on them.
- Prices are INR placeholders (₹1,050–₹2,400 by type) because none were supplied. The owner sets real prices in the admin. Rejected "price on request" because it would disable the cart.
- Phone photos were background-removed locally (@imgly/background-removal-node, ISNet medium) so every piece sits on the same #F3F3F3 tile. Top-down, upside-down and washed-out views were dropped. The owner's PNG cut-outs are low resolution (335×745); their tiles are upscaled about 1.5×.
- Thin display stands under two PNGs (4390) were cropped off by ignoring rows narrower than 8% of the widest row.
- The raw folder (`public/images/Ritik-…`) is not committed. The processed WebP files are the source for the site.

## Changes (file → what)

- `apps/medusa/src/scripts/trophy-collection.ts` — 23 workshop pieces (multi-image galleries, item numbers in `metadata.item_no` and the description, multiple categories) + the two studio figures; `RETIRED_DEMO_HANDLES`
- `apps/medusa/src/scripts/seed.ts` — retires the demo handles; drops their image refresh
- `apps/medusa/src/lib/reindex-products.ts` — deletes index documents for products that no longer exist (seed deletes emit no subscriber events in `medusa exec`)
- `apps/storefront/public/images/collection/*.webp` — 61 product tiles, 800×1000
- `apps/storefront/public/images/cutouts/collection/*.webp` — 23 transparent cut-outs
- `apps/storefront/public/images/footer/ring-royal-cup.webp`, `ring-rising-star.webp` — footer orbit cards
- Homepage: `hero/constants.ts` (hero trophies), `editions/constants.ts` (categories + Selected Editions), `editions/selected-editions.tsx` (sort aligns right when it wraps); footer orbit `footer/constants.ts`
- `apps/storefront/public/images/manifest.json` — all new images registered

## Gotchas for future work

- Selected Editions prices are copied from the seed. Update both when prices change, or read them from the store API.
- `seed-content.ts` gives every product sample reviews, including the owner's pieces. Clear them before launch.
- Re-running the bootstrap does not change products that already exist. Edit them in the admin after the first seed.

## Verification (commands + evidence)

- `pnpm typecheck`, `pnpm lint` (warnings only, pre-existing), storefront Vitest 138/138, Medusa Jest 72/72.
- Local Postgres with the old catalogue: bootstrap removed the six demo products and created 23. The store API listed 26 products (23 + 3 studio). The Meilisearch index went from stale to exactly 26 documents. A second bootstrap was a no-op.
- Production build against local Medusa: home, shop, /trophies?sub=Crystal and two product pages at 1440 and 390 had no failed requests and no broken images (only the expected logged-out wishlist 401).
