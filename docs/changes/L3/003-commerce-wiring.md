# 003 — Storefront commerce wiring

- Date: 2026-08-21→22 · Branch: `kimi` · Status: shipped
- Layer-2 anchor: WP-03

## Context / why

The Razorpay checkout chain was effectively stubbed (no `order_id`, client-computed
amount, signature ignored → carts completed regardless of payment). Promo codes were
a stub, coupons were hardcoded samples, wishlist hearts were local-only, and forms
submitted nowhere.

## Decisions made (and alternatives rejected)

- **Verify server-side before completing the cart**: new Next route handler
  `app/api/checkout/verify-razorpay/route.ts` HMAC-verifies
  `razorpay_order_id|razorpay_payment_id` with `RAZORPAY_KEY_SECRET` (timing-safe) and
  only then lets `finishOrder()` run. Rejected: trusting the client handler response
  (the original bug) and skipping completion when secrets are absent — instead the
  verify route 500s and checkout refuses to complete (fail closed).
- **Session amount over client math**: amount in paise derives from the payment
  session data (`razorpay_order_id` + amount), `cart.total * 100` only as fallback.
- **Promotions via cart `promo_codes`**: Medusa v2 silently ignores invalid codes, so
  `applyPromoCode` detects a code that didn't land on `cart.promotions` and throws a
  user-facing error.
- **Coupons from a real route**: `GET /store/promotions` (new, single backend file)
  lists active code promotions with campaign window checks — no curated-config
  fallback was needed against Medusa 2.18's module API.
- **Wishlist via a shared hook** (`use-wishlist`): fetch-on-mount, optimistic toggle,
  rollback on error, 401 → `/account/login`. Used by PDP actions and product cards.

## Changes (file → what)

- `app/(shop)/checkout/page.tsx` → order_id + session amount + verify-before-complete.
- `lib/data/checkout.ts` → `getRazorpaySessionData()`; `lib/razorpay.ts` →
  `verifyRazorpayPayment()` + types.
- `stores/cart-store.ts` → `applyPromoCode`/`removePromoCode`.
- `features/cart/promo-code.tsx` → real apply/remove + error UI;
  `features/cart/order-summary.tsx` → discount row.
- `apps/medusa/src/api/store/promotions/route.ts` (new) → active promotion listing.
- `lib/promotions.ts` (new), `account/coupons/page.tsx` → real coupons + copy/apply.
- `hooks/use-wishlist.ts` (new); `product-actions.tsx`, `product-card.tsx` hearts wired.
- `lib/forms.ts` (new) → `subscribeNewsletter`/`sendContactMessage`;
  `sections/newsletter.tsx`, `layout/footer.tsx`, `features/contact/contact-form.tsx`
  POST to backend with busy/error states.
- `.env.example`, `apps/storefront/.env.template` → `NEXT_PUBLIC_RAZORPAY_*`.

## Gotchas for future work

- The verify route needs `RAZORPAY_KEY_SECRET` in the storefront runtime env — without
  it, checkout correctly refuses to complete (that's the fail-closed design, not a bug).
- `use-wishlist` attaches `err.status` from `lib/wishlist.ts` — preserve that when
  refactoring the client.

## Verification

- Storefront typecheck clean, 30 tests green, lint 0 errors.
