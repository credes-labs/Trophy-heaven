# Deployment Guide

## Topology

- **Storefront** — Next.js 16 (App Router, RSC + ISR). Deploy to a Node host or
  edge platform. Requires `NEXT_PUBLIC_MEDUSA_BACKEND_URL`,
  `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BASE_URL`.
- **Medusa backend** — Node 24, Postgres 16 (local) / 18 (target), Redis 7. Serves
  the Store/Admin API, admin dashboard, and workflow engine.
- **Meilisearch v1** — product search index.
- **Object storage** — Cloudflare R2 (S3-compatible) for design previews + media.

Local bring-up: see [`docs/runbooks/README.md`](./runbooks/README.md) for the host
path (`make up`) and the Docker Compose `--profile apps` path.

## Environment

Copy `.env.example` and populate secrets via your secret store (never commit
real keys). Payments (Razorpay/Stripe), shipping (ShipRocket/Delhivery),
notifications (Resend/MSG91), search (Meilisearch), and storage (R2) all activate
only when their env vars are present, so partial configs degrade gracefully.

## Release steps

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @legacy-crafts/schemas build`
3. Backend: `npx medusa db:migrate` then `pnpm --filter @legacy-crafts/medusa build`
4. Storefront: `pnpm --filter @legacy-crafts/storefront build`
5. Start: backend `medusa start`; storefront `next start`.
6. Post-deploy: `POST /admin/search/reindex` to warm the search index.

## Health & observability

- Liveness: `GET /health` on the backend.
- Structured logs via Pino (`packages/observability`); errors to Sentry when
  `SENTRY_DSN` is set.
- Analytics: GA4 + Mixpanel load client-side when their keys are configured.

## Scaling notes

- The backend is stateless; scale horizontally behind a load balancer with Redis
  as the shared cache / event bus / workflow store.
- The in-memory rate limiter (`src/api/middlewares.ts`) should be swapped for the
  Redis-backed limiter when running more than one node.
- ISR + CDN caching front the storefront; product/category pages revalidate on a
  schedule and on catalog events.
