import { model } from "@medusajs/framework/utils"

/** Version-history snapshot of a design (docs/kit/06 §6.3, FR-DESIGN-4). */
export const DesignRevision = model.define("design_revision", {
  id: model.id({ prefix: "drev" }).primaryKey(),
  design_id: model.text(),
  state_json: model.json(),
  revision_number: model.number().default(0),
  created_by: model.text().nullable(),
})
