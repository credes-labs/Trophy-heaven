# 044 — Catalogue hero: turning silhouette grid

- Date: 2026-10-26 · Branch: ashish/frontend-revamp · Status: shipped
- Layer-2 anchor: WP-64

## Context / why

The `/shop` hero was a two-slide editorial feature: a product name, a “Shop this
product” link, a large photograph, and `01 / 02` controls. The user asked for that
block to be replaced, on the catalogue page, by the supplied `SilhouetteGrid`
component: a landscape mosaic of thin-lined boxes, each holding a procedural
furniture piece turning on a turntable. The grid had to sit on the catalogue's own
surface colour rather than introducing a new background.

## Decisions made (and alternatives rejected)

- **The grid replaces the hero, not the listing.** `ShopHero` is no longer mounted
  in `ShopClient`. The hero slot (`.shop-page-hero`) and its fold behaviour are
  kept, so opening filters still collapses the band to zero height.
- **Component kept as supplied.** The engine, cell map, models, shading, camera
  pitch, 7s period, and reduced-motion behaviour are unchanged. The only edit is
  a type-safe ref filter (`.filter((el): el is HTMLDivElement => el != null)`) so
  the supplied `as HTMLElement[]` assertion does not fail strict TypeScript.
- **Surface colour is explicit.** `SilhouetteHero` paints `#F2F1EF`, the same
  surface as `.shop-page` and the rest of the catalogue chrome. The component stays
  transparent, so only the hairlines and silhouettes read. Grid ink is `#131111`
  (brand ink), not the component's near-black default.
- **Default 2 / 1 band.** The component's own aspect is kept. At the 90em content
  width it renders 1360 × 680.5; at 390px it renders 350 × 175.5.
- **Three.js is split out.** `silhouette-hero.tsx` loads the grid with
  `next/dynamic` and `ssr: false`, keeping `three` out of the initial catalogue
  chunk. The server-rendered state is the aspect-ratio placeholder, so there is no
  hydration mismatch and no layout shift.
- **A real heading remains.** The old hero held the page's only visible `<h1>`.
  The filter banner's heading is hidden while filters are closed, so `ShopClient`
  now renders `<h1 className="sr-only">Shop all products</h1>` outside the
  collapsible hero. The hero itself is `aria-hidden` when filters open.
- **Old hero file left in place.** `shop-hero.tsx` and `SHOP_FEATURED_FALLBACK` are
  no longer referenced. They are kept for a possible revert; no other route uses
  them.

## Changes (file → what)

- `apps/storefront/src/components/features/shop/silhouette-grid.tsx` — new. The
  supplied component and engine: 15 cells on a 12-column / 6-row grid, one WebGL
  renderer, scissored viewports, procedural furniture, transparent canvas.
- `apps/storefront/src/components/features/shop/silhouette-hero.tsx` — new. The
  `#F2F1EF` section, 90em content width, dynamic `ssr: false` loader, `ink="#131111"`.
- `apps/storefront/src/components/features/shop/shop-client.tsx` — swaps the
  `ShopHero` import/usage for `SilhouetteHero`; adds the sr-only `h1`.
- `apps/storefront/src/lib/configurator/engrave.ts` — return type narrowed to
  `Uint8ClampedArray<ArrayBuffer>`. This is a type-only fix for a latent TS 5.9.3
  failure at `new ImageData(out, …)`; runtime behaviour is unchanged.

## Gotchas for future work

- `silhouette-grid.tsx` imports `three` and touches `window`, so it must stay a
  client chunk. Import it through `silhouette-hero.tsx` (or another
  `next/dynamic` loader), not directly from a Server Component.
- The band's height comes from `aspect`. Changing it re-fits every model; do not
  add a fixed height to the wrapper or the scissor viewports will disagree with
  the cells.
- `.shop-page-hero` collapses to `0fr` in filter mode. The grid's `ResizeObserver`
  recalculates on re-expand; do not give the wrapper `overflow: visible`.
- In React StrictMode the effect mounts twice in dev. Each mount disposes its
  renderer and cell geometries; the shared `INK` material is module-level and is
  intentionally not disposed with a renderer.
- Reduced motion freezes the turntable at 0.6 rad instead of running the 7s loop.
- Grid ink `#131111` on `#F2F1EF` is the AA-safe pairing. Do not switch to
  `text-gold`/`#B89E6B` for these hairlines.
- `shop-hero.tsx` is now unused. If the carousel is not restored, delete it and
  `SHOP_FEATURED_FALLBACK` together.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — clean.
- `pnpm --filter @legacy-crafts/storefront lint` — 0 errors, 1 pre-existing warning
  (`dropdown-menu.tsx` unused `focusIndex`).
- `pnpm --filter @legacy-crafts/storefront test` — 95/95 passed (20 files).
- Playwright 1.62.1, Chromium 151 headless (SwiftShader WebGL), `localhost:3000/shop`:
  - Desktop 1440×1000: grid box 1360 × 680.5, canvas 1359 × 679.5, `h1` =
    “Shop all products”, zero console/page errors.
  - Mobile 390×844: grid box 350 × 175.5, zero errors, no sideways scroll.
  - Filter open: `.shop-page-hero` height `0` after the fold; no errors.
  - Screenshots reviewed: grid lines, all 15 silhouettes, header clearance, and
    the `#F2F1EF` surface match the rest of the catalogue.
