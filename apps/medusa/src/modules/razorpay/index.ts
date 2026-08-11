import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import RazorpayProviderService from "./service"

/**
 * Razorpay payment provider module (see docs/kit/03 §3.6, FR-PAY-1).
 * Registered under the Payment module in medusa-config.ts.
 */
export default ModuleProvider(Modules.PAYMENT, {
  services: [RazorpayProviderService],
})
