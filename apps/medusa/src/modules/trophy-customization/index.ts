import { Module } from "@medusajs/framework/utils"
import DesignService from "./service"

export const TROPHY_CUSTOMIZATION = "trophyCustomization"

export default Module(TROPHY_CUSTOMIZATION, {
  service: DesignService,
})
