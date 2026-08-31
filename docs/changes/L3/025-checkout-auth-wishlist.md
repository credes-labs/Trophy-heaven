# 025 — Checkout auth and saved addresses

- Date: 2026-08-31 · Branch: current · Status: shipped
- Layer-2 anchor: WP-27

## Context / why

Add to cart stays guest-friendly. Checkout must require login/signup, then a saved-address picker (or create/save Home/Work with PIN-first lookup). Wishlist stays account-only: `/account/wishlist` and hearts redirect to login when there is no session. Payment is intentionally left open.

## Decisions made (and alternatives rejected)

- Wishlist requires a customer. A guest localStorage wishlist was sketched then dropped — hearts and `/account/wishlist` bounce to `/account/login` as before.
- Checkout auth is an **inline gate** plus register `?next=/checkout` so the cart is not abandoned. `safeReturnPath` blocks open redirects.
- Address create matches the PIN → city/state → house/area → name/email → Home/Work form. India Post lookup is proxied at `/api/pincode/[pin]` to avoid browser CORS.
- Payment/Razorpay/COD/net-terms are **not** stubbed; comments mark the route as open.

## Changes (file → what)

- `lib/safe-return-path.ts`, `pincode.ts`, `checkout-address.ts` — helpers + tests
- `checkout/page.tsx`, `checkout-auth-gate.tsx`, `checkout-address-step.tsx`, `address-form.tsx`
- `account/login|register` honor `?next=`
- `app/api/pincode/[pin]/route.ts`
- e2e `fillCheckoutAddress` registers when the gate is shown, then fills the PIN-first form
- Wishlist: `AccountShell` still requires a customer; `useWishlist` still redirects on 401

## Gotchas for future work

- `safeReturnPath` rejects `/account/login` and `/account/register` so `next` cannot loop.
- Apartment/area is required on the new address form (screenshot).

## Verification (commands + evidence)

- `pnpm --filter @legacy-crafts/storefront test`
- `pnpm --filter @legacy-crafts/storefront typecheck`
- Browser: guest `/account/wishlist` → login; guest checkout → sign in/register → address; payment step still reachable
