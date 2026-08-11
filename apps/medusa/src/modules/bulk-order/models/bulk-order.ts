import { model } from "@medusajs/framework/utils"

/**
 * A bulk/corporate order built from an uploaded recipient list (docs/kit/06 §6.6,
 * API 05.2). Lines are validated server-side; on confirm each valid line becomes
 * a Design + a cart line item.
 */
export const BulkOrder = model.define("bulk_order", {
  id: model.id({ prefix: "bulk" }).primaryKey(),
  customer_id: model.text(),
  corporate_profile_id: model.text().nullable(),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  po_number: model.text().nullable(),
  upload_file_url: model.text().nullable(),
  status: model
    .enum(["draft", "uploaded", "validated", "confirmed", "cancelled"])
    .default("draft"),
  total_items: model.number().default(0),
  cart_id: model.text().nullable(),
  lines: model.hasMany(() => BulkOrderLine, { mappedBy: "bulk_order" }),
})

/** One recipient row within a bulk order (docs/kit/06 §6.6). */
export const BulkOrderLine = model.define("bulk_order_line", {
  id: model.id({ prefix: "bulkline" }).primaryKey(),
  row_number: model.number(),
  name: model.text(),
  designation: model.text().nullable(),
  award_category: model.text().nullable(),
  design_id: model.text().nullable(),
  order_id: model.text().nullable(),
  preview_url: model.text().nullable(),
  validation_errors: model.json().nullable(),
  bulk_order: model.belongsTo(() => BulkOrder, { mappedBy: "lines" }),
})
