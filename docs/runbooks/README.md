# Runbooks

Operational runbooks for the Legacy Crafts platform. See also
[../deployment.md](../deployment.md) and [../architecture/erd.md](../architecture/erd.md).

## Local development

```bash
# 1. Backing services (Postgres 18, Redis 7, Meilisearch v1)
docker compose up -d

# 2. Install workspace deps
pnpm install

# 3. Build shared schemas (consumed by both apps)
pnpm --filter @legacy-crafts/schemas build

# 4. Migrate + seed the backend
cd apps/medusa
npx medusa db:migrate
npx medusa exec ./src/scripts/seed.ts
pnpm dev            # Medusa on :9000 (admin at /app)

# 5. Storefront
cd ../storefront
pnpm dev            # Next.js on :3000
```

## Search reindex

If the Meilisearch index drifts from the catalog (e.g. after a bulk import):

```bash
curl -X POST http://localhost:9000/admin/search/reindex \
  -H "Authorization: Bearer <admin_jwt>"
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
