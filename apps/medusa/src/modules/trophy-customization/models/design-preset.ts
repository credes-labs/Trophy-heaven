import { model } from "@medusajs/framework/utils"

/** A template a customer can clone and modify (docs/kit/06 §6.2). */
export const DesignPreset = model.define("design_preset", {
  id: model.id({ prefix: "dpr" }).primaryKey(),
  name: model.text(),
  category: model.text(),
  occasion: model.text().nullable(),
  // Text ("2d" | "3d" | "both") — see note in design.ts on digit-leading enums.
  mode: model.text(),
  base_product_id: model.text(),
  default_state_json: model.json(),
  preview_url: model.text(),
  is_active: model.boolean().default(true),
  sort_order: model.number().default(0),
})
