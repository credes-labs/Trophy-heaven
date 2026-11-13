# 049 - New photography: hero, sculpture collection, campaign set

- Date: 2026-10-29 · Branch: ashish/frontend-revamp · Status: shipped
- Layer-2 anchor: WP-70

## Context / why

The user dropped 26 photographs into `public/images` (hero, brand, catalog) and asked for
each to be placed where it belongs, hero first. All 26 arrived with a doubled extension
(`.jpg.jpeg`), two were byte-identical, and none were registered in the imagery manifest.

Every image was reviewed before placement. They fall into three groups that need three
different treatments:

1. **One clean hero frame** - brass pedestal nesting tables, boucle sofa at the left edge,
   navy textured wall across the right third. No baked-in type.
2. **Six campaign creatives** - 4:5 crops with the LC crest and a tagline already set in
   the pixels ("For homes. Comfort that endures.", "For hospitality. A lasting first
   impression.", "For offices. Design that supports focus.", "Every legacy begins with a
   win.", "Make the Achievement Worth Remembering", "Legacy Crafts. Furniture for every
   space.").
3. **Twelve sculptures, eighteen frames** - tabletop objets (verdigris loop, pierced
   bronze disc, split rib, sunburst, gilt burst, reef totem, verdigris wave, ripple disc,
   interlocking rings, fluted oval, obsidian totem, verdigris wreath). Four frames belong
   to the pierced disc, three to the loop, two to the reef totem.

## Decisions made (and alternatives rejected)

- **The hero photo is mirrored.** It is the only full-bleed frame `public/images` has
  that is already art-directed. Its lit furniture sits right and its empty navy wall
  sits left, which is the poster order in `docs/design/figma-home-hero.png` (copy left,
  subject right) - but the raw file has them the other way round, with the sofa exactly
  where the headline goes. `-scale-x-100` puts the quiet wall behind the headline without
  touching the asset. Rejected: cropping to the right wall (`object-position`), which
  loses the furniture at mobile widths where the crop is severe.
- **The chair cutout is gone from the hero.** `HeroChair` was composited over the old
  empty-studio background. The new photograph already contains upholstered furniture on
  the same axis, so the cutout would read as a second, floating sofa. `hero-chair.tsx`
  and `chair.png` are left in the repo, unreferenced, so the treatment can be restored;
  the manifest entry stays.
- **Campaign creatives are not mounted on the site.** They are finished ad units, not
  page imagery: the tagline and crest are in the pixels, so any page text over them
  doubles the copy, and at a third of a grid width the baked type is unreadable. They
  move to `public/images/campaign/` (out of `brand/`, which holds the wordmark and crest
  SVGs) and are registered for social/paid use. Rejected: a three-up "who we furnish"
  homepage strip, for the unreadable-at-1/3-width reason.
- **The 18 catalog frames become 12 SKUs, not tiles.** They are product photography with
  consistent staging, so they belong in the catalogue. Variant frames of one object are
  grouped as that product's gallery rather than split into separate products.
- **Prices follow the existing rule.** `homepage-furniture.ts` treats the listed figure as
  USD and prices INR at x85; the sculpture collection does the same, so the two module
  families stay comparable in the admin.

## Changes (file -> what)

- `public/images/hero/Legacy Crafts - For Hero Section.jpg.jpeg` ->
  `hero/hero-legacy-tables.jpg`.
- `public/images/brand/*.jpeg` -> `public/images/campaign/*.jpg` (six slugs, one duplicate
  `furniture .jpeg` deleted after a SHA256 match with `furniture for every space.jpeg`).
  `brand/` keeps `legacy-wordmark.svg` and `legacy-crest.svg`.
- `public/images/catalog/*.jpg.jpeg` -> seventeen `sculpture-*.jpg` slugs.
- `public/images/manifest.json` - 25 new entries (hero, 6 campaign, 18 sculpture), 69 total.
- `components/sections/hero/hero-background.tsx` - new source, `object-center`,
  `-scale-x-100`.
- `components/sections/hero/index.tsx` - `HeroChair` unmounted; second, left-anchored
  scrim added so the headline keeps AA contrast against the photograph.
- `apps/medusa/src/scripts/sculpture-collection.ts` (new) - the 12 products, galleries,
  USD/INR prices and `Deco` SKUs.
- `apps/medusa/src/scripts/seed.ts` - imports the collection, adds `Sculptures` under
  Home Decor, and backfills that subcategory on already-seeded databases (the existing
  category block is gated on a fresh DB, so a new leaf would otherwise never appear).

## Gotchas for future work

- `localizeImageUrl()` already lists `/images/catalog/`, so seeded
  `http://localhost:3000/...` URLs localise correctly; `/images/campaign/` is deliberately
  absent because nothing renders a campaign creative through `next/image` yet. Add it to
  `LOCAL_IMAGE_PREFIXES` if one is ever mounted from backend data.
- The sculpture sources are 3-4 MB each. `scripts/optimize-images.ps1` is lossless-only by
  policy (see L3/014), so the repo weight is real; Next serves optimised widths at runtime.
  Re-exporting at a sane pixel size is the fix, not lossy compression.
- The seed creates products only when the title *and* handle are both new, so re-running it
  is safe; it will not update a sculpture's price or gallery after the first insert.

## Verification (commands + evidence)

- `pnpm typecheck` - clean (schemas built first, then all 5 packages).
- `pnpm lint` - 0 errors; the 6 warnings are pre-existing.
- `pnpm test` - storefront vitest 103/103, schemas 18/18; medusa jest 44/44 when run with
  `$env:TEST_TYPE="unit"` (the package script's POSIX env syntax fails on Windows).
- `pnpm build` - storefront and medusa both build.
- `GET localhost:3000` returns 200 and references `hero-legacy-tables.jpg`;
  `/_next/image` returns 200 `image/jpeg` for the hero, a sculpture and a campaign frame.
- Not verified: the seeded products in a live database (no Medusa instance was running),
  and the composed hero on screen (no browser was attached to the session).
