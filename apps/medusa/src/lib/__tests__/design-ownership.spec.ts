import { canCloneDesign, isDesignOwner, isSameNonNullId } from "../design-ownership"

describe("isSameNonNullId", () => {
  it("rejects null === null", () => {
    expect(isSameNonNullId(null, null)).toBe(false)
    expect(isSameNonNullId(undefined, undefined)).toBe(false)
  })

  it("matches two equal non-null ids", () => {
    expect(isSameNonNullId("cus_1", "cus_1")).toBe(true)
    expect(isSameNonNullId("cus_1", "cus_2")).toBe(false)
  })
})

describe("isDesignOwner", () => {
  it("does not treat two guests as owners of each other's designs", () => {
    expect(
      isDesignOwner({
        customerId: null,
        actorId: null,
        ownerToken: "tok_a",
        presentedOwnerToken: "tok_b",
      })
    ).toBe(false)
  })

  it("allows a guest who presents the owner token", () => {
    expect(
      isDesignOwner({
        customerId: null,
        actorId: null,
        ownerToken: "tok_a",
        presentedOwnerToken: "tok_a",
      })
    ).toBe(true)
  })

  it("allows the authenticated customer who created the design", () => {
    expect(
      isDesignOwner({
        customerId: "cus_1",
        actorId: "cus_1",
      })
    ).toBe(true)
  })
})

describe("canCloneDesign", () => {
  it("allows cloning public templates and presets without ownership", () => {
    expect(
      canCloneDesign({ fromPreset: true, isTemplate: false, customerId: "cus_x", actorId: "cus_y" })
    ).toBe(true)
    expect(
      canCloneDesign({ fromPreset: false, isTemplate: true, customerId: "cus_x", actorId: "cus_y" })
    ).toBe(true)
  })

  it("refuses cloning someone else's private design", () => {
    expect(
      canCloneDesign({
        fromPreset: false,
        isTemplate: false,
        customerId: "cus_owner",
        actorId: "cus_other",
      })
    ).toBe(false)
  })
})
