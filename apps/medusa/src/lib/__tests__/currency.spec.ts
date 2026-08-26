import { fromSmallestUnit, getCurrencyMultiplier, toSmallestUnit } from "../currency"

describe("toSmallestUnit / fromSmallestUnit", () => {
  it("converts INR major units (₹) to paise", () => {
    expect(toSmallestUnit(8999, "inr")).toBe(899_900)
    expect(toSmallestUnit(89.99, "INR")).toBe(8999)
  })

  it("leaves zero-decimal currencies unscaled", () => {
    expect(getCurrencyMultiplier("jpy")).toBe(1)
    expect(toSmallestUnit(1000, "JPY")).toBe(1000)
  })

  it("round-trips INR through fromSmallestUnit", () => {
    expect(fromSmallestUnit(899_900, "inr")).toBe(8999)
  })
})
