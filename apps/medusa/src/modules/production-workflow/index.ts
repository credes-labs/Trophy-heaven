import { Module } from "@medusajs/framework/utils"
import ProductionWorkflowService from "./service"

export const PRODUCTION_WORKFLOW = "productionWorkflow"

export default Module(PRODUCTION_WORKFLOW, {
  service: ProductionWorkflowService,
})
