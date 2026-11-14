import { describe, expect, it } from "vitest"
import { cartShippingLabel } from "./shipping"

describe("cartShippingLabel", () => {
  it("before a method: free only from ₹5,000, otherwise at checkout", () => {
    expect(cartShippingLabel({ item_subtotal: 8415, shipping_total: 0, currency_code: "inr" })).toBe("Free")
    expect(cartShippingLabel({ item_subtotal: 1200, shipping_total: 0, currency_code: "inr" })).toBe("At checkout")
    expect(cartShippingLabel(null)).toBe("At checkout")
  })
  it("after a method: the real amount", () => {
    const base = { item_subtotal: 1200, currency_code: "inr", shipping_methods: [{}] }
    expect(cartShippingLabel({ ...base, shipping_total: 99 })).toMatch(/99/)
    expect(cartShippingLabel({ ...base, shipping_total: 0 })).toBe("Free")
  })
})
