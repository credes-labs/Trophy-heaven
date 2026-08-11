import { generateSku } from "../sku"

describe("generateSku", () => {
  it("builds LC-{category}-{shape}-{material}-{size}", () => {
    expect(
      generateSku({ category: "Crystal", shape: "Star", material: "Crystal", size: "8IN" })
    ).toBe("LC-CRYS-STAR-CRYSTA-8IN")
  })

  it("strips non-alphanumerics and uppercases", () => {
    expect(
      generateSku({ category: "Home Decor", shape: "va-se!", material: "rose gold", size: "M (8\")" })
    ).toBe("LC-HOME-VASE-ROSEGO-M8")
  })

  it("falls back to NA for empty segments", () => {
    expect(generateSku({ category: "", shape: "", material: "", size: "" })).toBe(
      "LC-NA-NA-NA-NA"
    )
  })
})
