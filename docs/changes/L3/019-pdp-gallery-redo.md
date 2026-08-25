# 019 — Product page gallery and layout redo

- Date: 2026-08-25 · Branch: feat/shop-page-layout · Status: in-progress
- Layer-2 anchor: WP-21

## Context / why

The first PDP pass (WP-19 / L3 018) followed the screenshot regions but
Tailwind arbitrary grids and a single-image catalog hid thumbs/arrows. Two
screenshot refs remain placement-only; chrome stays homepage Outfit/cream.

## Decisions made (and alternatives rejected)

- **Layout in `pdp.css`**, imported by the page and `image-gallery.tsx`, so
  well/thumbs/arrows survive a stale Turbopack CSS chunk.
- **Reuse existing product JPEGs** for extra gallery frames (no new photography).
- **Champion Metal Cup** and **Oak Side Table** get three images each in seed
  (create path + a backfill that skips SKUs already at that count).
- Keep LC header/footer, option pills, login-gated reviews. Do not copy
  Drexel/Delphinos nav, Google+, or Magento selects.

## Changes (file → what)

| File | What |
|------|------|
| `products/[handle]/pdp.css` | Local hero/gallery/buy/tabs/reviews/related rules |
| `image-gallery.tsx` | Square well, overlay ‹ ›, `01/03` counter, thumbs under well |
| `product-actions.tsx` / `product-tabs.tsx` / `product-reviews.tsx` / `related-products.tsx` | Outfit/cream structure aligned to screenshot order |
| `apps/medusa/src/scripts/seed.ts` | 3 images on Champion Metal Cup + Oak Side Table |

## Gotchas for future work

- Gallery arrows/thumbs only render when `list.length > 1`.
- Reviews store API is 5/min — bursts look like a load failure.
- Do not restyle `/shop`.

## Verification (commands + evidence)

- Live `/products/champion-metal-cup`: Home / Sports / title; well; ‹ ›; thumbs
  1–3; clicking thumb 2 sets counter to **02 / 03**.
- `pnpm --filter @legacy-crafts/storefront typecheck`
