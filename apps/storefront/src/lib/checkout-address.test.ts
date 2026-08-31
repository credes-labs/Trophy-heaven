import { describe, expect, it } from "vitest"
import {
  customerAddressToFormValues,
  splitFullName,
  toCartShippingAddress,
} from "./checkout-address"

describe("splitFullName", () => {
  it("splits first token and remainder", () => {
    expect(splitFullName("Asha Verma")).toEqual({ first_name: "Asha", last_name: "Verma" })
    expect(splitFullName("Asha")).toEqual({ first_name: "Asha", last_name: "Asha" })
    expect(splitFullName("  Priya  Nair  Menon ")).toEqual({
      first_name: "Priya",
      last_name: "Nair Menon",
    })
  })
})

describe("customerAddressToFormValues", () => {
  it("maps a saved customer address onto checkout fields", () => {
    const values = customerAddressToFormValues(
      {
        first_name: "Asha",
        last_name: "Verma",
        address_1: "12 MG Road",
        address_2: "Fort",
        city: "Mumbai",
        province: "Maharashtra",
        postal_code: "400001",
        phone: "9876543210",
        address_name: "Home",
      },
      "asha@example.com"
    )
    expect(values.full_name).toBe("Asha Verma")
    expect(values.email).toBe("asha@example.com")
    expect(values.postal_code).toBe("400001")
    expect(values.city).toBe("Mumbai")
    expect(values.state).toBe("Maharashtra")
    expect(values.save_as).toBe("Home")
  })
})

describe("toCartShippingAddress", () => {
  it("builds the Medusa shipping payload from the delivery form", () => {
    const shipping = toCartShippingAddress({
      email: "asha@example.com",
      full_name: "Asha Verma",
      address_1: "Flat 12",
      address_2: "MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      postal_code: "400001",
      phone: "9876543210",
      save_as: "Work",
    })
    expect(shipping).toMatchObject({
      first_name: "Asha",
      last_name: "Verma",
      address_1: "Flat 12",
      address_2: "MG Road",
      city: "Mumbai",
      province: "Maharashtra",
      postal_code: "400001",
      country_code: "in",
      phone: "9876543210",
    })
  })
})
