import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

/**
 * Trophy Heaven catalogue. The two gilt figures are the 3D studio pieces.
 * The rest are the photographed awards (brand stills) so the shop is not
 * three cards. USD is the listed amount; INR is ×85.
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
  /** Storefront customization filter. Only the two studio figures are full 3D. */
  customization: "none" | "text_only" | "text_and_logo" | "full_3d"
  finish: string
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
    customization: "full_3d",
    finish: "Gilt brass",
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
    customization: "full_3d",
    finish: "Gilt brass",
  },
  {
    title: "Laurel Cup",
    handle: "laurel-cup",
    description:
      "A gold cup on a marbled burgundy base, finished with a laurel and left ready for an engraved name.",
    category: "Sports",
    image: "/images/brand/gold-cup.webp",
    usd: 160,
    material: "brass",
    shape: "Laurel",
    customization: "text_only",
    finish: "Gilt brass",
  },
  {
    title: "Pedestal Cup",
    handle: "pedestal-cup",
    description:
      "A two-handled gold cup raised on a marble block, for the centre of a presentation table.",
    category: "Metal",
    image: "/images/brand/cup-pedestal.webp",
    usd: 220,
    material: "brass",
    shape: "Pedstl",
    customization: "text_only",
    finish: "Gilt brass",
  },
  {
    title: "Flame Award",
    handle: "flame-award",
    description: "A gilt flame rising from a black base, cast for a corporate or memorial presentation.",
    category: "Corporate",
    image: "/images/brand/flame-award.webp",
    usd: 190,
    material: "brass",
    shape: "Flame",
    customization: "text_only",
    finish: "Gilt brass",
  },
  {
    title: "Palace Crystal",
    handle: "palace-crystal",
    description:
      "A crystal block etched with a palace, set on a cream pedestal so the cut carries the light.",
    category: "Crystal",
    image: IMG("palace-crystal.webp"),
    usd: 260,
    material: "crystal",
    shape: "Palace",
    customization: "text_only",
    finish: "Optical crystal",
  },
  {
    title: "Ribbon Medallion",
    handle: "ribbon-medallion",
    description: "A gold and red ribbon award on a cream pedestal, for sports days and annual honours.",
    category: "Sports",
    image: IMG("ribbon-medallion.webp"),
    usd: 140,
    material: "brass",
    shape: "Ribbon",
    customization: "text_only",
    finish: "Gilt and enamel",
  },
  {
    title: "Excellence Crystal",
    handle: "excellence-crystal",
    description: "A crystal excellence award, presented with a certificate for a formal ceremony.",
    category: "Corporate",
    image: "/images/brand/presentation-hands.webp",
    usd: 210,
    material: "crystal",
    shape: "Excel",
    customization: "text_only",
    finish: "Optical crystal",
  },
]

export const TROPHY_TITLES = PIECES.map((piece) => piece.title)
export const TROPHY_HANDLES = PIECES.map((piece) => piece.handle)
/** The two figures that have studio models. Other handles stay engraving-only. */
export const STUDIO_HANDLES = PIECES.filter((piece) => piece.customization === "full_3d").map(
  (piece) => piece.handle,
)

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
      metadata: {
        customization_level: piece.customization,
        material: piece.material,
        collection: "trophy",
      },
      options: [{ title: "Finish", values: [piece.finish] }],
      variants: [
        {
          title: `${piece.title} — ${piece.finish}`,
          sku: generateSku({
            category: "Trop",
            shape: piece.shape,
            material: piece.material,
            size: "STD",
          }),
          options: { Finish: piece.finish },
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
