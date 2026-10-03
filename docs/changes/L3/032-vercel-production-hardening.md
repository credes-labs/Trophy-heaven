# 032 — Vercel production hardening for revised storefront

- Date: 2026-10-03 · Branch: main · Status: shipping
- Layer-2 anchor: WP-35

## Context / why

Prior production at `https://legacy-crafts.vercel.app` was serving a soft 404 on `/`
with JSON-LD / OG URLs pointing at `http://localhost:3000`. Catalog/nav helpers
threw when Medusa was unreachable, and `vercel.json` lacked a monorepo
`installCommand`. The revised homepage + sitemap routes needed a clean deploy
that still renders when the backend is not yet publicly hosted.

## Decisions made (and alternatives rejected)

- Fall back to `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` when
  `NEXT_PUBLIC_BASE_URL` is unset — do not invent a second env schema.
- Harden Medusa reads (`listCategories`, `getProductByHandle`, regions, counts)
  to empty/null instead of throwing — marketing pages stay up without a backend.
- Keep Root Directory at `apps/storefront`; install from repo root via
  `installCommand` so workspace `schemas` and `allowBuilds` apply.
- Do not block this deploy on Medusa hosting; wire
  `NEXT_PUBLIC_MEDUSA_BACKEND_URL` when a public API exists.

## Changes (file → what)

- `apps/storefront/src/lib/site-url.ts` — canonical origin helper
- `apps/storefront/src/app/layout.tsx`, `sitemap.ts`, `robots.ts`, shop/PDP/blog
  pages — use `getSiteUrl()`
- `apps/storefront/src/lib/data/catalog.ts`, `regions.ts` — catch Medusa failures
- `apps/storefront/vercel.json` — monorepo `installCommand` + `framework`

## Gotchas for future work

- Set `NEXT_PUBLIC_BASE_URL=https://legacy-crafts.vercel.app` in the Vercel
  project for stable absolute URLs across preview and production.
- Catalog, cart, customize, and blog stay empty until Medusa (and its CORS) are
  reachable from Vercel. Update Medusa `STORE_CORS` / `AUTH_CORS` to include the
  Vercel origin when that backend is live.
- Preview deployments should stay `noindex` (layout sets this when
  `VERCEL_ENV=preview`).

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront typecheck` — green
- Deploy via push to `main` (existing Vercel Git integration) → confirm
  `https://legacy-crafts.vercel.app` shows the 14-section homepage
