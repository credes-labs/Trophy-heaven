import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import type {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"

type Msg91Options = {
  auth_key: string
  sender_id?: string
  channels: string[]
}

type InjectedDependencies = { logger: Logger }

/**
 * MSG91 SMS notification provider (India, FR-NOTIF-2, docs/kit/03 §3.6). Sends a
 * transactional SMS via the MSG91 flow API. Verified in sandbox/test mode; no
 * real sends without a configured auth key.
 */
class Msg91NotificationService extends AbstractNotificationProviderService {
  static identifier = "msg91"

  protected readonly options_: Msg91Options
  protected readonly logger_: Logger

  constructor(container: InjectedDependencies, options: Msg91Options) {
    super()
    this.options_ = options
    this.logger_ = container.logger
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const message =
      (notification.content?.text as string) ||
      `Trophy Heaven: ${notification.template} ${JSON.stringify(notification.data ?? {})}`.slice(0, 300)

    try {
      const res = await fetch("https://control.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          authkey: this.options_.auth_key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: this.options_.sender_id,
          mobiles: notification.to,
          message,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`MSG91 error ${res.status}: ${body}`)
      }
      const json = (await res.json().catch(() => ({}))) as { request_id?: string }
      return { id: json.request_id }
    } catch (e) {
      this.logger_.error(`MSG91 send failed: ${(e as Error).message}`)
      throw e
    }
  }
}

export default Msg91NotificationService
