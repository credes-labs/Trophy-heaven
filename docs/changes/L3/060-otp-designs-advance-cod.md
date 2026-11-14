# 060 - OTP sign-in, cart designs, 10% advance + COD (WP-94)

## Why
The owner asked for six changes. Customers sign in with a one-time code by email or phone instead of a password. They can describe sticker designs, and upload designs for a whole (bulk) order or per item from the cart. They can pay 10% upfront and 90% cash on delivery, with the split shown clearly at checkout. The News page needs a silver-dipped trophies story, and the contact map goes.

## Changes (file → what)
- `apps/medusa/src/lib/otp.ts`, `otp-store.ts` → identifier normalisation (email / `+91XXXXXXXXXX`), code generation, HMAC hashing (JWT secret as pepper), cache storage.
- `apps/medusa/src/api/store/otp/{request,verify}/route.ts` → send code / verify and issue a customer JWT (`generateJwtToken`, same payload as Medusa's auth routes, `auth_provider: "otp"`).
- `apps/medusa/src/lib/design-upload.ts`, `api/store/design-uploads/route.ts` → base64 JSON upload, magic-byte sniffing, `uploadFilesWorkflow` (public).
- `apps/medusa/src/api/middlewares.ts` → rate limits for OTP + uploads; 14 MB body limit on uploads.
- `apps/medusa/src/lib/payment-plan.ts`, `modules/razorpay/service.ts` → `advance_cod` plan charges `ceil(10%)`; session data carries `payment_plan`, `total_paise`, `advance_paise`, `cod_due_paise`.
- `apps/medusa/src/subscribers/order-placed.ts` → writes `payment_plan`, `advance_amount`, `cod_amount` to order metadata.
- `apps/medusa/src/scripts/seed-content.ts` → News category + `dipped-in-silver` post.
- Storefront auth: `lib/otp-client.ts`, `components/features/account/otp-sign-in.tsx`, `stores/auth-store.ts` (requestOtp/verifyOtp replace login/register), login/register pages, `checkout-auth-gate.tsx`, settings (password section removed), forgot/reset-password → redirect.
- Storefront cart: `lib/design-uploads.ts`, `cart/design-upload-button.tsx`, `cart/order-design-panel.tsx`, `cart-drawer.tsx`, `cart-item.tsx`, `app/(shop)/cart/page.tsx`, `stores/cart-store.ts` (updateItemMetadata / updateCartMetadata).
- Sticker: `customize/configurator/plaque-configurator.tsx`, `catalog/product-actions.tsx`.
- Checkout: `lib/payment-plan.ts`, `lib/data/checkout.ts` (plan-aware `initPayment`, `setPaymentPlan`), `checkout/payment-step.tsx`, `payment-breakdown.tsx`, `review-step.tsx`, `checkout-summary.tsx`, `checkout.css`, `app/(shop)/checkout/page.tsx`, order confirmation.
- News: `blog/silver-dip-feature.tsx`, `/blog` page, `public/images/news/*.webp` (+ manifest).
- Contact: map iframe removed.

## Gotchas for future work
- **Metadata keys**: cart `order_design_file` `{url,filename,mime_type,size}`, `order_design_notes`, `payment_plan`; line `sticker_design`, `design_upload`. Clearing sends `""` (Medusa merges metadata and drops `""` keys); readers treat `""` as absent.
- Medusa's `createCustomerAccountWorkflow` requires an email, so phone sign-ups use `createCustomersWorkflow` (`has_account: true`) and link the auth identity's `app_metadata.customer_id` directly. Phone lookup goes through `query.graph` because `FilterableCustomerProps` omits `phone`.
- The OTP identity is a separate `otp` provider identity. A legacy emailpass customer signing in by email code gets linked to the same customer record.
- Medusa still records the payment as the full order amount. Only Razorpay is limited to the advance, so `capturePayment` captures the advance paise. The COD balance lives in order metadata; operations must collect it on delivery.
- `OTP_DEV_ECHO=true` exposes codes. It is ignored when `NODE_ENV=production`, but keep it off in shared environments.
- Without `RESEND_API_KEY` / `MSG91_AUTH_KEY` the local notification provider only logs, so codes are not delivered. Production needs both keys, and MSG91 may need a DLT-approved template for OTP SMS.

## Verification (commands + evidence)
```
pnpm typecheck                                   # pass
pnpm lint                                        # 0 errors (7 pre-existing warnings)
cd apps/medusa; TEST_TYPE=unit npx jest --runInBand --forceExit   # 16 suites, 62 tests
pnpm --filter @trophy-heaven/storefront exec vitest run          # 26 files, 118 tests
npx medusa exec ./src/scripts/seed-content.ts    # Created blog category: news / post: dipped-in-silver
```
Live API checks: phone sign-up returned is_new=true, `/store/customers/me` returned phone `+919876543210`, and a re-sign-in returned is_new=false. Email sign-up passed. A wrong code returned "4 attempts left" and the 30 s cooldown fired. PNG upload stored and HTML-as-PNG rejected.
Chromium walk: the contact page has 0 iframes and the /blog silver feature plus article render. OTP login through the UI worked. PDP sticker text showed on the cart line; order notes saved, order file attached, quantity 1→2 via +. The checkout OTP gate led to the payment step with ₹1,157.40 now / ₹10,416.60 on delivery of ₹11,574 in payment, review and summary.
Not verified live: Razorpay order creation (local test keys return 401). The 10% charge is covered by `razorpay-advance.spec.ts` with a mocked API.
