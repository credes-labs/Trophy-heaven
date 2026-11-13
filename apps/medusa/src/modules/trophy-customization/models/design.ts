import { model } from "@medusajs/framework/utils"

/**
 * A saved 2D/3D design (docs/kit/03 §3.3, 06 §6.1). `state_json` holds the full
 * Design2DState / Design3DState (or dual-mode envelope) validated at the API
 * boundary by @trophy-heaven/schemas. `customer_id` null = guest/session design.
 */
export const Design = model.define("design", {
  id: model.id({ prefix: "des" }).primaryKey(),
  customer_id: model.text().nullable(),
  name: model.text(),
  // Stored as text ("2d" | "3d"): GraphQL enum values can't start with a digit.
  // Validated against the literal union by @trophy-heaven/schemas at the API edge.
  mode: model.text(),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  state_json: model.json(),
  preview_url: model.text().nullable(),
  status: model
    .enum([
      "draft",
      "submitted_for_review",
      "changes_requested",
      "approved",
      "rejected_with_feedback",
    ])
    .default("draft"),
  is_template: model.boolean().default(false),
  share_token: model.text().nullable(),
  owner_token: model.text().nullable(),
  complexity: model.enum(["simple", "medium", "complex"]).nullable(),
})
