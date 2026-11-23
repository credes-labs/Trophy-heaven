# 064 — Reframe Palace Crystal and Ribbon Medallion

- Date: 2026-11-23 · Branch: current · Status: shipped
- Layer-2 anchor: WP-103

## Context / why

Palace Crystal and Ribbon Medallion were seeded from the wide brand banners (`banner-crystal.webp`, `banner-ribbon.webp`, both 1600×534). The shop card is `aspect-[302/374]` with `object-cover`, so the visible window was the centre of the banner: the wordmark, with the award cut off on the right.

## Decisions made (and alternatives rejected)

- Ribbon Medallion fits a portrait slice. The trophy, including the tip and the base, sits in a 431×534 window starting 900px from the left of the banner. That window matches the card, so `object-cover` does not crop it again.
- Palace Crystal is wider than that window. Scaling the block down into the card and feathering only the top and bottom into a blurred continuation of the same photo keeps the block and pedestal whole. A hard `extend` copy left a visible seam. `object-position` alone cannot show a subject wider than the cover window.
- Leave the shop hero on the original banners. Those layouts are the wide composition the banners were made for.

## Changes (file → what)

- `apps/storefront/public/images/catalog/palace-crystal.webp` — portrait tile
- `apps/storefront/public/images/catalog/ribbon-medallion.webp` — portrait tile
- `apps/storefront/public/images/manifest.json` — both registered
- `apps/medusa/src/scripts/trophy-collection.ts` — those two products point at the tiles
- `apps/medusa/src/scripts/seed.ts` — imagery refresh map includes the new handles
- Live rows for `palace-crystal` and `ribbon-medallion` updated by re-running the seed

## Gotchas for future work

- Re-running the seed updates a thumbnail only when it differs from the map. A new crop needs a new filename or a changed URL or the old thumbnail stays.
- The crystal tile's top and bottom are a soft extension of the photo, not extra pixels from the banner. The banner itself clips the top of the block.

## Verification (commands + evidence)

- Card-sized JPEG previews of both tiles: the award is complete and centred.
- `npx medusa exec ./src/scripts/seed.ts` logged "Updated imagery" for both handles.
- `GET /shop` references `/images/catalog/palace-crystal.webp` and `/images/catalog/ribbon-medallion.webp`. The hero still uses `banner-crystal.webp`.
