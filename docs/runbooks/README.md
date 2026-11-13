# Runbooks

Operational runbooks for the Trophy Heaven platform. See also
[../deployment.md](../deployment.md) and [../architecture/erd.md](../architecture/erd.md).

## Local development

There are two supported paths. Prefer the host path on Cursor Cloud VMs (no Docker
daemon). Prefer Compose on Docker-capable machines.

### Host path (this VM / no Docker)

Postgres 16 + Redis 7 are installed on the host. Meilisearch is a binary at
`/usr/local/bin/meilisearch`. Apps run under `tmux`.

```bash
pnpm install
make up            # migrate + seed + start meilisearch/medusa/storefront
make reindex       # rebuild Meilisearch product index
# make down        # stop tmux app sessions (leaves PG/Redis running)
```

URLs after `make up`:

| Surface | URL |
| --- | --- |
| Storefront | http://localhost:3000 |
| Medusa API | http://localhost:9000 |
| Admin | http://localhost:9000/app |
| Meilisearch | http://localhost:7700 |

Dev admin: `admin@trophyheaven.test` / `TrophyHeaven!Dev1`

Scripts: [`scripts/dev-up.sh`](../../scripts/dev-up.sh),
[`scripts/dev-down.sh`](../../scripts/dev-down.sh),
[`scripts/reindex-search.sh`](../../scripts/reindex-search.sh).

### Docker path (portable IaC)

```bash
# Backing services only
docker compose up -d

# Full stack (builds app images, migrates, seeds)
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_…
docker compose --profile apps up -d --build
```

Compose profiles:

- default: `postgres`, `redis`, `meilisearch`
- `apps`: `medusa-init` (migrate+seed), `medusa`, `storefront`

Dockerfiles: [`apps/medusa/Dockerfile`](../../apps/medusa/Dockerfile),
[`apps/storefront/Dockerfile`](../../apps/storefront/Dockerfile).

> Note: Postgres is pinned to **16** in Compose for parity with the host-installed
> cluster on this VM. Bump to `postgres:18-alpine` when every environment is on 18.

## Search reindex

```bash
make reindex
# or manually:
# ./scripts/reindex-search.sh
```

The `product.created/updated/deleted` subscriber keeps the index in sync in
normal operation; a full reindex is only needed after out-of-band changes.

## Payment webhook failures

- Razorpay posts to `/hooks/payment/razorpay`. The provider verifies the HMAC
  signature (`RAZORPAY_WEBHOOK_SECRET`) and rejects mismatches with `400`.
- Handling is idempotent — replaying a processed event is a no-op.
- To investigate a stuck payment: check the payment collection status in Admin,
  then the Razorpay dashboard event log. Re-trigger delivery from Razorpay if the
  event never arrived.

## Production queue stuck

- Jobs enter `pending_design_approval` on `order.placed`. If a job never advances,
  confirm a `DesignApproval` exists and was approved (which emits `design.approved`).
- Invalid status transitions return `409`; consult
  `apps/medusa/src/lib/production-routing.ts` for the allowed transition map.

## Notification provider outage

- Email (Resend) / SMS (MSG91) failures are logged and fall back to the local
  notification provider. Verify `RESEND_API_KEY` / `MSG91_AUTH_KEY` and provider
  status pages. Notifications are best-effort and never block order/production flow.

## Incident: WebGL / 3D viewer errors

- The 3D viewer degrades to a 2D fallback when WebGL is unavailable and recovers
  automatically from context loss. If users report blank viewers, confirm the
  device-capability path (`useDeviceCapability`) and check the browser console for
  WebGL context-lost events.
