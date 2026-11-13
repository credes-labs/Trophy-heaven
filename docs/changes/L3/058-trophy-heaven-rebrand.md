# 058 - Trophy Heaven rebrand: trophy-only fork of Legacy Crafts

- Date: 2026-11-13
- Layer-2 anchor: WP-87

## Change
This repository was forked from Legacy Crafts (trophies + furniture + artwork/home decor).
Trophy Heaven sells trophies only. Every Legacy Crafts brand trace and every furniture,
artwork/home-decor and sculpture ("showpiece") product, route, copy line and image was
removed or re-pointed at trophies. Trophy features (catalog, design studio, plaque
configurator incl. customer "artwork" placement, corporate/bulk, checkout) are unchanged.
No components were deleted; components that showed furniture now show trophies.

## Brand
- `@legacy-crafts/*` package scope → `@trophy-heaven/*` (all imports, tsconfigs, lockfile).
- "Legacy Crafts" → "Trophy Heaven" in metadata, JSON-LD, PWA manifest, service worker,
  OG image, emails (Resend/MSG91), seeds, docker-compose, CI, env templates, scripts.
- Local DB name `legacy_crafts` → `trophy_heaven` (docker-compose, `.env.example`, CI,
  `apps/medusa/.env.template`). Existing local databases need a new DB or an env override.
- Domains/mailboxes `legacycrafts.*` → `trophyheaven.*` (placeholders — confirm real domain).
- SKU / order label / fallback tracking prefix `LC` → `TH`; promo `LEGACY500` → `HEAVEN500`,
  campaign `trophy-heaven-offers`. Blog author default via new migration
  `Migration20261113120000` (also rewrites existing "Legacy Crafts" bylines).
- Interim logo: live-text "T" monogram + Playfair "Trophy Heaven" wordmark (`layout/logo.tsx`,
  `hero/hero-wordmark.tsx`, `hero/hero-crest.tsx`, footer wordmark). App icons regenerated as a
  gold "T" on walnut. Legacy wordmark/crest SVGs and campaign JPEGs (which carry the Legacy
  monogram) deleted. Replace with the supplied assets when they arrive.

## Furniture / artwork removal
- Routes `/furniture`, `/artwork` deleted; `next.config.ts` 308s them (and
  `/categories/furniture/*`, `/categories/home-decor/*`) to `/trophies`.
- `CategoryKey` is now only `"trophies"`; furniture/artwork accents, tokens and
  button/badge variants removed.
- Seed: furniture-collection.ts and sculpture-collection.ts deleted; their 16 handles added to
  `RETIRED_SAMPLE_HANDLES`; Furniture/Tables/Home Decor/Sculptures categories are deleted on
  re-seed (`RETIRED_CATEGORY_NAMES`).
- Homepage: product rail, category stage (Awards/Plaques/Corporate), explore grid, materials
  (crystal, brass, walnut, marble, acrylic, gold leaf), disciplines/featured/showcase,
  testimonials, hero copy and imagery now trophy-only. Table and sculpture 3D builders removed.
- Shop silhouette mosaic: furniture/vase/sculpture meshes replaced by trophy meshes
  (cup, urn, medal, star, plaque, crystal, globe, bowl + existing figure/oscar).
- `ChairSheet` → `TrophySheet` (lidded trophy cup technical drawing) on auth pages and
  press/careers heroes.
- Nav, mega-menu, footer, sitemap(s), about, shop, contact, guides, gift cards, trade,
  shipping, search, cart copy updated. 60 non-trophy image and brand files deleted; manifest pruned.
- e2e specs moved from retired handles (`oak-side-table`, `halo-walnut-shelf`,
  `brass-table-lamp`) to `achievement-statuette` / `ascent-figure-award`; smoke test covers
  the `/furniture` and `/artwork` redirects.

## Not changed
`docs/changes/` history (append-only). `.cursor/plans/` is the historical Legacy Crafts
build plan; a scope banner was added to `00-master-plan.md` instead of rewriting it.

## Verification
- Root lint: 0 errors (7 pre-existing warnings). Root typecheck passed.
- Unit tests: storefront 112, schemas 18, Medusa 44 (Medusa via the documented Windows
  TEST_TYPE workaround).
- Root `pnpm build` passed (storefront + Medusa backend/admin).
- Production storefront at 1440px in Chromium/SwiftShader: home hero, product rail,
  collections stage, materials, footer, /shop mosaic, /about, /account/login, /customize
  inspected; `/furniture` and `/artwork` land on `/trophies`; title
  "Trophy Heaven — Custom Trophies, Awards & Plaques"; no page errors. Medusa was not
  running, so backend-driven listings were empty and the seed changes were not executed
  against a database.
