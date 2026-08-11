import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import type {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

type ResendOptions = {
  api_key: string
  from: string
  channels: string[]
}

type InjectedDependencies = { logger: Logger }

/**
 * Resend email notification provider (FR-NOTIF-1, docs/kit/03 §3.6). Uses the
 * Resend REST API. Templates map to subject + a simple HTML body; richer
 * templating (React Email) can be layered later. Verified in sandbox with a test
 * API key — no real sends without a configured key.
 */
class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected readonly options_: ResendOptions
  protected readonly logger_: Logger

  constructor(container: InjectedDependencies, options: ResendOptions) {
    super()
    this.options_ = options
    this.logger_ = container.logger
  }

  private renderSubject(template: string): string {
    const map: Record<string, string> = {
      "order-placed": "Your Legacy Crafts order is confirmed",
      "production-status": "Update on your custom order",
      "design-approved": "Your design was approved",
      "design-rejected": "Changes requested on your design",
      "corporate-invite": "You've been invited to a Legacy Crafts corporate account",
    }
    return map[template] ?? "Legacy Crafts notification"
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const subject =
      (notification.content?.subject as string) || this.renderSubject(notification.template)
    const html =
      (notification.content?.html as string) ||
      `<div style="font-family:sans-serif"><h2>${subject}</h2><pre>${JSON.stringify(
        notification.data ?? {},
        null,
        2
      )}</pre></div>`

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options_.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.options_.from,
          to: notification.to,
          subject,
          html,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Resend error ${res.status}: ${body}`)
      }
      const json = (await res.json()) as { id?: string }
      return { id: json.id }
    } catch (e) {
      this.logger_.error(`Resend send failed: ${(e as Error).message}`)
      throw e
    }
  }
}

export default ResendNotificationService
