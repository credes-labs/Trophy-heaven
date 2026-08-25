# 009 — Figma home about

- Date: 2026-08-24 · Branch: current · Status: in-progress
- Layer-2 anchor: WP-10

## Context / why

Second homepage section from the new Figma file (`temp/about.css` + two
ChatGPT stills). Sits directly under the 1440×874 hero. The previous
Pre-Figma home blocks (story, values, bestsellers, testimonials,
newsletter) were later removed from `/` in WP-12.

## Decisions made (and alternatives rejected)

- **rem/`em`, not px.** Figma px ÷ 16. From `lg` up, the section sets
  `font-size: min(1rem, 100vw / 90)` so `1em` is one Figma rem and the
  90em (1440) canvas fits any desktop width. Below `lg` it keeps the
  document rem and stacks — shrinking the whole 1440 layout on a phone
  made 54px type unreadable.
- **Assets copied out of `temp/`.** Portrait and atelier JPEGs live at
  `public/images/about/about-legacy-*`. Original 6–10 MB PNGs are not
  committed.
- **Play mark is decorative.** No video asset shipped; the frosted
  circle is `aria-hidden`.
- **Outfit, `#F2F1EF`, `#131111`.** Matches the Figma about frame, not
  the older Playfair/champagne story section.

## Changes (file → what)

| File | What |
|------|------|
| `components/sections/about/*` | Decomposed about: eyebrow, headline, stats, portrait, copy, atelier still |
| `components/sections/about-section.tsx` | Re-exports `AboutSection` |
| `app/page.tsx` | Renders about immediately after the hero |
| `public/images/about/about-legacy-*` | Portrait + atelier JPEGs |
| `public/images/manifest.json` | New asset descriptions |

## Gotchas for future work

- Do not size this section in px. `em` is relative to the section
  `font-size`; `rem` in the `clamp()` floors is relative to `html`.
- Overlay title “From Concept to Comfort” is `#F2F1EF` so glyphs that
  hang below the photo disappear into the section ground (Figma subtract).
- Crest/wordmark rules from L3/008 still apply to the hero above this.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — about files clean
- `pnpm --filter @legacy-crafts/storefront lint` — about files clean
