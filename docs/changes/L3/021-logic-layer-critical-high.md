# 021 — Logic-layer critical and high fixes

- Date: 2026-08-26 · Branch: `fix/logic-layer-critical-high` · Status: in-progress
- Layer-2 anchor: WP-23

## Context / why

A logic-layer audit found undercharge (Razorpay amounts in rupees instead of
paise), unpaid `completeCart`, guest design `null === null` ownership, clone and
corporate-invite IDOR, and several High integrity issues (webhook lookup,
cart region/races, stock/`variants[0]`, bulk confirm, reviews, production jobs,
search/rate-limit/seed prices).

## Decisions made (and alternatives rejected)

- **Razorpay uses `toSmallestUnit` / `fromSmallestUnit`** matching Stripe's
  `getSmallestUnit` tables. Storefront prefers `data.amount_paise`; never treat
  `session.data.amount` as paise.
- **Default-deny RBAC**, but Medusa dashboard users (`actor_type: "user"`) without
  an LC role stay `admin` so stock admin JWTs keep working.
- **Guest designs prove ownership with `owner_token`**, not `customer_id === null`.
- **Prepaid complete requires an authorized/captured Razorpay session** when keys
  are configured. Local/dev without keys can still use the system provider.
- **Corporate orders listed by member customer ids, then filtered in memory.**
  Nested JSONB metadata filters are not reliable in Medusa Query.
- **Cart create always sends `region_id`** (India via `NEXT_PUBLIC_DEFAULT_REGION`).
  Login/register calls `transferCart`. Bulk confirm merges prior line items onto
  the new cart instead of dropping them.
- **3D cart metadata drops `data:` screenshots** so line-item merge and storage
  stay sane; hosted `preview_url` is kept.

## Changes (file → what)

| Area | What |
|------|------|
| `lib/currency.ts` (medusa + storefront) | Major ↔ smallest unit conversion |
| `modules/razorpay/service.ts` | Initiate/authorize/capture/refund/webhook amounts |
| `lib/design-ownership.ts` + design routes | Token ownership, clone gate, lock includes `submitted_for_review` |
| `lib/cart-complete-guard.ts` + workflow hook | Block unpaid prepaid complete |
| `api/store/blog/posts/route.ts` | POST → 405 |
| `lib/corporate-access.ts` + invites | Invited-seat IDOR; accept-invite token |
| `lib/rbac.ts` | Default deny + explicit caps |
| `api/webhooks/razorpay/route.ts` | Event-id idempotency; session lookup by notes |
| Storefront cart/auth/PDP/customize | Region, single-flight, transfer, stock, cheapest variant |
| Bulk confirm | Idempotent confirmed; INR region; credit before designs |
| Reviews / returns / corporate orders | Verified purchase, guest RMA deny, in-memory corp filter |
| Production jobs | Unique line, ship=`completed`, on_hold resume, pending-only approve/reject |
| Search / rate-limit / seed | Meili escape + unpublished skip; JWT-only store multiplier; INR 99/249 shipping |

## Gotchas for future work

- Medusa v2 prices are **major units**; Razorpay is **paise**. Do not store Razorpay
  paise on `payment_session.amount`.
- Guest RMA is denied after `isSameNonNullId` on return eligibility.
- Corporate order history only scans the latest 200 member orders.
- No unique DB index yet for `(customer_id, product_id)` reviews.
- Helpful votes are still unbounded per authenticated user.
- Windows PowerShell cannot run Medusa's `TEST_TYPE=unit jest` npm script as written.

## Extra issues noted (not fixed)

- Checkout summary ignores `discount_total`.
- Customer JWT lives in the JS SDK, not an httpOnly cookie.
- Health endpoint can leak service names; jwt/cookie secret fallback `"supersecret"`.
- Marketing copy (free shipping > ₹5k, Express ₹299) is not implemented as shipping options.
- Bulk volume discounts have no price lists behind them.
- MSG91 module unused.

## Verification (commands + evidence)

- Storefront: `npx vitest run src/lib/product-filters.test.ts src/lib/cart-line.test.ts src/lib/data/checkout.test.ts`
- Medusa (PowerShell): `$env:TEST_TYPE="unit"; npx jest src/lib/__tests__/currency.spec.ts src/lib/__tests__/design-ownership.spec.ts src/lib/__tests__/cart-complete-guard.spec.ts src/lib/__tests__/corporate-access.spec.ts src/lib/__tests__/rbac.spec.ts src/lib/__tests__/razorpay-webhook.spec.ts src/lib/__tests__/meilisearch.spec.ts src/lib/__tests__/production-routing.spec.ts`
- Live admin CRM curl: `.tmp/logic-layer-review/05-admin-crm.md` + `run-admin-crm.ps1` — approvals pending-only/409, reject feedback, on_hold resume rules, ship→completed+tracking, reindex, corporate admin PUT (retested).
- Admin production board `NEXT` map aligned with `STATUS_TRANSITIONS`; packed completes via ship/label only.
- Full live rollup: `.tmp/logic-layer-review/00-ROLLUP.md` (all curl + Playwright + admin CRM). Razorpay-on / webhook HMAC still need non-empty keys.
- Playwright H3/C4: `.tmp/logic-layer-review/06-playwright-auth-checkout.md` + `e2e/logic-layer-auth-checkout.spec.ts` — guest→register/login cart transfer PASS; empty checkout PASS; Razorpay off → COD place-order confirmed; Razorpay-on gates N/A until env keys set.
