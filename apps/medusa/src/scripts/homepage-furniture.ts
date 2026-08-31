import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

type HomepagePiece = {
  title: string
  handle: string
  description: string
  category: string
  image: string
  usd: number
  material: string
  shape: string
}

/** Homepage catalog + explore pieces (Figma copy). USD is the listed amount; INR is ×85. */
const PIECES: HomepagePiece[] = [
  {
    title: "Luno 210 lounge chair",
    handle: "luno-210-lounge-chair",
    description: "Walnut lounge chair with oatmeal bouclé upholstery.",
    category: "Chairs",
    image: "/images/catalog/seating-lounge.jpg",
    usd: 1980,
    material: "walnut",
    shape: "Lounge",
  },
  {
    title: "Verra wooden dining table",
    handle: "verra-wooden-dining-table",
    description: "Oval walnut dining table with gold-capped chairs.",
    category: "Tables",
    image: "/images/catalog/tables-dining.jpg",
    usd: 3450,
    material: "walnut",
    shape: "Dining",
  },
  {
    title: "Noir leather armchair",
    handle: "noir-leather-armchair",
    description: "Walnut armchair with taupe bouclé cushions.",
    category: "Chairs",
    image: "/images/catalog/seating-armchair.jpg",
    usd: 2250,
    material: "leather",
    shape: "Arm",
  },
  {
    title: "Aura minimal sideboard",
    handle: "aura-minimal-sideboard",
    description: "Minimal walnut sideboard with brass handles.",
    category: "Cabinets",
    image: "/images/catalog/storage-shelf.jpg",
    usd: 1720,
    material: "walnut",
    shape: "Sidebd",
  },
  {
    title: "Sola oval coffee table",
    handle: "sola-oval-coffee-table",
    description: "Low oval wood coffee table with brass inlay.",
    category: "Tables",
    image: "/images/catalog/tables-coffee.jpg",
    usd: 1280,
    material: "wood",
    shape: "Coffee",
  },
  {
    title: "Orbit glass side table",
    handle: "orbit-glass-side-table",
    description: "Round fluted-glass side table with walnut legs.",
    category: "Tables",
    image: "/images/catalog/tables-side.jpg",
    usd: 890,
    material: "glass",
    shape: "Side",
  },
  {
    title: "Kino bouclé lounge",
    handle: "kino-boucle-lounge",
    description: "Walnut lounge chair in a warm plaster interior.",
    category: "Chairs",
    image: "/images/catalog/seating-lounge.jpg",
    usd: 2140,
    material: "walnut",
    shape: "Kino",
  },
  {
    title: "Halo walnut shelf",
    handle: "halo-walnut-shelf",
    description: "Four-tier walnut shelf with brass legs.",
    category: "Shelves",
    image: "/images/catalog/storage-shelf.jpg",
    usd: 1640,
    material: "walnut",
    shape: "Halo",
  },
  {
    title: "Mara dining chair",
    handle: "mara-dining-chair",
    description: "Dining armchair with brass-tipped legs.",
    category: "Chairs",
    image: "/images/catalog/seating-armchair.jpg",
    usd: 740,
    material: "walnut",
    shape: "Mara",
  },
  {
    title: "Nera dining table",
    handle: "nera-dining-table",
    description: "Walnut dining table with gold-capped chairs.",
    category: "Tables",
    image: "/images/catalog/tables-dining.jpg",
    usd: 3120,
    material: "walnut",
    shape: "Nera",
  },
  {
    title: "Pebble coffee table",
    handle: "pebble-coffee-table",
    description: "Sculptural wood coffee table on a navy rug.",
    category: "Tables",
    image: "/images/catalog/tables-coffee.jpg",
    usd: 1150,
    material: "wood",
    shape: "Pebble",
  },
  {
    title: "Lumen side table",
    handle: "lumen-side-table",
    description: "Glass and walnut side table.",
    category: "Tables",
    image: "/images/catalog/tables-side.jpg",
    usd: 640,
    material: "glass",
    shape: "Lumen",
  },
  {
    title: "Oslo Leather",
    handle: "oslo-leather",
    description: "Walnut lounge chair with cream bouclé.",
    category: "Chairs",
    image: "/images/explore/oslo-leather.jpg",
    usd: 1250,
    material: "leather",
    shape: "Oslo",
  },
  {
    title: "Nova Oak",
    handle: "nova-oak",
    description: "Oval oak coffee table with brass inlay.",
    category: "Tables",
    image: "/images/explore/nova-oak.jpg",
    usd: 720,
    material: "oak",
    shape: "Nova",
  },
  {
    title: "Aria Minimal",
    handle: "aria-minimal",
    description: "Walnut bookshelf with brass posts and warm shelf lighting.",
    category: "Shelves",
    image: "/images/explore/aria-minimal.jpg",
    usd: 980,
    material: "walnut",
    shape: "Aria",
  },
  {
    title: "Eclipse Maple",
    handle: "eclipse-maple",
    description: "Oval maple dining table with cream chairs.",
    category: "Tables",
    image: "/images/explore/eclipse-maple.jpg",
    usd: 860,
    material: "maple",
    shape: "Eclips",
  },
  {
    title: "Sierra Fabric",
    handle: "sierra-fabric",
    description: "Bouclé armchair with walnut frame.",
    category: "Chairs",
    image: "/images/explore/sierra-fabric.jpg",
    usd: 1420,
    material: "fabric",
    shape: "Sierra",
  },
  {
    title: "Vertex Glass",
    handle: "vertex-glass",
    description: "Fluted-glass side table with walnut legs and brass clips.",
    category: "Tables",
    image: "/images/explore/vertex-glass.jpg",
    usd: 230,
    material: "glass",
    shape: "Vertex",
  },
  {
    title: "Luna Brass",
    handle: "luna-brass",
    description: "Brass floor lamp beside a walnut sideboard.",
    category: "Lamps",
    image: "/images/explore/luna-brass.jpg",
    usd: 890,
    material: "brass",
    shape: "Luna",
  },
  {
    title: "Woven Jute",
    handle: "woven-jute",
    description: "Woven jute rug in a forest-green living room.",
    category: "Wall Art",
    image: "/images/explore/woven-jute.jpg",
    usd: 530,
    material: "jute",
    shape: "Rug",
  },
  {
    title: "Haven Pine",
    handle: "haven-pine",
    description: "Walnut nightstand with a brass mushroom lamp.",
    category: "Cabinets",
    image: "/images/explore/haven-pine.jpg",
    usd: 780,
    material: "pine",
    shape: "Haven",
  },
]

export const HOMEPAGE_FURNITURE_TITLES = PIECES.map((piece) => piece.title)
export const HOMEPAGE_FURNITURE_HANDLES = PIECES.map((piece) => piece.handle)

export function homepageFurnitureProducts(opts: {
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
      metadata: { customization_level: "none", material: piece.material, homepage: true },
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
