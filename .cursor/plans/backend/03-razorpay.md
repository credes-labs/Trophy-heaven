# Razorpay Integration — Payments, Webhooks, Idempotency

---

## Overview

Razorpay is the primary payment provider for India (UPI, cards, net banking,
wallets, EMI, PayLater — FR-PAY-1). The integration has three parts:

1. **Payment provider module** — `apps/medusa/src/modules/razorpay/`
   (`ModuleProvider(Modules.PAYMENT)`, identifier `razorpay`), registered in
   `medusa-config.ts` only when `RAZORPAY_KEY_ID` is set. Medusa keys it as
   `pp_razorpay_razorpay`.
2. **Webhook route** — `apps/medusa/src/api/webhooks/razorpay/route.ts`
   (`POST /webhooks/razorpay`), signature-verified, idempotent, always 200.
3. **Idempotency store** — `apps/medusa/src/modules/webhook-events/`
   (`webhook_event` table, unique `(provider, event_id)`).

Amounts are in the smallest currency unit (paise for INR) on both sides.

---

## Environment Variables

### Backend (`apps/medusa` — root `.env`)

| Var | Required | Purpose |
|-----|----------|---------|
| `RAZORPAY_KEY_ID` | to enable | Razorpay API key id (Basic-auth user). Provider is only registered when set. |
| `RAZORPAY_KEY_SECRET` | to enable | Razorpay API key secret (Basic-auth password). |
| `RAZORPAY_WEBHOOK_SECRET` | recommended | HMAC-SHA256 secret for webhook signature verification. The route 500s when unset. |

### Storefront (`apps/storefront`)

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Key id handed to Razorpay Checkout.js (must match the backend key). |
| `NEXT_PUBLIC_RAZORPAY_ENABLED` | `true` to offer Razorpay at checkout; anything else hides it. |

---

## Checkout Flow

1. Storefront creates a payment collection + session via the Medusa store API
   with provider `pp_razorpay_razorpay`.
2. `initiatePayment` creates a Razorpay **order** (`POST /v1/orders`) and stores
   `razorpay_order_id` in the session's `data`.
3. Storefront opens Razorpay Checkout with the order id; on success it receives
   `razorpay_payment_id` (+ signature) and completes the cart.
4. `authorizePayment` **verifies with Razorpay before authorizing**: it fetches
   `GET /v1/payments/:id` (falling back to `GET /v1/orders/:order_id/payments`)
   and returns `authorized` only when Razorpay reports `authorized`/`captured`;
   `failed` → `error`, anything else → `pending`. When keys are missing or the
   API call fails it returns `pending` instead of crashing.
5. `capturePayment` calls `POST /v1/payments/:id/capture` — skipped when the
   payment was already verified as `captured` (Razorpay 400s on double capture).

---

## Webhook Flow (`POST /webhooks/razorpay`)

Configured in the Razorpay dashboard with the events `payment.authorized`,
`payment.captured`, `payment.failed`.

1. **Raw body** is preserved via `bodyParser: { preserveRawBody: true }`
   (see `src/api/middlewares.ts`). No JWT — the endpoint is public.
2. **Signature verification**: `X-Razorpay-Signature` is compared against
   `HMAC-SHA256(raw_body, RAZORPAY_WEBHOOK_SECRET)` using
   `crypto.timingSafeEqual`. Mismatch → `400`.
3. **Idempotency**: the event `id` (`evt_…`) is looked up in
   `webhook_event(provider = 'razorpay', event_id)`. Already present → `200`
   `{ received: true, duplicate: true }`, no reprocessing. After successful
   processing the id is persisted; the unique index guards concurrent
   redeliveries.
4. **Event mapping** reuses the provider's `getWebhookActionAndData`, which
   maps `session_id` to the Razorpay **order id**:
   - `payment.captured` → `successful`: the Medusa payment session is found by
     matching `data.razorpay_order_id`; the Razorpay payment id is merged into
     session data; the session is authorized (if needed) and the payment
     captured via the payment module.
   - `payment.authorized` → `authorized`: session authorized if no payment
     exists yet.
   - `payment.failed` → `failed`: an open (uncaptured, uncanceled) payment is
     canceled; otherwise the event is only logged.
5. **Always 200** once the signature is valid — processing errors are logged,
   never retried by Razorpay.

---

## Testing

1. Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (test-mode keys) and
   `RAZORPAY_WEBHOOK_SECRET`; restart the backend (provider registration is
   conditional, so a boot without keys is safe).
2. Start a tunnel: `ngrok http 9000`, then add
   `https://<tunnel>/webhooks/razorpay` as a webhook in the Razorpay dashboard
   with the same secret.
3. Place a test order through the storefront with
   `NEXT_PUBLIC_RAZORPAY_ENABLED=true`; pay with a Razorpay test card/UPI
   simulator.
4. Verify in logs: `Razorpay payment.captured: captured payment pay_…`, and in
   the admin that the order's payment is captured.
5. **Signature check**: replay the payload with a wrong
   `X-Razorpay-Signature` → expect `400`.
6. **Idempotency**: redeliver the same event from the Razorpay dashboard →
   expect `200 { received: true, duplicate: true }` and no state change.
7. **Failure path**: use Razorpay's test `payment.failed` payload → the open
   payment is canceled in Medusa.
