# 034 — Homepage hero poster

- Date: 2026-10-25 · Branch: `main` · Status: shipped
- Layer-2 anchor: WP-37

## Context / why

The homepage hero stacked a tall two-column nav over a modest headline. The reference is a full-bleed poster: a quiet header, a huge stacked headline on the photograph, and a short caption with one white pill on the lower right. Copy and images stay the ones already in the storefront. The lower stats band in the reference is out of scope.

## Decisions made (and alternatives rejected)

- **Same words, poster scale.** The headline is `BRAND.tagline` ("Crafted with intention. Built to last.") broken into three explicit lines so the wrap does not depend on container width. Outfit stays; no new font.
- **One nav row, shared with inner pages.** `SiteNav` is the homepage overlay and the sticky header. Two stacked columns of 20px labels were eating the poster, so both surfaces are now wordmark, links, search, and cart on one line. Flyouts are unchanged. The breakpoint stays `lg`.
- **Announcement and sticky header stay off `/`.** The poster is `100svh`. A strip above it pushed the pill below the fold. Inner pages still show both.
- **Same photographs.** Studio JPEG, chair still, and sideboard still. `object-[42%_center]` crops the source's top-right monogram so it does not sit under Cart. Product frames are smaller and sit bottom-left. The mix-blend crest is no longer mounted; `hero-crest.tsx` remains unused.
- **One white pill, second action as a text link.** "Design a trophy" is the pill. "Browse the collection" is the underline link under it. Dark chrome uses a `#F2F1EF` focus ring with `outline-solid`, because the global ink outline disappears on `#1C1612`.
- **Scrim stays.** A top-to-bottom `#1C1612` gradient keeps the white type readable on the armchair.

## Changes (file → what)

- `components/sections/hero/index.tsx` — full-bleed column: nav, headline, then frames left and caption/CTA right.
- `hero-copy.tsx` — `HeroHeadline` and `HeroAside`. The old combined copy block is gone.
- `hero-cta.tsx` — white pill plus text link. No dot pill.
- `hero-products.tsx` — smaller white frames, same images and alts.
- `hero-wordmark.tsx` — smaller mark; accepts `className`.
- `hero-background.tsx` — crop shifted to `object-[42%_center]`.
- `hero/constants.ts` — `HERO_HEADLINE_LINES`.
- `layout/site-nav/site-nav.tsx` — single horizontal row. Mobile drawer unchanged aside from focus rings.
- `layout/site-header.tsx` — tighter padding on the sticky bar.
- `layout/site-chrome.tsx` — announcement hidden on `/` along with the sticky header.

## Gotchas for future work

- `HERO_HEADLINE_LINES` must stay the same words as `BRAND.tagline`. Do not invent a new headline here.
- Swapping the studio photo later: the monogram crop is `object-[42%_center]`. A new file without that mark can move back toward center.
- `SiteNav` is shared. A homepage-only nav treatment will also change `/shop` and every other inner page.
- Eight tracked labels plus the wordmark are tight near `lg` (1024px). Do not raise the label size without checking that width.
- `focus-visible:outline-2` on this dark chrome needs `focus-visible:outline-solid`. See L3/033.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — pass.
- `pnpm --filter @legacy-crafts/storefront lint` — pass, with the existing unused `focusIndex` warning in `dropdown-menu.tsx`.
- `pnpm --filter @legacy-crafts/storefront test` — 64 passed.
- `pnpm --filter @legacy-crafts/storefront build` — Next.js 16.3 compiled and generated all 50 routes.
- Browser at 1440×900: headline, single-row nav, frames, caption, and both actions sit inside the first screen. The source monogram is cropped out. At 390×844 the menu button shows, the headline fits (267px in a 390px width), and the text link ends above the fold (`bottom` 824 of 844).
