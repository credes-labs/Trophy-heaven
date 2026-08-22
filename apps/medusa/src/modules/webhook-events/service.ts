import { MedusaService } from "@medusajs/framework/utils"
import { WebhookEvent } from "./models/webhook-event"

class WebhookEventsService extends MedusaService({
  WebhookEvent,
}) {
  /** Returns true when this provider event id was already processed. */
  async hasProcessed(provider: string, eventId: string) {
    const existing = await this.listWebhookEvents(
      { provider, event_id: eventId },
      { take: 1 }
    )
    return existing.length > 0
  }

  async markProcessed(provider: string, eventId: string) {
    return this.createWebhookEvents({
      provider,
      event_id: eventId,
      processed_at: new Date(),
    })
  }
}

export default WebhookEventsService
