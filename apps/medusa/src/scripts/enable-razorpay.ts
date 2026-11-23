import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Offers Razorpay in the India region. Run once after setting RAZORPAY_KEY_ID and
 * RAZORPAY_KEY_SECRET on a database seeded without them. Idempotent.
 *
 *   npx medusa exec ./src/scripts/enable-razorpay.js   (from .medusa/server in production)
 */
export default async function enableRazorpay({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET first.")
  }
  const [india] = await container.resolve(Modules.REGION).listRegions({ name: "India" })
  if (!india) throw new Error("No India region. Run the bootstrap script first.")

  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: india.id },
      update: { payment_providers: ["pp_razorpay_razorpay", "pp_system_default"] },
    },
  })
  logger.info("enable-razorpay: Razorpay is available in the India region")
}
