import { model } from "@medusajs/framework/utils"

/**
 * A production/fulfillment task created per custom line item, routed by
 * complexity + material (docs/kit/06 §6.4, API 05.3).
 */
export const ProductionJob = model.define("production_job", {
  id: model.id({ prefix: "pjob" }).primaryKey(),
  order_id: model.text(),
  order_line_item_id: model.text(),
  design_id: model.text(),
  status: model
    .enum([
      "pending_design_approval",
      "design_approved",
      "queued",
      "in_production",
      "quality_check",
      "packed",
      "completed",
      "on_hold",
      "cancelled",
    ])
    .default("pending_design_approval"),
  complexity: model.enum(["simple", "medium", "complex"]),
  material: model.text(),
  assigned_workshop: model.text().nullable(),
  estimated_completion: model.dateTime().nullable(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  tracking_number: model.text().nullable(),
  shipping_carrier: model.text().nullable(),
  notes: model.json().nullable(),
})
