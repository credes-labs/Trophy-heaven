# 002 — Backend hardening: Razorpay chain, modules, seeds

- Date: 2026-08-21→22 · Branch: `kimi` · Status: shipped
- Layer-2 anchor: WP-02

## Context / why

Payment integrity was broken end-to-end (log-only webhook; `authorizePayment`
returning AUTHORIZED unconditionally → unpaid orders could confirm), the catalog seed
was thin (3 products, no imagery, no decor products despite the category), typecheck
was red, and planned DB indexes were missing.

## Decisions made (and alternatives rejected)

- **Idempotency via a dedicated `webhook-events` module** (`webhook_event` table,
  unique `(provider, event_id)`) — provider modules can't own models, so a tiny
  separate module was the clean route. Rejected: Redis-only dedupe (not durable).
- **`authorizePayment` verifies with Razorpay** (`GET /v1/payments/:id`, fallback
  `GET /v1/orders/:order_id/payments`) and maps only `authorized`/`captured` →
  authorized; failures/missing keys → pending/error, never throw.
  `capturePayment` skips double-capture (Razorpay 400s).
- **Webhook reuses the provider's `getWebhookActionAndData`** for event→action
  mapping and resolves Medusa sessions by `data.razorpay_order_id`; always 200s after
  HMAC (`timingSafeEqual`, raw body preserved via middleware).
- **Seeds made idempotent with backfills** (imagery backfill for pre-seeded products)
  rather than destructive reseeding.
- **Image URLs in seeds point at the storefront origin**
  (`${STOREFRONT_URL ?? http://localhost:3000}/images/...`) — pragmatic for dev;
  production should move media to S3/R2 (file module) instead.

## Changes (file → what)

- `apps/medusa/src/scripts/seed.ts` → 8 typecheck errors fixed (stock-location typing,
  `CreateProductWorkflowInputDTO[]`); 6 new products (all 9 product PNGs mapped);
  thumbnails/images + backfill; promotions (`WELCOME10`, `LEGACY500`) in an active
  campaign, explicit `status: "active"` (added in WP-06 after `draft` discovery).
- `apps/medusa/src/scripts/seed-content.ts` → blog covers/SEO fields/published_at
  (+backfill), 5 reviews per product (ratings 3–5).
- `apps/medusa/src/api/webhooks/razorpay/route.ts` → real event processing.
- `apps/medusa/src/modules/razorpay/service.ts` → verified authorize/capture.
- `apps/medusa/src/modules/webhook-events/**` → new idempotency module (registered in
  `medusa-config.ts`).
- `apps/medusa/src/modules/{blog,wishlist,reviews}/migrations/Migration20260821204*.ts`
  → unique `blog_post.slug`, `blog_category.slug`, `wishlist_item(customer_id,product_id)`;
  composites `blog_post(status,published_at)`, `product_review(product_id,status)`, rating.
- `apps/medusa/src/api/store/contact/route.ts`, `newsletter/route.ts` → zod-validated,
  notification-module best-effort, always `{ok:true}`.
- `.cursor/plans/backend/03-razorpay.md` → the previously-missing plan doc.

## Gotchas for future work

- Promotions created without a campaign stay `draft` — see seed for the campaign +
  activate pattern; `addPromotionsToCampaign` takes `{id, promotion_ids}` (not
  `campaign_id`).
- The webhook assumes provider key `pp_razorpay_razorpay` (documented in 03-razorpay.md).
- New migrations must follow the existing partial-index style (`WHERE deleted_at IS NULL`).

## Verification

- `pnpm --filter @legacy-crafts/medusa typecheck` clean; 14 Jest tests green.
- Live smoke: `medusa db:migrate` applied; seeds run twice → idempotent; DB confirmed
  covers/SEO on 6/6 posts, 5 reviews/product, 0 products missing thumbnails.
