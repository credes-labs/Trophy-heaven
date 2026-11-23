# 066 — Shop filter count and category price sort

- Date: 2026-11-23 · Branch: current · Status: shipped
- Layer-2 anchor: WP-105

## Context / why

A pass over the public filters, search, and forms. Two listing bugs remained after the trophies-page price-sort fix.

## Decisions made (and alternatives rejected)

- When the shop narrows with material, price, stock, or customizable, fetch up to 100 products and set the toolbar count to the filtered length. The store API count ignores those filters.
- On `/categories/[...slug]`, keep the sort control values but do not send `variants.calculated_price` to Medusa. Sort that page with `sortProducts`.

## Changes (file → what)

- `apps/storefront/src/components/features/shop/shop-client.tsx` — filtered count
- `apps/storefront/src/app/(shop)/categories/[...slug]/page.tsx` — safe price sort

## What was exercised

- `/trophies`: Metal 6 of 9, Crystal 2 (Palace, Excellence), Wood, price buckets, price high-to-low order, Corporate / Memorial / Sports.
- `/shop`: Metal sorted high to low; minimum ₹18,000 shows Palace Crystal, Pedestal Cup, Ascent Figure Award and "1–3 of 3".
- `/search`: 9 with an empty query, plaque → 1, nonsense → 0, crystal → 2, a facet narrows to 1.
- Forms that returned confirmation: contact, corporate quote, returns, homepage email signup.
- FAQ category buttons and the "nothing matches" empty search.

## Gotchas for future work

- Track order still does not look the number up. It tells guests to email the studio. There is no guest order-status API.
- Every seeded trophy is above ₹5,000, so Under ₹5,000 is an empty filter on purpose.
