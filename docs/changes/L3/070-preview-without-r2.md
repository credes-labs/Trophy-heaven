# 070 — Preview uploads without R2

- Date: 2026-11-23 · Branch: client-preview · Status: ready to deploy
- Layer-2 anchor: WP-110

## Context / why

R2 activation requires a card. The client preview lasts a week and still needs design uploads.

## Decisions made (and alternatives rejected)

- Keep the production guard, with an explicit `ALLOW_LOCAL_FILE_STORAGE=true` opt-out.
- Mount a Railway volume over Medusa's `static` directory so files survive redeploys.
- Rejected a static storefront: catalogue, cart, sign-in and orders all need the backend.

## Changes (file → what)

- `apps/medusa/medusa-config.ts` — opt-out for the storage guard
- `docs/deployment.md` — preview setup

## Gotchas for future work

- Do not merge this setup into a launch configuration. Volumes tie Medusa to one instance.

## Verification (commands + evidence)

- Production image with Postgres, Redis, Meilisearch and a Docker volume: pre-deploy passed twice, an uploaded PNG returned 200 before and after replacing the container. Backend typecheck passed.
- Not verified: real Railway or Vercel.
