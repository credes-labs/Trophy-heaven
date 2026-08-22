# 005 — UX polish: shop, PDP, landing, cart

- Date: 2026-08-22 · Branch: `kimi` · Status: shipped
- Layer-2 anchor: WP-05

## Context / why

The remaining spec gaps from `.cursor/plans/pages/02–05`: richer shop filters,
category inline filters, PDP completeness, landing motion polish, and cart
cross-sell/mobile ergonomics.

## Decisions made (and alternatives rejected)

- **Client-side filtering over the fetched page** for in-stock/customizable/material/
  price on listings (consistent with the pre-existing material filter) — accurate
  server-side faceting belongs to Meilisearch work, which was out of scope. Header
  counts reflect the server total (documented behavior).
- **Rating filter skipped with a code comment** — `/store/reviews` aggregates per
  `product_id` only, and products carry no rating field; no faked data.
- **Shared filter helpers** (`lib/product-filters.ts` + tests) so shop and category
  pages can't drift.
- **Mobile filter sheet reuses `FilterSidebar`** instead of the duplicated accordion
  (single source of truth; accordion can be re-added as a wrapper later).
- **A11y-safe motion**: word-by-word headline keeps the full text in an `aria-label`
  with `aria-hidden` animated spans; parallax/Ken Burns/autoplay all respect
  `prefers-reduced-motion`.
- **Trophies story CTA** resolves the seeded Crystal Star Award by handle server-side
  → `/customize/[id]/2d` (product ids aren't stable across seeds, so the config keeps
  a documented `/shop?category=trophies&customizable=1` fallback).

## Changes (file → what)

- `components/ui/range-slider.tsx` (new) → dual-handle slider (keyboard, minGap).
- `features/shop/filter-sidebar.tsx`, `shop-client.tsx`, `(shop)/shop/page.tsx` →
  slider + 300ms debounce, subcategory nesting, in-stock/customizable toggles, real
  category counts, ItemList JSON-LD.
- `features/catalog/category-page-client.tsx` → Price buckets + Material filters,
  "X of Y" counts.
- `features/catalog/product-actions.tsx` → share, compare-price + `-X%` badge, EMI
  note (>₹5,000, tooltip), SKU line, OOS option states (dashed/disabled).
- `features/catalog/image-gallery.tsx` → 1.75× hover-zoom following the cursor,
  lightbox ArrowLeft/Right/Escape.
- `sections/hero-section.tsx` → parallax layer + Ken Burns + word reveal;
  `sections/brand-values.tsx` → gold ring draw-in; `sections/testimonials.tsx` →
  5s autoplay (pause on hover/focus), monogram avatars, +2 testimonials.
- `features/cart/cart-recommendations.tsx` (new), `(shop)/cart/page.tsx` →
  "Complete the look", empty-state "Popular right now", sticky mobile checkout bar
  above the mobile nav (`bottom: calc(4rem + safe-area)`).

## Gotchas for future work

- The sticky cart bar assumes MobileNav is `h-16/z-50` — revisit both together.
- `product-filters.ts` helpers are the only place price/stock/customizable logic
  should live — extend there, not in components.

## Verification

- 40 storefront tests (incl. new `product-filters.test.ts`), typecheck/lint green.
