import { describe, expect, it } from "vitest"
import { looksLikeIdentifier } from "./otp-client"

describe("looksLikeIdentifier", () => {
  it("accepts emails", () => {
    expect(looksLikeIdentifier("asha@studio.in")).toBe(true)
    expect(looksLikeIdentifier("asha@studio")).toBe(false)
  })

  it("accepts Indian mobile numbers in common formats", () => {
    expect(looksLikeIdentifier("98765 43210")).toBe(true)
    expect(looksLikeIdentifier("+91-98765-43210")).toBe(true)
    expect(looksLikeIdentifier("09876543210")).toBe(true)
  })

  it("rejects landline-style and short numbers", () => {
    expect(looksLikeIdentifier("12345 67890")).toBe(false)
    expect(looksLikeIdentifier("98765")).toBe(false)
    expect(looksLikeIdentifier("call me")).toBe(false)
  })
})
