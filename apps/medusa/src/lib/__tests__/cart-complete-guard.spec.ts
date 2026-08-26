import { MedusaError } from "@medusajs/framework/utils"
import { assertCartMayComplete, claimedNetTerms } from "../cart-complete-guard"

describe("claimedNetTerms", () => {
  it("ignores prepaid", () => {
    expect(claimedNetTerms({ payment_terms: "prepaid" })).toBeNull()
    expect(claimedNetTerms({})).toBeNull()
  })

  it("reads net_30 / net_60", () => {
    expect(claimedNetTerms({ payment_terms: "net_30" })).toBe("net_30")
    expect(claimedNetTerms({ net_terms: true, payment_terms: "net_60" })).toBe("net_60")
  })
})

describe("assertCartMayComplete", () => {
  it("rejects system-provider complete when Razorpay is configured", async () => {
    await expect(
      assertCartMayComplete(
        { total: 100, metadata: {}, paymentSessions: [{ provider_id: "pp_system_default", status: "authorized" }] },
        { razorpayConfigured: true }
      )
    ).rejects.toBeInstanceOf(MedusaError)
  })

  it("rejects net-terms without a corporate profile", async () => {
    await expect(
      assertCartMayComplete(
        { total: 100, metadata: { payment_terms: "net_30" }, paymentSessions: [] },
        { razorpayConfigured: true, verifyNetTerms: async () => ({ ok: true }) }
      )
    ).rejects.toBeInstanceOf(MedusaError)
  })

  it("allows authorized Razorpay sessions", async () => {
    await expect(
      assertCartMayComplete(
        {
          total: 100,
          metadata: {},
          paymentSessions: [{ provider_id: "pp_razorpay_razorpay", status: "authorized" }],
        },
        { razorpayConfigured: true }
      )
    ).resolves.toBeUndefined()
  })
})
