import { describe, it, expect } from "vitest"
import type { HttpTypes } from "@medusajs/types"
import {
  isCustomizableProduct,
  matchesMaterial,
  productInStock,
  productPrice,
  variantInStock,
} from "./product-filters"

function product(partial: Partial<HttpTypes.StoreProduct>): HttpTypes.StoreProduct {
  return partial as HttpTypes.StoreProduct
}

describe("productPrice", () => {
  it("returns the lowest calculated amount across variants", () => {
    const p = product({
      variants: [
        { calculated_price: { calculated_amount: 2499 } },
        { calculated_price: { calculated_amount: 1299 } },
      ] as HttpTypes.StoreProductVariant[],
    })
    expect(productPrice(p)).toBe(1299)
  })
  it("returns null when no prices are available", () => {
    expect(productPrice(product({ variants: [] }))).toBeNull()
  })
})

describe("matchesMaterial", () => {
  it("matches metadata.material case-insensitively", () => {
    const p = product({ metadata: { material: "crystal" }, title: "Award" })
    expect(matchesMaterial(p, "Crystal")).toBe(true)
    expect(matchesMaterial(p, "Wood")).toBe(false)
  })
  it("falls back to a text haystack", () => {
    const p = product({ title: "Walnut Dining Table", description: "Solid wood" })
    expect(matchesMaterial(p, "walnut")).toBe(true)
  })
})

describe("variantInStock", () => {
  it("is in stock when inventory is unmanaged", () => {
    expect(variantInStock({ manage_inventory: false, allow_backorder: false })).toBe(true)
  })
  it("is in stock when backorders are allowed", () => {
    expect(
      variantInStock({ manage_inventory: true, allow_backorder: true, inventory_quantity: 0 })
    ).toBe(true)
  })
  it("depends on quantity when managed without backorders", () => {
    expect(
      variantInStock({ manage_inventory: true, allow_backorder: false, inventory_quantity: 3 })
    ).toBe(true)
    expect(
      variantInStock({ manage_inventory: true, allow_backorder: false, inventory_quantity: 0 })
    ).toBe(false)
  })
})

describe("productInStock", () => {
  it("is true when any variant is in stock", () => {
    const p = product({
      variants: [
        { manage_inventory: true, allow_backorder: false, inventory_quantity: 0 },
        { manage_inventory: true, allow_backorder: false, inventory_quantity: 2 },
      ] as HttpTypes.StoreProductVariant[],
    })
    expect(productInStock(p)).toBe(true)
  })
  it("is false with no variants", () => {
    expect(productInStock(product({ variants: [] }))).toBe(false)
  })
})

describe("isCustomizableProduct", () => {
  it("reads customization_level from metadata", () => {
    expect(isCustomizableProduct(product({ metadata: { customization_level: "text_only" } }))).toBe(true)
    expect(isCustomizableProduct(product({ metadata: { customization_level: "none" } }))).toBe(false)
    expect(isCustomizableProduct(product({ metadata: null }))).toBe(false)
  })
})
