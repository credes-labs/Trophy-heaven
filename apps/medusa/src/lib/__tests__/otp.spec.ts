import {
  generateOtp,
  hashOtp,
  maskIdentifier,
  normalizeIdentifier,
  otpCacheKey,
  otpMatches,
  phoneVariants,
} from "../otp"

describe("normalizeIdentifier", () => {
  it("lower-cases and validates emails", () => {
    expect(normalizeIdentifier("  Asha@Studio.IN ")).toEqual({ kind: "email", value: "asha@studio.in" })
    expect(normalizeIdentifier("asha@studio")).toBeNull()
  })

  it("normalises Indian mobile numbers to +91XXXXXXXXXX", () => {
    for (const input of ["9876543210", "98765 43210", "+91-98765-43210", "919876543210", "09876543210"]) {
      expect(normalizeIdentifier(input)).toEqual({ kind: "phone", value: "+919876543210" })
    }
  })

  it("rejects non-mobile numbers and junk", () => {
    expect(normalizeIdentifier("1234567890")).toBeNull()
    expect(normalizeIdentifier("98765")).toBeNull()
    expect(normalizeIdentifier("hello")).toBeNull()
    expect(normalizeIdentifier("")).toBeNull()
  })
})

describe("otp codes", () => {
  it("generates 6 digits", () => {
    for (let i = 0; i < 50; i++) expect(generateOtp()).toMatch(/^\d{6}$/)
  })

  it("matches only the right code for the right identifier", () => {
    const hash = hashOtp("123456", "+919876543210", "pepper")
    expect(otpMatches("123456", "+919876543210", "pepper", hash)).toBe(true)
    expect(otpMatches("123457", "+919876543210", "pepper", hash)).toBe(false)
    expect(otpMatches("123456", "+919876543211", "pepper", hash)).toBe(false)
    expect(otpMatches("123456", "+919876543210", "other", hash)).toBe(false)
    expect(otpMatches("12345", "+919876543210", "pepper", hash)).toBe(false)
  })

  it("does not put the identifier in the cache key", () => {
    expect(otpCacheKey("asha@studio.in")).not.toContain("asha")
  })
})

describe("helpers", () => {
  it("masks destinations", () => {
    expect(maskIdentifier({ kind: "phone", value: "+919876543210" })).toBe("+91 ••••• •3210")
    expect(maskIdentifier({ kind: "email", value: "asha@studio.in" })).toBe("as••@studio.in")
  })

  it("lists stored phone variants", () => {
    expect(phoneVariants("+919876543210")).toEqual(
      expect.arrayContaining(["+919876543210", "9876543210", "919876543210"])
    )
  })
})
