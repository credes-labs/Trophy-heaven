# 063 — Shop seed from photographed awards

- Date: 2026-11-23 · Branch: current · Status: shipped
- Layer-2 anchor: WP-102

## Context / why

The local database already had the three catalogue products from `seed.ts` (Engraved Wooden Plaque, Achievement Statuette, Ascent Figure Award). `/shop` looked empty because every other trophy category had no product. The brand photographs already show more awards; they were used on marketing pages and not sold as products.

## Decisions made (and alternatives rejected)

- Add those awards to `trophy-collection.ts` and re-run the existing seed, which skips handles already present. A one-off SQL insert would not come back on the next seed.
- Use the brand WebPs already in `public/images/brand/`. No new imagery, and no repeated photo under a second name.
- Leave Memorial, Acrylic, and Gift Sets empty. Nothing in the photo set is those materials.
- Keep `full_3d` on the two studio figures only. The new pieces are `text_only` so the studio does not offer a model it does not have. `seed-studio-trophies.ts` now updates `STUDIO_HANDLES` only.

## Changes (file → what)

- `apps/medusa/src/scripts/trophy-collection.ts` — six products: Laurel Cup (Sports), Pedestal Cup (Metal), Flame Award (Corporate), Palace Crystal (Crystal), Ribbon Medallion (Sports), Excellence Crystal (Corporate). Per-piece finish and customization. SKU shapes differ where two pieces share a material.
- `apps/medusa/src/scripts/seed-studio-trophies.ts` — metadata refresh limited to the two studio handles.

## Gotchas for future work

- Seed is idempotent on title and handle. Changing a price or image on an existing handle does not update the row.
- Two crystal pieces and two cups would have collided on `generateSku` if they shared a shape token. New pieces use Laurel, Pedstl, Palace, Excel, Flame, Ribbon.
- Wide brand banners (crystal, ribbon) are `object-cover` on the tall shop card, so the frame crops the sides.

## Verification (commands + evidence)

- `npx medusa exec ./src/scripts/seed.ts` — "Created 6 sample product(s). Stocked 6 inventory item(s)."
- `GET /store/products` with the storefront publishable key — count 9, including the six new handles.
- `GET http://localhost:3000/shop` — HTML includes Laurel Cup, Pedestal Cup, Flame Award, Palace Crystal, Ribbon Medallion, Excellence Crystal, and Achievement Statuette.
