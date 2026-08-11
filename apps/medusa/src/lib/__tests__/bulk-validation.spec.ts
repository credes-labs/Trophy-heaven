import { validateBulkRows } from "../bulk-validation"

describe("validateBulkRows", () => {
  it("accepts valid rows", () => {
    const res = validateBulkRows([
      { name: "Asha Rao", designation: "VP Sales", award_category: "Leadership" },
      { name: "Vikram Singh", designation: "Engineer" },
    ])
    expect(res.total).toBe(2)
    expect(res.valid).toBe(2)
    expect(res.invalid).toBe(0)
    expect(res.errors).toHaveLength(0)
  })

  it("flags missing names", () => {
    const res = validateBulkRows([{ designation: "Manager" }])
    expect(res.invalid).toBe(1)
    expect(res.errors[0]).toMatchObject({ row: 1, field: "name" })
  })

  it("flags duplicate name + designation", () => {
    const res = validateBulkRows([
      { name: "Asha Rao", designation: "VP" },
      { name: "Asha Rao", designation: "VP" },
    ])
    expect(res.invalid).toBe(1)
    expect(res.errors.some((e) => e.issue.includes("Duplicate"))).toBe(true)
  })

  it("enforces character limits", () => {
    const res = validateBulkRows([{ name: "x".repeat(200) }])
    expect(res.errors.some((e) => e.issue.includes("characters"))).toBe(true)
  })
})
