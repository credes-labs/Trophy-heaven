import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

/**
 * Sculpture collection surfaced from `public/images/catalog/sculpture-*.jpg`.
 * Variant shots of one object stay together as the PDP gallery; each file is
 * listed once, first image becomes the thumbnail.
 */
type Sculpture = {
  title: string
  handle: string
  description: string
  images: string[]
  /** Listed USD price. INR is ×85, matching homepage-furniture.ts. */
  usd: number
  material: string
  shape: string
}

const IMG = (file: string) => `/images/catalog/${file}`

const PIECES: Sculpture[] = [
  {
    title: "Verdigris Loop Sculpture",
    handle: "verdigris-loop-sculpture",
    description:
      "Two bronze loops folded through each other, patinated to a deep verdigris and set on a marble plinth.",
    images: [
      IMG("sculpture-loop-verdigris-1.jpg"),
      IMG("sculpture-loop-verdigris-2.jpg"),
      IMG("sculpture-loop-verdigris-3.jpg"),
    ],
    usd: 420,
    material: "bronze",
    shape: "Loop",
  },
  {
    title: "Pierced Bronze Disc",
    handle: "pierced-bronze-disc",
    description:
      "A cast bronze disc cut with almond apertures, its surface formed by hand so no two casts fall alike.",
    images: [
      IMG("sculpture-disc-pierced-1.jpg"),
      IMG("sculpture-disc-pierced-2.jpg"),
      IMG("sculpture-disc-pierced-3.jpg"),
      IMG("sculpture-disc-pierced-4.jpg"),
    ],
    usd: 380,
    material: "bronze",
    shape: "Disc",
  },
  {
    title: "Split Rib Sculpture",
    handle: "split-rib-sculpture",
    description:
      "A disc split down its axis, ribbed like a seed pod and finished in blackened bronze.",
    images: [IMG("sculpture-split-rib.jpg")],
    usd: 340,
    material: "bronze",
    shape: "Disc",
  },
  {
    title: "Sunburst Disc Sculpture",
    handle: "sunburst-disc-sculpture",
    description:
      "Radiating fins cast from a single centre, realising the sun motif as a tabletop objet.",
    images: [IMG("sculpture-sunburst-disc.jpg")],
    usd: 395,
    material: "bronze",
    shape: "Disc",
  },
  {
    title: "Gilt Burst Objet",
    handle: "gilt-burst-objet",
    description:
      "A gilded burst with a quiet centre hole, sitting on a white marble base.",
    images: [IMG("sculpture-gold-burst.jpg")],
    usd: 450,
    material: "brass",
    shape: "Disc",
  },
  {
    title: "Reef Totem Sculpture",
    handle: "reef-totem-sculpture",
    description:
      "An openwork totem drawn from reef and branch forms, cast in bronze on a square base.",
    images: [IMG("sculpture-reef-totem-1.jpg"), IMG("sculpture-reef-totem-2.jpg")],
    usd: 520,
    material: "bronze",
    shape: "Totem",
  },
  {
    title: "Verdigris Wave Sculpture",
    handle: "verdigris-wave-sculpture",
    description:
      "A crescent of breaking surf rendered in patinated bronze, balanced on a slim marble foot.",
    images: [IMG("sculpture-verdigris-wave.jpg")],
    usd: 410,
    material: "bronze",
    shape: "Wave",
  },
  {
    title: "Ripple Disc Sculpture",
    handle: "ripple-disc-sculpture",
    description:
      "Concentric ripples disturbed by a single aperture, blackened and rubbed back to the gold.",
    images: [IMG("sculpture-ripple-disc.jpg")],
    usd: 360,
    material: "bronze",
    shape: "Disc",
  },
  {
    title: "Interlocking Rings Sculpture",
    handle: "interlocking-rings-sculpture",
    description:
      "Two studded rings caught mid-orbit, finished in black and gilt and mounted on marble.",
    images: [IMG("sculpture-interlocking-rings.jpg")],
    usd: 330,
    material: "bronze",
    shape: "Ring",
  },
  {
    title: "Fluted Oval Objet",
    handle: "fluted-oval-objet",
    description:
      "An oval aperture ringed with fine flutes, glazed deep green over a stone body.",
    images: [IMG("sculpture-fluted-oval.jpg")],
    usd: 300,
    material: "stone",
    shape: "Oval",
  },
  {
    title: "Obsidian Totem Sculpture",
    handle: "obsidian-totem-sculpture",
    description:
      "Stacked organic volumes pierced with three windows, textured and darkened to near black.",
    images: [IMG("sculpture-black-totem.jpg")],
    usd: 480,
    material: "bronze",
    shape: "Totem",
  },
  {
    title: "Verdigris Wreath Sculpture",
    handle: "verdigris-wreath-sculpture",
    description:
      "A wreath of cast foliage, broken open at one edge and patinated to a garden green.",
    images: [IMG("sculpture-green-wreath.jpg")],
    usd: 440,
    material: "bronze",
    shape: "Wreath",
  },
]

export const SCULPTURE_TITLES = PIECES.map((piece) => piece.title)
export const SCULPTURE_HANDLES = PIECES.map((piece) => piece.handle)

export function sculptureCollectionProducts(opts: {
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
      category_ids: [opts.categoryByName["Sculptures"]].filter(Boolean),
      description: piece.description,
      thumbnail: urls[0],
      images: urls.map((url) => ({ url })),
      sales_channels: [{ id: opts.salesChannelId }],
      metadata: { customization_level: "none", material: piece.material, collection: "sculpture" },
      options: [{ title: "Finish", values: ["Bronze"] }],
      variants: [
        {
          title: `${piece.title} — Bronze`,
          sku: generateSku({
            category: "Deco",
            shape: piece.shape,
            material: piece.material,
            size: "NAT",
          }),
          options: { Finish: "Bronze" },
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
