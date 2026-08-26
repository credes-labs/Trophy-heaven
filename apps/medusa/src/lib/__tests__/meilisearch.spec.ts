import { meiliFilterValue, lowestInrPrice } from "../meilisearch"

describe("meiliFilterValue", () => {
  it("escapes quotes so facet values cannot close the filter", () => {
    expect(meiliFilterValue(`crystal" OR category = "hack`)).toBe(
      `crystal\\" OR category = \\"hack`
    )
  })
})

describe("lowestInrPrice", () => {
  it("takes the cheapest INR amount across variants", () => {
    expect(
      lowestInrPrice([
        { prices: [{ currency_code: "usd", amount: 10 }, { currency_code: "inr", amount: 2499 }] },
        { prices: [{ currency_code: "inr", amount: 1299 }] },
      ])
    ).toBe(1299)
  })
})
