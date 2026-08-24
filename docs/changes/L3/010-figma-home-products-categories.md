# 010 — Figma home products & categories

- Date: 2026-08-24 · Branch: current · Status: in-progress
- Layer-2 anchor: WP-11

## Context / why

Third homepage section from the new Figma file (`temp/products&categories.css`
+ ChatGPT stills in `temp/`). Sits under About. Replaces the previous
`CategoryShowcase` + `FeaturedProducts` pair on `/` only; those components
stay on disk for other pages.

## Decisions made (and alternatives rejected)

- **Drag is real, and the badge is the cursor.** The frosted “drag me”
  circle is `pointer-events-none`. On desktop it magnetically follows the
  pointer (spring) and hides the native cursor; on drag it scales down and
  cards compress slightly. Release projects velocity and snaps to card
  width. Arrow keys still nudge. Tab changes fade the rail and reset `x`.
- **Category list is the scroller.** All five names stay visible. Hover/focus
  springs the row (4.25em / opacity 1 vs 3.5em / 0.4). Wheel on the stage
  cycles the index (`preventDefault` via a non-passive listener) and the
  polaroids overlap with direction-aware enter/exit + a Ken Burns settle.
  First click/hover previews; a second click on the active name navigates.
  Default active row is Bedroom. At the ends, wheel is not captured.
- **rem/`em`, not px.** Same recipe as about: Figma px ÷ 16; from `lg`,
  `font-size: min(1rem, 100vw / 90)`.
- **Assets copied out of `temp/`.** Six JPEGs at `public/images/catalog/`.
  Outdoor/Bedroom reuse dining/lounge stills — no extra ChatGPT frames.

## Changes (file → what)

| File | What |
|------|------|
| `components/sections/products-categories/*` | Tabs, drag rail, polaroid category stage |
| `components/sections/products-categories-section.tsx` | Re-exports `ProductsCategoriesSection` |
| `app/page.tsx` | Renders the section after about; drops old showcase + featured grid |
| `public/images/catalog/*` | Six ChatGPT stills |
| `public/images/manifest.json` | New asset descriptions |

## Gotchas for future work

- Do not size this section in px. `em` follows the section `font-size`.
- `CategoryShowcase` and `FeaturedProducts` are unused on `/` but still
  imported elsewhere — do not delete them as part of this frame.
- Wheel capture is only while the pointer is over the category stage, and
  only while another category remains in that scroll direction.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck`
- `pnpm --filter @legacy-crafts/storefront lint`
- Browser: drag rail, tab switch, category hover/wheel, polaroid swap
