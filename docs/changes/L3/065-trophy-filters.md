# 065 — Trophy listing filters

- Date: 2026-11-23 · Branch: current · Status: shipped
- Layer-2 anchor: WP-104

## Context / why

On `/trophies`, choosing Price: High to Low sent `order=-variants.calculated_price` to the store API. Medusa responds 500. The page then cleared the product array and rendered "No products in this category yet", while the counter still said "0 of 4 products" because the earlier Corporate fetch had set the count.

## Decisions made (and alternatives rejected)

- Do not order the store request by calculated price. Fetch with `-created_at` and sort the loaded page in `sortProducts`. The catalogue fits in one page (24), so the client order matches the list the user sees.
- Map filter names onto catalogue metadata: Metal includes brass. An exact rename of every product to "Metal" would hide the cast material.
- When products were loaded and the price or material filter removes all of them, say "No products match these filters."

## Changes (file → what)

- `apps/storefront/src/lib/category-config.ts` — price sort options no longer send `variants.calculated_price`
- `apps/storefront/src/lib/product-filters.ts` — `sortProducts`, material aliases
- `apps/storefront/src/components/features/catalog/category-page-client.tsx` — client price sort and the filter empty state
- `apps/storefront/src/components/features/shop/shop-client.tsx` — same price sort
- `apps/storefront/src/lib/product-filters.test.ts` — brass → Metal and price order

## Gotchas for future work

- Client price sort only orders the products already fetched. A catalogue larger than `PAGE_SIZE` would need a real server order.
- Corporate + Crystal + Under ₹5,000 is an empty set on purpose: the only corporate crystal is Excellence Crystal at ₹17,850. Every seeded trophy is above ₹5,000.

## Verification (commands + evidence)

- `GET /store/products?order=-variants.calculated_price` → 500. `order=-created_at` with the Corporate category id → 4 products, prices ₹15,300–₹20,400, materials brass ×3 and crystal ₹17,850.
- `pnpm --filter @trophy-heaven/storefront exec vitest run src/lib/product-filters.test.ts` — 14 passed.
