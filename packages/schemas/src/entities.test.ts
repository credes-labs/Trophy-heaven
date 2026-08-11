import { describe, it, expect } from "vitest"
import { DesignSchema } from "./design.js"
import { ProductionJobSchema } from "./production-job.js"
import { CorporateProfileSchema, TeamMemberSchema } from "./corporate.js"
import { BulkOrderLineSchema } from "./bulk-order.js"
import { DesignEnvelope } from "./design-envelope.js"

const now = new Date().toISOString()

describe("DesignSchema", () => {
  it("accepts a valid design and defaults status to draft", () => {
    const parsed = DesignSchema.parse({
      id: "des_1",
      customer_id: null,
      name: "Acme MVP",
      mode: "2d",
      product_id: "prod_1",
      variant_id: null,
      state_json: { version: 1 },
      preview_url: null,
      share_token: null,
      complexity: null,
      created_at: now,
      updated_at: now,
    })
    expect(parsed.status).toBe("draft")
    expect(parsed.is_template).toBe(false)
  })

  it("rejects an empty name", () => {
    const res = DesignSchema.safeParse({
      id: "des_1",
      customer_id: null,
      name: "",
      mode: "2d",
      product_id: "prod_1",
      variant_id: null,
      state_json: {},
      preview_url: null,
      share_token: null,
      complexity: null,
      created_at: now,
      updated_at: now,
    })
    expect(res.success).toBe(false)
  })
})

describe("ProductionJobSchema", () => {
  it("defaults status + empty notes", () => {
    const parsed = ProductionJobSchema.parse({
      id: "pj_1",
      order_id: "order_1",
      order_line_item_id: "li_1",
      design_id: "des_1",
      complexity: "medium",
      material: "crystal",
      assigned_workshop: null,
      estimated_completion: null,
      started_at: null,
      completed_at: null,
      created_at: now,
      updated_at: now,
    })
    expect(parsed.status).toBe("pending_design_approval")
    expect(parsed.notes).toEqual([])
  })
})

describe("CorporateProfileSchema / TeamMemberSchema", () => {
  it("defaults payment terms to prepaid and unverified", () => {
    const parsed = CorporateProfileSchema.parse({
      id: "corp_1",
      customer_id: "cus_1",
      company_name: "Acme Inc",
      tax_id: "GST123",
      account_manager_id: null,
      created_at: now,
      updated_at: now,
    })
    expect(parsed.payment_terms).toBe("prepaid")
    expect(parsed.credit_limit).toBe(0)
    expect(parsed.is_verified).toBe(false)
  })

  it("rejects an invalid team member email", () => {
    const res = TeamMemberSchema.safeParse({
      id: "tm_1",
      corporate_profile_id: "corp_1",
      email: "not-an-email",
      customer_id: null,
      created_at: now,
      updated_at: now,
    })
    expect(res.success).toBe(false)
  })
})

describe("BulkOrderLineSchema", () => {
  it("requires a positive row number and defaults validation_errors", () => {
    const parsed = BulkOrderLineSchema.parse({
      id: "bol_1",
      bulk_order_id: "bo_1",
      row_number: 1,
      name: "Jane Doe",
      designation: "MVP",
      award_category: "Sales",
      design_id: null,
      order_id: null,
    })
    expect(parsed.validation_errors).toEqual([])
  })

  it("rejects row_number 0", () => {
    const res = BulkOrderLineSchema.safeParse({
      id: "bol_1",
      bulk_order_id: "bo_1",
      row_number: 0,
      name: "Jane",
      designation: null,
      award_category: null,
      design_id: null,
      order_id: null,
    })
    expect(res.success).toBe(false)
  })
})

describe("DesignEnvelope", () => {
  it("accepts a dual-mode envelope with shared fields", () => {
    const parsed = DesignEnvelope.parse({
      shared: { engravingText: "Champion", material: "polished_gold" },
      "3d": {
        version: 1,
        baseModelId: "cup",
        material: "polished_gold",
        engraving: null,
        logo: null,
      },
    })
    expect(parsed.shared.material).toBe("polished_gold")
    expect(parsed["3d"]?.baseModelId).toBe("cup")
  })
})
