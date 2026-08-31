# 030 — Vercel schemas prebuild

- Date: 2026-09-01 · Branch: current · Status: shipped
- Layer-2 anchor: WP-32

## Context / why

Vercel cloned `main` with Root Directory `apps/storefront`. `pnpm run build` is `next build` only. `@legacy-crafts/schemas` exports `dist/`, which is not committed, so TypeScript failed with `Cannot find module '@legacy-crafts/schemas'`.

## Decisions made (and alternatives rejected)

- Prebuild schemas from the storefront script (`pnpm --filter @legacy-crafts/schemas build`) so local `pnpm --filter @legacy-crafts/storefront build` matches Vercel.
- Do **not** use `pnpm -w` — that also runs the root `build` script and recurses.
- Keep Root Directory as `apps/storefront`; do not move the Vercel project to the repo root.

## Changes (file → what)

- `apps/storefront/package.json` — `build` compiles schemas then Next
- `apps/storefront/vercel.json` — same `buildCommand`

## Gotchas for future work

- Changing Vercel Root Directory to the repo root needs `pnpm schemas:build && pnpm --filter @legacy-crafts/storefront build` instead.
- `dist/` stays gitignored; every CI/host must build schemas.

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/schemas build ; pnpm --filter @legacy-crafts/storefront typecheck`
