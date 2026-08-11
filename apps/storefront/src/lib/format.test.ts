import { describe, it, expect } from "vitest"
import { formatMoney, isCustomizable, CUSTOMIZATION_LABELS } from "./format"

describe("formatMoney", () => {
  it("formats INR with the Indian locale", () => {
    expect(formatMoney(2499, "inr")).toContain("₹")
  })
  it("formats USD", () => {
    expect(formatMoney(34.99, "usd")).toContain("$")
  })
})

describe("isCustomizable", () => {
  it("is true for text/logo/3d levels", () => {
    expect(isCustomizable("text_only")).toBe(true)
    expect(isCustomizable("full_3d")).toBe(true)
  })
  it("is false for none/undefined", () => {
    expect(isCustomizable("none")).toBe(false)
    expect(isCustomizable(undefined)).toBe(false)
  })
  it("has labels for every level", () => {
    expect(CUSTOMIZATION_LABELS.full_3d).toBeTruthy()
  })
})
