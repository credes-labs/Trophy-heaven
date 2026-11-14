import { parsePaymentPlan, splitAdvance } from "../payment-plan"

describe("payment plan", () => {
  it("only recognises the advance_cod plan", () => {
    expect(parsePaymentPlan("advance_cod")).toBe("advance_cod")
    expect(parsePaymentPlan("full")).toBe("full")
    expect(parsePaymentPlan("anything")).toBe("full")
    expect(parsePaymentPlan(undefined)).toBe("full")
  })

  it("charges 10% upfront (rounded up) and leaves the rest for delivery", () => {
    expect(splitAdvance(450_000)).toEqual({ advancePaise: 45_000, codPaise: 405_000 })
    expect(splitAdvance(199_999)).toEqual({ advancePaise: 20_000, codPaise: 179_999 })
    expect(splitAdvance(0)).toEqual({ advancePaise: 0, codPaise: 0 })
  })
})
