import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

/**
 * The furniture the workshop actually makes, from the photography added in
 * `public/images/catalog/table-*.jpg`. Four pieces, all tables: the newsletter
 * and category tiles lean on them heavily, so titles are kept short enough to
 * set in the type sizes the storefront uses.
 *
 * USD is the listed amount; INR is ×85, the same rule as the sculpture
 * collection.
 */
type FurniturePiece = {
  title: string
  handle: string
  description: string
  category: string
  images: string[]
  usd: number
  material: string
  shape: string
}

const IMG = (file: string) => `/images/catalog/${file}`

const PIECES: FurniturePiece[] = [
  {
    title: "Brass Nesting Tables",
    handle: "brass-nesting-tables",
    description:
      "A pair of cast-brass tripod tables with shallow tray tops, sized to nest or split apart either side of a sofa.",
    category: "Tables",
    images: [IMG("table-brass-nesting-1.jpg"), IMG("table-brass-nesting-2.jpg")],
    usd: 640,
    material: "brass",
    shape: "Nest",
  },
  {
    title: "Marble-Top Side Table",
    handle: "marble-top-side-table",
    description:
      "A honed marble disc on a slim brass column, weighted by a solid stone foot.",
    category: "Tables",
    images: [IMG("table-marble-side.jpg")],
    usd: 780,
    material: "marble",
    shape: "Side",
  },
  {
    title: "Brass Hex Glass Table",
    handle: "brass-hex-glass-table",
    description:
      "A hexagonal glass top over a brass frame, sized low enough to sit beside a lounge chair.",
    category: "Tables",
    images: [IMG("table-brass-hex-glass.jpg")],
    usd: 920,
    material: "glass",
    shape: "Hex",
  },
  {
    title: "Marble Octagon Coffee Table",
    handle: "marble-octagon-coffee-table",
    description:
      "An octagonal marble slab on a brass base, cut so the grain runs uninterrupted across the top.",
    category: "Tables",
    images: [IMG("table-marble-octagon.jpg")],
    usd: 1150,
    material: "marble",
    shape: "Coffee",
  },
]

export const FURNITURE_TITLES = PIECES.map((piece) => piece.title)
export const FURNITURE_HANDLES = PIECES.map((piece) => piece.handle)

export function furnitureCollectionProducts(opts: {
  salesChannelId: string
  categoryByName: Record<string, string>
  storefrontUrl: string
}): CreateProductWorkflowInputDTO[] {
  const origin = opts.storefrontUrl.replace(/\/$/, "")
  return PIECES.map((piece) => {
    const urls = piece.images.map((path) => `${origin}${path}`)
    const inr = Math.round(piece.usd * 85)
    return {
      title: piece.title,
      handle: piece.handle,
      status: ProductStatus.PUBLISHED,
      category_ids: [opts.categoryByName[piece.category]].filter(Boolean),
      description: piece.description,
      thumbnail: urls[0],
      images: urls.map((url) => ({ url })),
      sales_channels: [{ id: opts.salesChannelId }],
      metadata: { customization_level: "none", material: piece.material, collection: "furniture" },
      options: [{ title: "Finish", values: ["Natural"] }],
      variants: [
        {
          title: `${piece.title} — Natural`,
          sku: generateSku({
            category: "Furn",
            shape: piece.shape,
            material: piece.material,
            size: "NAT",
          }),
          options: { Finish: "Natural" },
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
