import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import Msg91NotificationService from "./service"

/** MSG91 SMS notification provider, registered under the Notification module. */
export default ModuleProvider(Modules.NOTIFICATION, {
  services: [Msg91NotificationService],
})
