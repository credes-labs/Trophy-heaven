import { describe, expect, it } from "vitest"
import { safeReturnPath } from "./safe-return-path"

describe("safeReturnPath", () => {
  it("allows same-origin storefront paths", () => {
    expect(safeReturnPath("/checkout")).toBe("/checkout")
    expect(safeReturnPath("/cart")).toBe("/cart")
    expect(safeReturnPath("/account/orders")).toBe("/account/orders")
  })

  it("rejects open redirects and auth loops", () => {
    expect(safeReturnPath("https://evil.example")).toBeNull()
    expect(safeReturnPath("//evil.example")).toBeNull()
    expect(safeReturnPath("/account/login")).toBeNull()
    expect(safeReturnPath("/account/register?next=/checkout")).toBeNull()
    expect(safeReturnPath(null)).toBeNull()
    expect(safeReturnPath("")).toBeNull()
  })
})
