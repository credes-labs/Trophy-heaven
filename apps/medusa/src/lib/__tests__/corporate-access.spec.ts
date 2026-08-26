import {
  canAccessCorporateProfile,
  isActiveCorporateMember,
  orderMatchesCorporateProfile,
} from "../corporate-access"

describe("corporate access", () => {
  it("rejects anonymous callers matching invited seats with null customer_id", () => {
    expect(
      canAccessCorporateProfile(
        { customer_id: "cus_owner" },
        [{ customer_id: null, status: "invited" }],
        null
      )
    ).toBe(false)
    expect(
      isActiveCorporateMember([{ customer_id: null, status: "invited" }], null)
    ).toBe(false)
  })

  it("allows the owner and active members only", () => {
    expect(canAccessCorporateProfile({ customer_id: "cus_owner" }, [], "cus_owner")).toBe(true)
    expect(
      canAccessCorporateProfile(
        { customer_id: "cus_owner" },
        [{ customer_id: "cus_member", status: "active" }],
        "cus_member"
      )
    ).toBe(true)
    expect(
      canAccessCorporateProfile(
        { customer_id: "cus_owner" },
        [{ customer_id: "cus_member", status: "invited" }],
        "cus_member"
      )
    ).toBe(false)
  })
})

describe("orderMatchesCorporateProfile", () => {
  it("matches only the stamped corporate_profile_id", () => {
    expect(
      orderMatchesCorporateProfile(
        { metadata: { corporate_profile_id: "corp_1" } },
        "corp_1"
      )
    ).toBe(true)
    expect(
      orderMatchesCorporateProfile({ metadata: { corporate_profile_id: "corp_2" } }, "corp_1")
    ).toBe(false)
    expect(orderMatchesCorporateProfile({ metadata: null }, "corp_1")).toBe(false)
  })
})
