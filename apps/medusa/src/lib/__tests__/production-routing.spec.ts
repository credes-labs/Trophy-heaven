import {
  canTransition,
  inferComplexity,
  routeWorkshop,
  slaDays,
} from "../production-routing"

describe("production routing", () => {
  it("allows valid transitions and rejects invalid ones", () => {
    expect(canTransition("queued", "in_production")).toBe(true)
    expect(canTransition("pending_design_approval", "completed")).toBe(false)
    expect(canTransition("completed", "queued")).toBe(false)
  })

  it("infers complexity from design state", () => {
    expect(inferComplexity("3d", {})).toBe("complex")
    expect(inferComplexity("2d", { objects: [{ type: "text" }] })).toBe("simple")
    expect(inferComplexity("2d", { objects: [{ type: "image" }, { type: "text" }] })).toBe("medium")
  })

  it("routes to workshops by complexity + material", () => {
    expect(routeWorkshop("complex", "gold")).toBe("workshop-master")
    expect(routeWorkshop("simple", "clear_crystal")).toBe("workshop-specialty")
    expect(routeWorkshop("simple", "polished_gold")).toBe("workshop-metal")
    expect(routeWorkshop("medium", "wood")).toBe("workshop-general")
  })

  it("scales SLA with complexity", () => {
    expect(slaDays("simple")).toBeLessThan(slaDays("complex"))
  })
})
