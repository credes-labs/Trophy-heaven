import { model } from "@medusajs/framework/utils"

/** A review record + feedback for a submitted design (docs/kit/06 §6.5, API 05.3). */
export const DesignApproval = model.define("design_approval", {
  id: model.id({ prefix: "dappr" }).primaryKey(),
  design_id: model.text(),
  reviewer_id: model.text().nullable(),
  status: model.enum(["pending", "approved", "rejected", "changes_requested"]).default("pending"),
  feedback: model.text().nullable(),
  annotated_image_url: model.text().nullable(),
  resolved_at: model.dateTime().nullable(),
})
