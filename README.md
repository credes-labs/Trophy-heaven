# Legacy Crafts

Premium e-commerce for **custom trophies, furniture, and home decor**, with an in-browser **2D canvas editor** and **3D real-time simulator** for designing a trophy before purchase.

The full product/technical specification lives in [`docs/kit/`](docs/kit/00-index.md) (start with the index). This repository implements that spec.

## Stack

| Layer | Choice |
|-------|--------|
| Storefront | Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, Zustand 5, TanStack Query v5 |
| Commerce backend | Medusa.js v2.18 (Node 24 LTS, MikroORM) |
| 2D editor | Fabric.js 7 · 3D viewer: React Three Fiber 9 + drei + Three.js |
| Data | PostgreSQL 18 · Redis 7 · Meilisearch v1 |
| Storage/CDN | S3 / Cloudflare R2 + CDN · Cloudinary transforms |
| Payments | Razorpay (India) + Stripe (international) |

See [docs/kit/13-constraints-and-assumptions.md](docs/kit/13-constraints-and-assumptions.md) for locked decisions.

## Monorepo layout

```
legacy-crafts/
  apps/
    storefront/                 # Next.js 16 App Router
    medusa/                     # Medusa v2 backend + custom modules
  packages/
    schemas/                    # shared Zod schemas (entities + 2D/3D design state)
    observability/              # Pino logger + Sentry helpers
    config/                     # shared tsconfig / eslint / prettier
  docs/kit/                     # product + technical spec (source of truth)
  docker-compose.yml            # local Postgres 18 + Redis 7 + Meilisearch v1
```

## Prerequisites

- **Node.js 24 LTS** (`.nvmrc`), **pnpm 10+**
- **Docker** for local backing services (or a local Postgres 18 / Redis 7 / Meilisearch v1)

## Getting started

```bash
# 1. Install deps
pnpm install

# 2. Start backing services (Postgres 18, Redis 7, Meilisearch v1)
docker compose up -d

# 3. Configure environment
cp .env.example .env   # then fill in per-app secrets

# 4. Build shared packages
pnpm --filter @legacy-crafts/schemas build

# 5. Run the apps (once scaffolded)
pnpm dev
```

## Workspace scripts

- `pnpm lint` — lint all packages
- `pnpm typecheck` — TypeScript typecheck across the workspace
- `pnpm test` — run unit tests (Vitest / Jest)
- `pnpm build` — build all packages

## Implementation phases

Built in the dependency order from [docs/kit/04-implementation-roadmap.md](docs/kit/04-implementation-roadmap.md):

1. **Foundation & core commerce** — catalog, cart, checkout, auth, orders, admin
2. **2D customization engine** — Fabric.js editor + `TrophyCustomizationModule`
3. **3D simulation & AR** — R3F viewer, PBR materials, WebXR
4. **Corporate & bulk** — `BulkOrderModule` + `CorporateAccountModule`
5. **Production & operations** — `ProductionWorkflowModule`, approvals, shipping, notifications
6. **Scale & polish** — search, performance, SEO, analytics, PWA
