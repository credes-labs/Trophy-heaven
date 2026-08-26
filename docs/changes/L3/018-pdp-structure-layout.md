# 018 — Product page structure layout

- Date: 2026-08-25 · Branch: feat/shop-page-layout · Status: in-progress
- Layer-2 anchor: WP-19

## Context / why

Shop browse/filter is done (WP-18). Two PDP screenshots were structure
references only: full-width slash breadcrumb, ~55/45 gallery | buy,
square grey image well with thumbs, centered info tabs, reviews as
list | form, 4-up related. Fonts, color, and components stay the
homepage / shop Outfit cream system — not the demo-theme chrome.

## Decisions made (and alternatives rejected)

- **Header and footer stay Legacy Crafts.** References were placement,
  not Drexel/Delphinos nav, Google+, compare, or FREE SHIPPING strips.
- **Cream `max-w-[90em]` shell** matching `/shop`, including
  `lg:[font-size:min(1rem,calc(100vw/90))]`.
- **Slash breadcrumb** like `ShopListingBreadcrumb` (Home / Category /
  Title), not chevron `Breadcrumb` UI.
- **Gallery is a square `#D9D9D9` well** with `object-contain` padding,
  side ‹ ›, `01 / 02` counter, up to five thumbs. Keep lightbox + hover
  zoom. Rejected Magento dropdowns for options — keep LC pills.
- **Buy column order:** uppercase title → stars + `#reviews` link →
  2–3 line excerpt → large price → OPTIONS hairline + pills → qty |
  walnut ATC | square heart. Customize, LC share, trust bullets, sticky
  ATC stay.
- **Tabs on a light wash**, centered uppercase triggers, walnut
  underline. Reviews: list left, login-gated form right (no guest
  Name/Email fields).
- **Related uses `EditorialProductCard`** in 4 columns + “See all
  {category}”. Rejected a 5-col BACK|NEXT carousel.

## Changes (file → what)

| File | What |
|------|------|
| `app/(shop)/products/[handle]/page.tsx` | Cream shell, slash breadcrumb, 11/9 grid, excerpt, rating → `#reviews` |
| `image-gallery.tsx` | Square well, side arrows, counter, 5 thumbs |
| `product-actions.tsx` | Price → options → qty/ATC/heart; walnut fill ATC |
| `product-tabs.tsx` | Full-bleed tab band; hash opens Reviews |
| `product-reviews.tsx` | Two-column list \| form |
| `related-products.tsx` | 4-col editorial tiles |
| `sticky-atc.tsx` / `share-buttons.tsx` | Walnut / Outfit chrome |

## Gotchas for future work

- `#reviews` lives on the tabs wrapper so the target exists even when
  the Reviews panel is unmounted.
- The gallery | buy split is `.pdp-hero` in `products/[handle]/pdp.css`
  (imported by the page) so it is not lost if the shared Turbopack CSS
  chunk is stale. Do not rely on Tailwind `lg:grid-cols-[…]` here.
- Do not copy demo-theme utilities (LOGIN bar, product-tags tab,
  compare, Google+) onto this page.
- Shop browse/filter (WP-18) is separate — do not restyle `/shop` here.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck`
- `pnpm --filter @legacy-crafts/storefront lint`
- Browser: `/products/{handle}` gallery, options, ATC, tabs, reviews,
  related
