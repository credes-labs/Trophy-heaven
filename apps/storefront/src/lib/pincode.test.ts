import { describe, expect, it } from "vitest"
import { isValidIndianPincode, parsePostalPincodeResponse } from "./pincode"

describe("Indian pincode helpers", () => {
  it("accepts a 6-digit PIN", () => {
    expect(isValidIndianPincode("382345")).toBe(true)
    expect(isValidIndianPincode("400001")).toBe(true)
    expect(isValidIndianPincode("38234")).toBe(false)
    expect(isValidIndianPincode("3823456")).toBe(false)
  })

  it("reads city and state from India Post lookup JSON", () => {
    const place = parsePostalPincodeResponse([
      {
        Status: "Success",
        PostOffice: [
          { District: "Ahmedabad", State: "Gujarat", Name: "Sola" },
          { District: "Ahmedabad", State: "Gujarat", Name: "Gota" },
        ],
      },
    ])
    expect(place).toEqual({ city: "Ahmedabad", state: "Gujarat" })
  })

  it("returns null when the PIN is unknown", () => {
    expect(parsePostalPincodeResponse([{ Status: "Error", PostOffice: null }])).toBeNull()
    expect(parsePostalPincodeResponse(null)).toBeNull()
  })
})
