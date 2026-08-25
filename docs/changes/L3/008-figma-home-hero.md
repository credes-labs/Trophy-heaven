# 008 — Figma home hero

- Date: 2026-08-23 · Branch: current · Status: in-progress
- Layer-2 anchor: WP-09

## Context / why

First homepage section from the new Figma file. Runtime assets live under
`apps/storefront/public/images/{hero,brand}/`. The visual comp is
`docs/design/figma-home-hero.png` (never used as an `<img>`). The previous hero
was a Ken Burns carousel (“Crafted to Last.”) that does not match the 1440×874
black studio composition.

## Decisions made (and alternatives rejected)

- **1440 artboard + scale** above `lg`, stacked reflow below. Scaling the whole
  canvas below ~1024px made type unreadable; a separate mobile composition keeps
  every element without shrinking to 0.27×.
- **`Vector.svg` is the header wordmark** (top-left, 168×69). The JSON also has
  Outfit 66px “legacy” in Frame 2147239204 — treated as the same logo slot.
- **`Vector (1).svg` is the 1377×682 crest with the left half clipped** by the
  1440 frame (export is 688×682, `viewBox="0 0 688 682"`). Keep that cut — it
  overlaps the studio photo. Mix-blend is on the HTML `<img>` so it composites
  with the photo (SVG-internal blend does not).
- **Global header off on `/`.** The Figma hero includes Collection / Catalog /
  search / cart. Showing `Header` + announcement bar would double the chrome.
  Other routes keep the existing sticky header.
- **Outfit for this section only.** Site-wide Playfair/Inter brand contract is
  unchanged; `--font-outfit` is an additive token.

## Changes (file → what)

| File | What |
|------|------|
| `apps/storefront/src/components/sections/hero/*` | Decomposed hero: studio image, watermark, crest, nav, products, copy/CTA |
| `apps/storefront/src/components/sections/hero-section.tsx` | Re-exports the new `HeroSection` |
| `apps/storefront/src/components/layout/site-chrome.tsx` | Hides announcement + header on `/` |
| `apps/storefront/src/app/layout.tsx` | Outfit font variable; `SiteChrome` |
| `apps/storefront/src/app/globals.css` | `--font-outfit` token |
| `apps/storefront/public/images/hero/hero-legacy-*` | Studio JPG + chair/sideboard PNGs |
| `apps/storefront/public/images/brand/legacy-*.svg` | Wordmark + full-width crest |
| `apps/storefront/public/images/manifest.json` | New asset descriptions |

## Gotchas for future work

- Figma JSON had no x/y; `docs/design/figma-home-hero.png` is the visual source
  of truth (never used as an `<img>`). Layout is coded: 2-col nav, copy left,
  chair in the studio photo on the right, thumbs bottom-left, CTA bottom-right.
  `temp/` is disposable — do not re-read it.
- Do not use `min(1, 100vw / 1440)` for height — `100vw / 1440` is a length,
  `1` is unitless, the calc is invalid and the hero collapses to 0px.
- All six nav TEXT nodes exported as 133×25 — that is a plugin default, not
  visual width. Nav items hug text.
- Homepage e2e “Search” link is now the hero overlay `search` text, not the
  header icon. Case-insensitive role match still works.
- Crest SVG must keep the Figma left clip (`viewBox="0 0 688 682"`). Expanding
  it to 1377px draws a vertical seam through the hero.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront lint` — 0 errors (1 pre-existing warning in `dropdown-menu.tsx`)
- `pnpm --filter @legacy-crafts/storefront typecheck` — hero files clean; existing `marked` module error in `blog/[slug]/page.tsx` is unrelated
