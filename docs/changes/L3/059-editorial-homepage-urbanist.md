# 059 - Editorial poster homepage, trophy cut-outs, Urbanist (WP-88)

## Why
The owner supplied a furniture-store reference (white poster hero, oversized
lowercase wordmark with products standing in front, grey product tiles,
"Selected Editions") and asked for the same layout for trophies, with
background-removed trophies and the reference typography everywhere.

## Changes (file → what)
- `public/images/cutouts/{figure-award,statuette,plaque}.webp` → transparent cut-outs of the three catalog photos.
- `sections/hero/index.tsx` → new white poster hero; `hero-top-bar.tsx` new; `constants.ts` adds HERO_TAGLINE/FEATURES/TOP_*/TROPHIES. The old dark-poster pieces (hero-background, hero-copy, hero-cta, hero-nav, hero-chair, hero-products, hero-crest) are no longer rendered but kept.
- `sections/editions/{constants,categories,selected-editions}.tsx` → categories row and the filterable editions grid (data from EXPLORE_PRODUCTS).
- `app/page.tsx` → hero, categories, editions, then recent work, about, materials, collections stage, signup.
- `app/layout.tsx`, `app/globals.css`, `products/[handle]/pdp.css` → Urbanist as the only site face.
- `layout/site-chrome.tsx` → mobile home header always ink, white blur once past the hero.
- `layout/site-nav/site-nav.tsx` → nav caps tracking 0.14em → 0.04em to match the reference.

## Gotchas for future work
- Wordmark fit is tuned by font size (16.4vw mobile, min(17.2vw, 276px) desktop) and was measured at 1440px and 390px; changing the text or tracking needs a re-measure.
- "trophy heaven" has descenders (p, y), unlike the reference wordmark, so the feature-label row sits 3.4vw below it.
- Cut-outs: background removal ran locally (@imgly/background-removal-node, ISNet "medium"); its sharp clashes with the repo's sharp in one process, so prep/cut/trim ran as separate processes. The statuette needed its tabletop residue masked and its plinth alpha forced opaque. It is only 314x772 (source 1000px) — replace with a higher-resolution photo when available.
- The plaque cut-out is a crop of a configurator render, not a photograph.
- Engraving fonts depend on `--font-playfair`/`--font-inter`; do not drop those next/font loaders.

## Verification (commands + evidence)
```
pnpm lint        # 0 errors (pre-existing warnings only)
pnpm typecheck   # pass
pnpm --filter @trophy-heaven/storefront exec vitest run   # 112 passed
pnpm schemas:test                                          # 18 passed
pnpm --filter @trophy-heaven/storefront build              # pass
Chromium 1440x900 + 390x844 on next start: wordmark text width 1386/1392 and 358/358 px, Urbanist computed, 0 page errors; /about, /trophies, /blog screenshots render in Urbanist.
```
Medusa unit tests were not re-run (no Medusa changes); the root `pnpm test` stops at the known Windows TEST_TYPE issue.
