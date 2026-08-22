import { model } from "@medusajs/framework/utils"

export const WebhookEvent = model.define("webhook_event", {
  id: model.id({ prefix: "whevt" }).primaryKey(),
  provider: model.text(),
  event_id: model.text(),
  processed_at: model.dateTime(),
})
