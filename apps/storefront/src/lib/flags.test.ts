import { describe, it, expect } from "vitest"
import { bucket, variant } from "./flags"

describe("feature flags A/B", () => {
  it("assigns a stable bucket for a given visitor + experiment", () => {
    const a = bucket("visitor-123", "checkout_exp", 2)
    const b = bucket("visitor-123", "checkout_exp", 2)
    expect(a).toBe(b)
    expect(a).toBeGreaterThanOrEqual(0)
    expect(a).toBeLessThan(2)
  })

  it("distributes different visitors across variants", () => {
    const assignments = new Set(
      Array.from({ length: 50 }, (_, i) => variant(`v${i}`, "exp", ["A", "B"]))
    )
    expect(assignments.size).toBe(2)
  })
})
