import { describe, expect, it } from "vitest"
import { cartLinePreviewUrl } from "./cart-line"

describe("cartLinePreviewUrl", () => {
  it("drops data-URL screenshots so cart metadata stays small", () => {
    expect(cartLinePreviewUrl("data:image/png;base64,abc")).toBeUndefined()
  })

  it("keeps hosted preview URLs", () => {
    expect(cartLinePreviewUrl("https://cdn.example.com/preview.png")).toBe(
      "https://cdn.example.com/preview.png"
    )
  })
})
