import { describe, expect, it } from "vitest"
import { isBareRoute, isHomePath } from "./site-chrome"

describe("isHomePath", () => {
  it("treats the ISR render path of the root as home", () => {
    expect(isHomePath("/")).toBe(true)
    expect(isHomePath("/index")).toBe(true)
  })

  it("keeps inner pages on the site header", () => {
    expect(isHomePath("/shop")).toBe(false)
    expect(isHomePath("/products/index")).toBe(false)
    expect(isHomePath(null)).toBe(false)
  })
})

describe("isBareRoute", () => {
  it("hides chrome only on the studio screens", () => {
    expect(isBareRoute("/customize")).toBe(true)
    expect(isBareRoute("/customize/prod_1/2d")).toBe(true)
    expect(isBareRoute("/")).toBe(false)
  })
})
