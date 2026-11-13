import { generateSku } from "../sku"

describe("generateSku", () => {
  it("builds TH-{category}-{shape}-{material}-{size}", () => {
    expect(
      generateSku({ category: "Crystal", shape: "Star", material: "Crystal", size: "8IN" })
    ).toBe("TH-CRYS-STAR-CRYSTA-8IN")
  })

  it("strips non-alphanumerics and uppercases", () => {
    expect(
      generateSku({ category: "Gift Sets", shape: "cu-p!", material: "rose gold", size: "M (8\")" })
    ).toBe("TH-GIFT-CUP-ROSEGO-M8")
  })

  it("falls back to NA for empty segments", () => {
    expect(generateSku({ category: "", shape: "", material: "", size: "" })).toBe(
      "TH-NA-NA-NA-NA"
    )
  })
})
