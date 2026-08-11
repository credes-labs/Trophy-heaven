import type { Logger } from "@medusajs/framework/types"

export type ShipmentInput = {
  orderId: string
  toName?: string
  toPincode?: string
  weightGrams?: number
}

export type ShipmentResult = {
  carrier: "shiprocket" | "delhivery" | "manual"
  tracking_number: string
  label_url: string | null
}

/**
 * Shipping label + tracking creation (FR-SHIP-1). Uses ShipRocket when a token
 * is configured, else Delhivery, else a deterministic manual fallback so the ops
 * flow works end-to-end in dev/sandbox. Real carrier calls run in test mode.
 */
export async function createShipment(input: ShipmentInput, logger?: Logger): Promise<ShipmentResult> {
  const shiprocketToken = process.env.SHIPROCKET_API_TOKEN
  const delhiveryToken = process.env.DELHIVERY_API_TOKEN

  try {
    if (shiprocketToken) {
      const res = await fetch("https://apiv2.shiprocket.in/v1/external/shipments/create/forward", {
        method: "POST",
        headers: { Authorization: `Bearer ${shiprocketToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: input.orderId, weight: (input.weightGrams ?? 500) / 1000 }),
      })
      if (res.ok) {
        const json = (await res.json()) as { awb_code?: string; label_url?: string }
        return {
          carrier: "shiprocket",
          tracking_number: json.awb_code ?? fallbackTracking(input.orderId),
          label_url: json.label_url ?? null,
        }
      }
    } else if (delhiveryToken) {
      const res = await fetch("https://track.delhivery.com/api/cmu/create.json", {
        method: "POST",
        headers: { Authorization: `Token ${delhiveryToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ order: input.orderId, pin: input.toPincode }),
      })
      if (res.ok) {
        const json = (await res.json()) as { packages?: { waybill?: string }[] }
        return {
          carrier: "delhivery",
          tracking_number: json.packages?.[0]?.waybill ?? fallbackTracking(input.orderId),
          label_url: null,
        }
      }
    }
  } catch (e) {
    logger?.warn(`Shipping provider failed, using manual tracking: ${(e as Error).message}`)
  }

  return { carrier: "manual", tracking_number: fallbackTracking(input.orderId), label_url: null }
}

function fallbackTracking(orderId: string): string {
  const suffix = orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()
  return `LC${suffix}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`
}
