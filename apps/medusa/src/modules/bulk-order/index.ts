import { Module } from "@medusajs/framework/utils"
import BulkOrderService from "./service"

export const BULK_ORDER = "bulkOrder"

export default Module(BULK_ORDER, {
  service: BulkOrderService,
})
