# 029 — Retire leftover sample SKUs

- Date: 2026-08-31 · Branch: current · Status: shipped
- Layer-2 anchor: WP-31

## Context / why

Admin still listed early seed samples (Crystal Star Award, Champion Metal Cup, Acrylic Award Plaque, Walnut Dining Chair, Teak Wall Shelf, Handmade Ceramic Vase) after the homepage furniture catalog was added. They were requested removed.

## Decisions made (and alternatives rejected)

- Soft-delete via `deleteProductsWorkflow` on every seed, same pattern as `catalog-trophy-*`, so a re-seed does not bring them back.
- Keep Engraved Wooden Plaque (customizable), Oak Side Table, Brass Table Lamp, Handwoven Wall Textile, plus homepage furniture.
- Point e2e ATC at oak-side-table / brass-table-lamp; customize 2D at engraved-wooden-plaque; skip 3D (no remaining full_3d flagship).

## Changes (file → what)

- `seed.ts` — `RETIRED_SAMPLE_HANDLES`; dropped create blocks and imagery backfill
- `shop/constants.ts` — featured fallback uses Luno
- `category-page.tsx` — trophies CTA uses engraved plaque
- e2e specs — new handles

## Gotchas for future work

- Do not add these six handles back in seed without removing them from `RETIRED_SAMPLE_HANDLES`.
- `deleteProductsWorkflow` refuses inventory items whose **computed** `reserved_quantity` is > 0. Deleting `reservation_item` rows is not enough if `inventory_level.reserved_quantity` is still positive (open carts). Seed zeros those levels first.
- 3D customize e2e is skipped until a new full_3d product exists.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/medusa seed` — `Removed 6 retired catalog product(s).` then `Seed complete.`
- Postgres: the six handles have `deleted_at` set; they are absent from the live product list (25 live SKUs remain).
