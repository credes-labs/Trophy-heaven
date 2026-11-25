import { describe, expect, it } from "vitest"
import { EDITION_PRODUCTS, editionFilters, withLiveDetails, ALL_PIECES } from "./constants"

const [first, second] = EDITION_PRODUCTS

describe("withLiveDetails", () => {
  it("keeps the coded tiles when the backend gave no data", () => {
    expect(withLiveDetails(EDITION_PRODUCTS, null)).toEqual(EDITION_PRODUCTS)
  })

  it("shows the admin's name and price in the coded placement", () => {
    const [tile] = withLiveDetails([first], { [first.id]: { title: "Renamed", amount: 1999 } })
    expect(tile).toMatchObject({ id: first.id, name: "Renamed", amount: 1999, price: "₹1,999" })
  })

  it("keeps the coded price when the product has no price for the region", () => {
    const [tile] = withLiveDetails([first], { [first.id]: { title: first.name, amount: null } })
    expect(tile.amount).toBe(first.amount)
  })

  it("drops tiles whose product was deleted or unpublished", () => {
    const tiles = withLiveDetails([first, second], { [second.id]: { title: second.name, amount: 10 } })
    expect(tiles.map((t) => t.id)).toEqual([second.id])
  })
})

describe("editionFilters", () => {
  it("lists only categories that still have a tile", () => {
    expect(editionFilters([first])).toEqual([ALL_PIECES, first.category])
  })
})

describe("edition prices", () => {
  it("shows paise only when the price has them", () => {
    const [tile] = withLiveDetails([first], { [first.id]: { title: first.name, amount: 1412.5 } })
    expect(tile.price).toBe("₹1,412.50")
  })
})
