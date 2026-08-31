import { describe, expect, it } from "vitest"
import { EXPLORE_PRODUCTS } from "../explore/constants"
import { PRODUCTS_BY_TAB } from "./constants"

const PDP = /^\/products\/[a-z0-9-]+$/

describe("homepage product links", () => {
  it("sends catalog rail cards to a product page, not /shop", () => {
    const hrefByName = new Map<string, string>()
    for (const list of Object.values(PRODUCTS_BY_TAB)) {
      for (const product of list) {
        expect(product.href).toMatch(PDP)
        const previous = hrefByName.get(product.name)
        if (previous) expect(product.href).toBe(previous)
        else hrefByName.set(product.name, product.href)
      }
    }
  })

  it("sends explore cards to a product page, not /shop", () => {
    for (const product of EXPLORE_PRODUCTS) {
      expect(product.href).toMatch(PDP)
    }
  })
})
