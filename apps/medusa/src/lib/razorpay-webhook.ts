/**
 * Razorpay payment webhooks are `entity: "event"` payloads with no top-level
 * `id`. Dedup using `X-Razorpay-Event-Id` (unique per delivery) or
 * `{event}:{payment.id}` so authorized vs captured for the same payment
 * remain distinct.
 * @see https://razorpay.com/docs/webhooks/payloads/payments/
 */
export function razorpayWebhookEventId(input: {
  headerEventId?: string | null
  event?: string | null
  paymentId?: string | null
  createdAt?: number | null
}): string {
  const header = input.headerEventId?.trim()
  if (header) return header
  const event = input.event?.trim() || "unknown"
  const paymentId = input.paymentId?.trim()
  if (paymentId) return `${event}:${paymentId}`
  if (input.createdAt) return `${event}:${input.createdAt}`
  return ""
}
