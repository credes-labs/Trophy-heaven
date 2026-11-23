# 069 — Client test site

- Date: 2026-11-23 · Branch: main · Status: ready to deploy
- Layer-2 anchor: WP-109

## Context / why

The first hosted deployment is for the client to test. Everything except real Razorpay payment must work, without waiting on an email domain or SMS approval.

## Decisions made (and alternatives rejected)

- `OTP_TEST_MODE` is a separate explicit flag, not `OTP_DEV_ECHO`, and is ignored with `rzp_live_` keys.
- The owner reviews files in the admin, so a test site does not depend on email.
- Rate limits use `cf-connecting-ip` only on Render, because elsewhere a client could forge it.
- Rejected a fixed demo code: a per-request code keeps the normal sign-in path under test.

## Changes (file → what)

- `apps/medusa/src/lib/otp.ts`, `api/store/otp/request/route.ts` — test-mode code
- `apps/medusa/src/admin/widgets/order-customer-files.tsx` — files on the admin order
- `apps/medusa/src/lib/rate-limit-auth.ts`, `api/middlewares.ts` — visitor IP
- `apps/medusa/src/subscribers/order-placed.ts` — failed confirmation is logged
- `apps/storefront/src/app/(account)/account/wishlist/page.tsx` — region for prices
- `render.yaml`, `docs/deployment.md` — test-site setup

## Gotchas for future work

- With test mode on, anyone can sign in as any email or phone. Clear it before launch.
- Medusa's admin session cookie is Secure. Over plain HTTP, login loops back to the login page.

## Verification (commands + evidence)

- Production image and storefront build, no Razorpay, invalid Resend key: 21/21 browser checks.
- Not verified: real Render, Vercel or R2, and Render's `cf-connecting-ip` behaviour.
