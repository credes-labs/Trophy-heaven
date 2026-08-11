import { evaluateReturnEligibility } from "../returns-policy"

const now = new Date("2026-01-10T00:00:00Z")

describe("returns policy", () => {
  it("marks custom items non-returnable", () => {
    const r = evaluateReturnEligibility(
      [{ line_item_id: "li_1", title: "Custom trophy", is_custom: true }],
      new Date("2026-01-09T00:00:00Z"),
      now
    )
    expect(r.lines[0].eligible).toBe(false)
    expect(r.lines[0].reason).toMatch(/non-returnable/i)
  })

  it("allows standard items within the 7-day window", () => {
    const r = evaluateReturnEligibility(
      [{ line_item_id: "li_2", title: "Standard vase", is_custom: false }],
      new Date("2026-01-06T00:00:00Z"),
      now
    )
    expect(r.window_open).toBe(true)
    expect(r.lines[0].eligible).toBe(true)
  })

  it("rejects standard items past the window", () => {
    const r = evaluateReturnEligibility(
      [{ line_item_id: "li_3", title: "Standard vase", is_custom: false }],
      new Date("2026-01-01T00:00:00Z"),
      now
    )
    expect(r.window_open).toBe(false)
    expect(r.lines[0].eligible).toBe(false)
  })
})
