import { Module } from "@medusajs/framework/utils"
import CorporateService from "./service"

export const CORPORATE_ACCOUNT = "corporateAccount"

export default Module(CORPORATE_ACCOUNT, {
  service: CorporateService,
})
