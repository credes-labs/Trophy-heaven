import { fromSmallestUnit, toSmallestUnit } from "../currency"
import { razorpayWebhookEventId } from "../razorpay-webhook"

describe("razorpayWebhookEventId", () => {
  it("prefers X-Razorpay-Event-Id", () => {
    expect(
      razorpayWebhookEventId({
        headerEventId: "evt_abc",
        event: "payment.captured",
        paymentId: "pay_1",
      })
    ).toBe("evt_abc")
  })

  it("falls back to event:paymentId because payloads have no top-level id", () => {
    expect(
      razorpayWebhookEventId({
        event: "payment.captured",
        paymentId: "pay_DESp9bgForNoUd",
      })
    ).toBe("payment.captured:pay_DESp9bgForNoUd")
  })
})

describe("webhook amount units", () => {
  it("converts Razorpay paise back to Medusa major units", () => {
    expect(fromSmallestUnit(899_900, "INR")).toBe(8999)
  })

  it("converts Medusa major units to Razorpay paise", () => {
    expect(toSmallestUnit(8999, "inr")).toBe(899_900)
  })
})
