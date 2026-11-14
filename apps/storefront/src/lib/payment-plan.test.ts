import { describe, expect, it } from "vitest"
import { splitAdvance } from "./payment-plan"

describe("splitAdvance", () => {
  it("takes 10% upfront and leaves 90% for delivery", () => {
    expect(splitAdvance(4500)).toEqual({ advance: 450, balance: 4050 })
  })

  it("rounds the advance up to the paisa and keeps the parts summing to the total", () => {
    const { advance, balance } = splitAdvance(1999.99)
    expect(advance).toBe(200)
    expect(balance).toBe(1799.99)
    expect(Math.round((advance + balance) * 100)).toBe(199999)
  })

  it("handles zero and negative totals", () => {
    expect(splitAdvance(0)).toEqual({ advance: 0, balance: 0 })
    expect(splitAdvance(-5)).toEqual({ advance: 0, balance: 0 })
  })
})
