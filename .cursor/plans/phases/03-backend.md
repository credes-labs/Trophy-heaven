# Phase 3: Backend Extensions — Detailed Spec

## Objective
Add blog, wishlist, and reviews Medusa modules; complete Razorpay webhook; enhance search facets; seed content.

---

## 3.1 Module Scaffold Pattern

Each module follows existing patterns from `trophy-customization` / `corporate-account`:

```
src/modules/<name>/
  models/<entity>.ts
  service.ts
  index.ts          # Module() export + constant
  migrations/
    MigrationYYYYMMDDHHMMSS.ts
    .snapshot-<name>.json
```

Register in `medusa-config.ts` under `modules: []`.

## 3.2 Blog Module Checklist

- [ ] `BlogPost` + `BlogCategory` models
- [ ] `BlogService` — CRUD, publish, listPublished, getBySlug, incrementViews
- [ ] Store routes: GET posts, GET post by slug, GET categories
- [ ] Admin routes: full CRUD + publish
- [ ] Migration generated and applied
- [ ] Seed: 4 categories + 6 posts (markdown content)

## 3.3 Wishlist Module Checklist

- [ ] `WishlistItem` model (unique customer+product)
- [ ] `WishlistService` — add, remove, list, toggle
- [ ] Store routes: GET/POST /store/wishlist, DELETE /store/wishlist/:id
- [ ] Auth required (getActorId)
- [ ] Migration + seed optional

## 3.4 Reviews Module Checklist

- [ ] `ProductReview` model
- [ ] `ReviewsService` — create, listApproved, aggregateRating, markHelpful, moderate
- [ ] Store: GET/POST reviews, POST helpful
- [ ] Admin: list, approve, reject
- [ ] Migration + seed 5 reviews per sample product

## 3.5 Razorpay Webhook

- [ ] `src/api/webhooks/razorpay/route.ts`
- [ ] HMAC verification using `RAZORPAY_WEBHOOK_SECRET`
- [ ] Handle `payment.captured`, `payment.failed`, `refund.created`
- [ ] Idempotent event processing (store processed event IDs or rely on Medusa payment state)
- [ ] No auth middleware (signature is auth)

## 3.6 Search Enhancement

- [ ] Update Meilisearch index settings: filterableAttributes, sortableAttributes, facets
- [ ] Enhance `/store/search` response with facet distribution
- [ ] Update reindex script

## Acceptance Criteria

- [ ] `npx medusa db:migrate` succeeds
- [ ] Seed script creates blog posts + reviews
- [ ] Store endpoints return 200 for happy paths
- [ ] Webhook rejects bad signatures with 400
- [ ] Typecheck passes for medusa app
