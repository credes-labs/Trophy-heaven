# 068 — Render and Vercel deployment

- Date: 2026-11-23 · Branch: main · Status: ready to deploy
- Layer-2 anchor: WP-107

## Context / why

The owner wants to deploy without further engineering: storefront on Vercel, everything else on a suitable host.

## Decisions made (and alternatives rejected)

- Render in Singapore: it has no India region, and Blueprints cover the whole backend in one file.
- One `shared` Medusa instance at 2 GB. Rate limits are in memory per node, so scaling out waits for a Redis limiter.
- Meilisearch is a private service with a disk. R2 holds uploads because deploys wipe local disk.
- Rejected serverless for Medusa: it needs a long-running process for jobs and subscribers.

## Changes (file → what)

- `render.yaml`, `apps/storefront/vercel.json`, `docs/deployment.md` — deployment
- `apps/medusa/Dockerfile`, `medusa-config.ts` — production boot
- `apps/medusa/src/scripts/{bootstrap,enable-razorpay}.ts` — first-run setup
- `apps/medusa/src/lib/cart-complete-guard.ts` — refuses unpaid production orders

## Gotchas for future work

- `sync: false` values are only prompted when the Blueprint is first created.
- `NEXT_PUBLIC_*` values are compiled in, so changing one needs a Vercel redeploy.
- The storefront also needs `RAZORPAY_KEY_SECRET` to verify payments.

## Verification (commands + evidence)

- Production Docker rehearsal with Postgres, Redis, Meilisearch and an S3-compatible store: migrate, bootstrap, health, admin, CORS, search, uploads, design rejection, valid order.
- Production storefront against that backend: 13 routes returned 200 and images optimised.
- `render.yaml` and `vercel.json` validated against the official JSON schemas.
- Not verified: real Render, Vercel, R2, Resend or Razorpay.
