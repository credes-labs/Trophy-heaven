# Trophy Heaven

Premium e-commerce for **custom trophies and awards**. A Next.js 16 storefront backed
by Medusa v2, with Razorpay payments, an in-browser 2D/3D trophy customizer, and
corporate/bulk ordering. Forked from the Legacy Crafts codebase (trophies + furniture +
artwork); the furniture and artwork lines were removed in WP-87 (see `docs/changes/`).

- Brand: walnut/cream/champagne base, gold accents (`#B89E6B`), burgundy `#8A2D25`
  trophy accent. Logo: "T" monogram + "Trophy Heaven" wordmark — interim live-text
  versions until the supplied logo and imagery land.
- Type: Urbanist everywhere (display, body, UI)
- Catalog seeded: 3 trophy products, 6 blog posts, reviews, promotions (`WELCOME10`, `HEAVEN500`)

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Storefront | Next.js 16 (App Router), React 19, Tailwind v4, shadcn-style UI, Zustand 5, TanStack Query v5 | RSC-first catalog pages, ISR for SEO; client stores for cart/auth |
| Commerce backend | Medusa.js v2.18 (Node 24, MikroORM) | Headless commerce with extensible modules; no second CMS needed |
| CMS (blog) | Medusa `blog` module | One backend/DB/auth instead of adding Payload CMS (recorded decision) |
| Payments | Razorpay (India) | INR-first market; HMAC-verified checkout + idempotent webhooks |
| 2D/3D customizer | Fabric.js 7 · React Three Fiber 9 + Three.js | In-browser trophy design before purchase |
| Data | PostgreSQL 18 · Redis 7 · Meilisearch v1 | Medusa defaults + search |
| Testing | Vitest + Jest (unit), Playwright + axe-core (e2e/a11y) | WCAG AA enforced in e2e |

Locked product/technical decisions live in [`docs/kit/`](docs/kit/00-index.md);
the design-system spec lives in [`.cursor/plans/`](.cursor/plans/00-master-plan.md).

## Monorepo layout

```
trophy-heaven/
  apps/
    storefront/            # Next.js 16 App Router (port 3000)
    medusa/                # Medusa v2 backend + custom modules (port 9000)
  packages/
    schemas/               # shared Zod schemas (entities + 2D/3D design state)
    observability/         # Pino logger + Sentry helpers
    config/                # shared tsconfig / eslint / prettier
  docs/
    kit/                   # product + technical spec (source of truth)
    changes/               # 3-layer change log (see docs/changes/INDEX.md)
  .cursor/plans/           # design-system + page/component spec + execution tracker
  .agents/skills/          # installed agent skills (skills.sh)
  docker-compose.yml       # Postgres 18 + Redis 7 + Meilisearch v1
```

## Quickstart

Prereqs: **Node 24** (`.nvmrc`), **pnpm 10+**, **Docker**.

```bash
pnpm install                                # 1. deps
docker compose up -d                        # 2. Postgres/Redis/Meilisearch
cp .env.example .env                        # 3. env (fill secrets; see below)
pnpm --filter @trophy-heaven/schemas build  # 4. shared packages
make migrate                                # 5. DB migrations
make seed                                   # 6. catalog + content + promotions
pnpm dev                                    # 7. storefront :3000 + medusa :9000
```

Open http://localhost:3000 — seeded products, blog, reviews and promo codes are live.

### Key environment variables

| Var | Where | Purpose |
|-----|-------|---------|
| `DATABASE_URL`, `REDIS_URL` | medusa | backing services |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | medusa + storefront (server) | payment provider, signature verification, webhook HMAC |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_ENABLED` | storefront | checkout widget toggle |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` / `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | storefront | store API access |
| `NEXT_PUBLIC_BASE_URL` | storefront | absolute URLs (SEO, share links) |
| `STOREFRONT_URL` | medusa | product image URLs in seeds |

## Scripts

| Command | What |
|---------|------|
| `pnpm dev` | run all apps in dev |
| `pnpm build` / `pnpm typecheck` / `pnpm lint` / `pnpm test` | workspace-wide gates (all green) |
| `pnpm --filter @trophy-heaven/storefront test:e2e` | Playwright smoke + axe a11y (needs dev servers) |
| `make up` / `make migrate` / `make seed` / `make reindex` | services + data ops |

## Testing & quality gates

- **72 unit tests** (schemas, storefront lib, medusa lib) — `pnpm -r test`
- **22 e2e checks** (11 tests × chromium+mobile projects) incl. **axe WCAG2A/AA** on the
  landing page — `apps/storefront/e2e/smoke.spec.ts`
- Production build verified: `pnpm -r build`

## Documentation map

- [`docs/kit/`](docs/kit/00-index.md) — product & technical specification (source of truth)
- [`.cursor/plans/`](.cursor/plans/00-master-plan.md) — brand/design-system spec, page & component
  specs, backend schema/API plans, and `KIMI-EXECUTION-STATUS.md` (build log + deferred items)
- [`docs/changes/INDEX.md`](docs/changes/INDEX.md) — **change log**: index + 3 layers of
  increasing detail (milestones → work packages → deep technical entries)
- [`AGENTS.md`](AGENTS.md) — the **AI readme**: conventions, gotchas, and rules for AI
  agents (and humans) working in this repo — read it before changing anything

## Deployment

See [`docs/deployment.md`](docs/deployment.md). Payments run through Razorpay — set the
three `RAZORPAY_*` secrets and register the webhook (`/webhooks/razorpay`) per
[`.cursor/plans/backend/03-razorpay.md`](.cursor/plans/backend/03-razorpay.md).
