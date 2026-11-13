import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

/**
 * The gold awards photographed for the campaign set. Two pieces only: the
 * catalog is deliberately narrow; both figures now share the 2D/3D studio
 * with the engraved plaque.
 *
 * USD is the listed amount; INR is ×85, the same rule as the other collections.
 */
type Trophy = {
  title: string
  handle: string
  description: string
  category: string
  image: string
  usd: number
  material: string
  shape: string
}

const IMG = (file: string) => `/images/catalog/${file}`

const PIECES: Trophy[] = [
  {
    title: "Achievement Statuette",
    handle: "achievement-statuette",
    description:
      "A gilded figure in a classic stance, standing on a black marble plinth over a mahogany foot.",
    category: "Corporate",
    image: IMG("trophy-achievement-statuette.webp"),
    usd: 180,
    material: "brass",
    shape: "Achieve",
  },
  {
    title: "Ascent Figure Award",
    handle: "ascent-figure-award",
    description:
      "An open-shouldered figure rising through a ring, cast in brass and set on an octagonal mahogany base.",
    category: "Corporate",
    image: IMG("trophy-figure-award.webp"),
    usd: 240,
    material: "brass",
    shape: "Ascent",
  },
]

export const TROPHY_TITLES = PIECES.map((piece) => piece.title)
export const TROPHY_HANDLES = PIECES.map((piece) => piece.handle)

export function trophyCollectionProducts(opts: {
  salesChannelId: string
  categoryByName: Record<string, string>
  storefrontUrl: string
}): CreateProductWorkflowInputDTO[] {
  const origin = opts.storefrontUrl.replace(/\/$/, "")
  return PIECES.map((piece) => {
    const url = `${origin}${piece.image}`
    const inr = Math.round(piece.usd * 85)
    return {
      title: piece.title,
      handle: piece.handle,
      status: ProductStatus.PUBLISHED,
      category_ids: [opts.categoryByName[piece.category]].filter(Boolean),
      description: piece.description,
      thumbnail: url,
      images: [{ url }],
      sales_channels: [{ id: opts.salesChannelId }],
      metadata: { customization_level: "full_3d", material: piece.material, collection: "trophy" },
      options: [{ title: "Finish", values: ["Gilt brass"] }],
      variants: [
        {
          title: `${piece.title} — Gilt brass`,
          sku: generateSku({
            category: "Trop",
            shape: piece.shape,
            material: piece.material,
            size: "STD",
          }),
          options: { Finish: "Gilt brass" },
          prices: [
            { amount: inr, currency_code: "inr" },
            { amount: piece.usd, currency_code: "usd" },
          ],
          manage_inventory: true,
        },
      ],
    }
  })
}
