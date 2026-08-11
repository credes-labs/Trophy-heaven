import { describe, it, expect } from "vitest"
import { computeBulkQuote, tierFor } from "./pricing"

describe("bulk pricing", () => {
  it("applies no discount below the first breakpoint", () => {
    const q = computeBulkQuote(5, 1000)
    expect(q.discount).toBe(0)
    expect(q.subtotal).toBe(5000)
    expect(q.savings).toBe(0)
  })

  it("applies volume discounts at breakpoints", () => {
    expect(tierFor(50).discount).toBe(0.15)
    const q = computeBulkQuote(50, 1000)
    expect(q.discountedUnit).toBe(850)
    expect(q.subtotal).toBe(42500)
    expect(q.savings).toBe(7500)
  })

  it("uses the top tier past the last breakpoint", () => {
    expect(tierFor(500).discount).toBe(0.25)
  })
})
