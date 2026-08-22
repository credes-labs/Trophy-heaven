import { Module } from "@medusajs/framework/utils"
import WebhookEventsService from "./service"

export const WEBHOOK_EVENTS = "webhookEvents"

export default Module(WEBHOOK_EVENTS, {
  service: WebhookEventsService,
})
