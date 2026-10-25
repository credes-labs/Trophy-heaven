# 038 — Hero chair and sticky collection filters

- Date: 2026-10-25 · Branch: ashish/frontend-revamp · Status: shipped
- Layer-2 anchor: WP-47

## Context / why

The homepage hero was a full-bleed poster on `hero-legacy-studio.jpg`. Two new files landed in `public/images/hero`: an empty studio (`hero-legacy-studio.png`) and a walnut lounge chair on a black plate (`chair.png`). The chair needs to sit in front of the headline the way a product cutout sits in front of a wordmark, on the lower lines rather than across “Crafted with”. Separately, the Explore the collection filter column stayed put at the top of the product grid while the cards scrolled.

## Decisions made (and alternatives rejected)

- **Background is the new studio PNG.** `object-cover` with `object-[22%_center]` keeps the light shaft in frame on a portrait crop. The old JPEG stays on disk; the hero no longer points at it.
- **Chair plate keyed to alpha.** `chair.png` was RGB with a near-black surround and an enclosed black opening beside the back cushion. A flood fill (threshold 18) from the corners and from that opening, then a crop to the content, makes the file a 757×633 cutout. A CSS blend would have let the type show through the upholstery. The cutout is `next/image`, not `localizeImageUrl` (that helper is for backend URLs).
- **Chair sits on the lower lines.** Desktop: `top: 54%` of the headline band, `left: 30%`, width `min(38vw, 34rem)`, no upward translate. Phone: `bottom: 0` plus `translate-y: 3.5rem`, width `min(42vw, 11rem)`. Centering the chair (`top: 50%` and a large negative translate) covered “WITH” and “INTENTION.”
- **Nav and actions stay in front.** They are `z-30` siblings outside the headline band. The chair is `z-20` and `pointer-events-none` inside the band.
- **Sticky filters are the desktop sidebar only.** `lg:sticky lg:top-24 lg:self-start` on the wrapper around `ExploreFilters`, inside the grid row. The sticky box’s parent is that row, so it releases when the grid ends and does not follow the rest of the page. `top: 6rem` clears the site header. Below `lg` the wrapper is `display: none`; the existing bottom sheet is unchanged. Not `position: fixed`.

## Changes (file → what)

- `components/sections/hero/hero-background.tsx` — source is `/images/hero/hero-legacy-studio.png`.
- `components/sections/hero/hero-chair.tsx` — foreground cutout.
- `components/sections/hero/index.tsx` — chair inside the headline band; lighter scrim so the studio reads; nav and the action row at `z-30`.
- `components/sections/explore/index.tsx` — sticky desktop filter column.
- `public/images/hero/chair.png` — black plate keyed out and cropped.
- `public/images/manifest.json` — entries for the studio PNG and the chair cutout.

## Gotchas for future work

- Replacing `chair.png` with another black-plate render will paint a rectangle until it is keyed again. The side opening is not connected to the outer background, so a corner-only flood fill leaves a black window.
- `lg:top-[54%]` is relative to the headline band, which is the flex remainder between the nav and the action row. Changing that band’s height moves the chair.
- The sticky column’s containing block is the grid row (`lg:items-start`). Stretching that item to the row height makes sticky look idle. `overflow-x-clip` on the explore section did not stop the stick in Chrome; a new `overflow: hidden` ancestor would.
- Homepage does not mount the sticky site header. `top-24` is still the clearance for that header’s height (`py-4` + a 3rem wordmark).

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — pass.
- `eslint` on `hero-chair.tsx`, `hero-background.tsx`, `hero/index.tsx`, `explore/index.tsx` — pass.
- Browser at 1440×900: “Crafted with” ends at y 344 and the chair starts at y 394, so the first line is clear. The chair intersects “intention.” and “Built to last.” It does not intersect the nav (bottom 72), the caption (x 1102), or either action. Document scroll width 1430.
- Same viewport, Explore grid: filter `position` is sticky and its top is 96px while the row is on screen (scrollY 6606). At the section end (scrollY 8037) the filter top is −326px.
- At 390×844: first line clear, lower two lines overlapped, chair right edge 370, scroll width 390, filter column `display: none`. Device-metrics emulation cleared.
