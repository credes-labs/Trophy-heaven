import { MedusaService } from "@medusajs/framework/utils"
import { BulkOrder, BulkOrderLine } from "./models/bulk-order"
import { validateBulkRows, type RawBulkRow, type ValidatedLine } from "../../lib/bulk-validation"

/**
 * BulkOrderService — manages uploaded recipient lists and their validation
 * lifecycle (API 05.2, FR-CORP-*). Design/cart generation on confirm is
 * orchestrated by the API route which has access to the design + cart modules.
 */
class BulkOrderService extends MedusaService({
  BulkOrder,
  BulkOrderLine,
}) {
  /** Re-parse + re-validate rows and persist the resulting lines. */
  async replaceLines(bulkOrderId: string, rows: RawBulkRow[]) {
    const result = validateBulkRows(rows)

    // Clear any previously-parsed lines.
    const existing = await this.listBulkOrderLines({ bulk_order_id: bulkOrderId })
    if (existing.length) {
      await this.deleteBulkOrderLines(existing.map((l) => l.id))
    }

    if (result.lines.length) {
      await this.createBulkOrderLines(
        result.lines.map((l: ValidatedLine) => ({
          bulk_order_id: bulkOrderId,
          row_number: l.row_number,
          name: l.name,
          designation: l.designation,
          award_category: l.award_category,
          validation_errors: l.validation_errors as unknown as Record<string, unknown>,
        }))
      )
    }

    await this.updateBulkOrders({
      id: bulkOrderId,
      status: result.invalid === 0 ? "validated" : "uploaded",
      total_items: result.total,
    })

    return result
  }
}

export default BulkOrderService
