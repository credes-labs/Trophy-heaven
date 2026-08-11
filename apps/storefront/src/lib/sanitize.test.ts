import { describe, it, expect } from "vitest"
import { sanitizeSvg, isAllowedLogo, ALLOWED_LOGO_TYPES } from "./sanitize"

describe("sanitizeSvg", () => {
  it("removes script tags", () => {
    const dirty = `<svg><script>alert(1)</script><rect/></svg>`
    const clean = sanitizeSvg(dirty)
    expect(clean).not.toContain("<script")
    expect(clean).toContain("<rect")
  })

  it("strips inline event handlers", () => {
    const dirty = `<svg><rect onload="steal()" onclick='x()'/></svg>`
    const clean = sanitizeSvg(dirty)
    expect(clean).not.toMatch(/onload/i)
    expect(clean).not.toMatch(/onclick/i)
  })

  it("neutralizes javascript: hrefs", () => {
    const dirty = `<svg><a xlink:href="javascript:alert(1)">x</a></svg>`
    const clean = sanitizeSvg(dirty)
    expect(clean).not.toMatch(/javascript:/i)
  })

  it("removes foreignObject", () => {
    const dirty = `<svg><foreignObject><iframe src="evil"></iframe></foreignObject></svg>`
    expect(sanitizeSvg(dirty)).not.toContain("foreignObject")
  })
})

describe("isAllowedLogo", () => {
  it("accepts png/jpeg/svg and rejects others", () => {
    expect(ALLOWED_LOGO_TYPES).toContain("image/svg+xml")
    expect(isAllowedLogo({ type: "image/png" } as File)).toBe(true)
    expect(isAllowedLogo({ type: "application/x-msdownload" } as File)).toBe(false)
  })
})
