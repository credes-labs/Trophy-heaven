import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import ResendNotificationService from "./service"

/** Resend email notification provider, registered under the Notification module. */
export default ModuleProvider(Modules.NOTIFICATION, {
  services: [ResendNotificationService],
})
