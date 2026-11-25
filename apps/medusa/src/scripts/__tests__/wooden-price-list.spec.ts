import { WOODEN_PRICE_LIST } from "../data/wooden-price-list"
import { sizeLabel, woodenSku } from "../catalog-updates"

describe("wooden price list", () => {
  it("labels sizes with the sheet's dimensions in cm", () => {
    expect(sizeLabel({ code: "A", width: 34, height: 40, price: 4065 })).toBe("A · 34 × 40 cm")
    expect(sizeLabel({ code: "AA", width: null, height: 26.5, price: 985 })).toBe("AA · 26.5 cm")
    expect(sizeLabel({ code: "C", width: null, height: null, price: 180 })).toBe("C")
  })

  it("has unique handles, unique SKUs and a price for every size", () => {
    const handles = WOODEN_PRICE_LIST.map((i) => i.handle)
    expect(new Set(handles).size).toBe(handles.length)
    const skus = WOODEN_PRICE_LIST.flatMap((i) => i.sizes.map((s) => woodenSku(i, s)))
    expect(new Set(skus).size).toBe(skus.length)
    for (const item of WOODEN_PRICE_LIST) {
      expect(item.sizes.length).toBeGreaterThan(0)
      for (const size of item.sizes) expect(size.price).toBeGreaterThan(0)
      const labels = item.sizes.map(sizeLabel)
      expect(new Set(labels).size).toBe(labels.length)
    }
  })

  it("uses the selling prices from sheet 1, not the cost sheet", () => {
    const item = WOODEN_PRICE_LIST.find((i) => i.itemNo === "808")!
    expect(item.sizes[0]).toEqual({ code: "1", width: 6, height: 7, price: 792.5 })
  })
})
