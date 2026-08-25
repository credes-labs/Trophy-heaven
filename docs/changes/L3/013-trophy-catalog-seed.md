# 013 — Four sample trophies for checkout

- Date: 2026-08-24 · Branch: current · Status: shipped
- Layer-2 anchor: WP-14

## Context / why

The user asked for “2, 3, 4, or 5 trophies” (spoken as “two three”) so they can
test add-to-cart and checkout. That was misread as **223 SKUs**. The 223-product
generator is removed.

## Decisions made (and alternatives rejected)

- **Do not keep a 4-SKU generator.** `seed.ts` already publishes four trophies
  from the three storefront PNGs: Crystal Star Award, Champion Metal Cup,
  Acrylic Award Plaque, Engraved Wooden Plaque (plus furniture/decor). That is
  the test catalog.
- **Delete `trophy-catalog.ts`.** A second list would duplicate those titles or
  clutter `/shop`.
- **Seed still needs Postgres.** Cart/checkout cannot run until Docker Desktop
  (or another Postgres) is healthy and `pnpm --filter @legacy-crafts/medusa seed`
  + `dev` succeed.

## Changes (file → what)

| File | What |
|------|------|
| `apps/medusa/src/scripts/seed.ts` | Removed 223-SKU loop and extra handle/pagination plumbing |
| `apps/medusa/src/scripts/trophy-catalog.ts` | Deleted |
| `apps/medusa/src/scripts/trophy-catalog.spec.ts` | Deleted |

## Gotchas for future work

- Sample trophies are skipped if those titles already exist. Empty shop means
  Medusa is down or seed never ran, not a missing generator.
- Image URLs use `STOREFRONT_URL` (default `http://localhost:3000`). Storefront
  still needs `localizeImageUrl()` for `next/image`.
- Checkout can use `pp_system_default` / COD without Razorpay.

## Verification (commands + evidence)

```bash
pnpm --filter @legacy-crafts/medusa typecheck
pnpm --filter @legacy-crafts/medusa seed
```

- Typecheck green after removing the generator.
- Seed removed 223 `catalog-trophy-*` rows and left 10 catalog products, including
  four trophies: Crystal Star Award, Champion Metal Cup, Acrylic Award Plaque,
  Engraved Wooden Plaque. Medusa `/health` is ok; store API `count=10`.
- Shop: `http://localhost:3000/shop` — add a trophy, cart, checkout.
