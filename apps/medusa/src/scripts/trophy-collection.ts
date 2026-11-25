import { ProductStatus } from "@medusajs/framework/utils"
import type { CreateProductWorkflowInputDTO } from "@medusajs/framework/types"
import { generateSku } from "../lib/sku"

/**
 * Trophy Heaven catalogue: the workshop's own pieces, photographed by the owner
 * (`apps/storefront/public/images/collection/`), plus the two gilt figures that
 * back the 3D design studio. Prices are INR placeholders until the owner sets
 * them in the admin; USD is INR ÷ 85.
 */
type Trophy = {
  title: string
  handle: string
  /** The workshop's own item number, printed in its catalogue. */
  itemNo?: string
  description: string
  categories: string[]
  /** Gallery, first image is the cover. */
  images: string[]
  inr: number
  material: string
  customization: "none" | "text_only" | "text_and_logo" | "full_3d"
  finish: string
}

const COLLECTION_PATH = "/images/collection"
const shots = (handle: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${COLLECTION_PATH}/${handle}-${i + 1}.webp`)

type Piece = Omit<Trophy, "images" | "customization" | "material"> & {
  views: number
  material?: string
}

/** The owner's pieces. `views` = number of photos in /images/collection for the handle. */
const WORKSHOP: Piece[] = [
  {
    title: "Star Flame Award",
    handle: "star-flame-award",
    itemNo: "1282",
    description:
      "An open gilt star on a sweeping ruby-red flame, raised on a tapered rosewood-finish base with room for an engraved plate.",
    categories: ["Corporate", "Metal"],
    inr: 1150,
    finish: "Gold and ruby on rosewood",
    views: 3,
  },
  {
    title: "Diamond Crown Trophy",
    handle: "diamond-crown-trophy",
    itemNo: "4338",
    description:
      "A cut crystal diamond crowning a gold and black studded column on a square black base.",
    categories: ["Crystal"],
    inr: 1650,
    material: "crystal",
    finish: "Gold, black and crystal",
    views: 3,
  },
  {
    title: "Crystal Torch Award",
    handle: "crystal-torch-award",
    itemNo: "4373",
    description:
      "Gilt flames cradle a crystal sphere above a black column with a gold star, on a stepped black and rosewood base.",
    categories: ["Crystal", "Corporate"],
    inr: 1550,
    material: "crystal",
    finish: "Gold, black and crystal",
    views: 3,
  },
  {
    title: "Crystal Halo Award",
    handle: "crystal-halo-award",
    itemNo: "4385",
    description: "A crystal sphere held in a gold halo over swept gilt leaves, on a black base.",
    categories: ["Crystal"],
    inr: 1250,
    material: "crystal",
    finish: "Gold and crystal",
    views: 2,
  },
  {
    title: "Star Column Trophy",
    handle: "star-column-trophy",
    itemNo: "4390",
    description:
      "A gilt star bursting from rising flames, mounted on a black column and a square black base with a gold foot.",
    categories: ["Sports", "Metal"],
    inr: 1350,
    finish: "Gold and black",
    views: 3,
  },
  {
    title: "Crystal Ring Column",
    handle: "crystal-ring-column",
    itemNo: "JH089",
    description:
      "A crystal sphere inside a gold ring, carried on a twisted crystal column over a tapered black base.",
    categories: ["Crystal"],
    inr: 1450,
    material: "crystal",
    finish: "Gold and crystal",
    views: 2,
  },
  {
    title: "Crystal Sphere Award",
    handle: "crystal-sphere-award",
    itemNo: "JH096",
    description:
      "A slim gold and black spire holding a faceted crystal sphere, on a square black base.",
    categories: ["Crystal", "Corporate"],
    inr: 1050,
    material: "crystal",
    finish: "Gold, black and crystal",
    views: 3,
  },
  {
    title: "Cricket Batsman Trophy",
    handle: "cricket-batsman-trophy",
    itemNo: "JH203",
    description:
      "A gilt batsman mid-stroke above a red cricket ball, on a black base with a gold foot. For tournaments and man-of-the-match awards.",
    categories: ["Sports", "Metal"],
    inr: 1350,
    finish: "Gold, red and black",
    views: 3,
  },
  {
    title: "Crystal Laurel Award",
    handle: "crystal-laurel-award",
    itemNo: "JH234",
    description:
      "Pierced gold wings rise around a crystal sphere, set on a square black base.",
    categories: ["Crystal", "Corporate"],
    inr: 1450,
    material: "crystal",
    finish: "Gold and crystal",
    views: 3,
  },
  {
    title: "Crown Crystal Trophy",
    handle: "crown-crystal-trophy",
    itemNo: "JH263",
    description:
      "A gold crown holding a crystal sphere over a textured gold column, on a round black and rosewood base.",
    categories: ["Crystal", "Sports"],
    inr: 1750,
    material: "crystal",
    finish: "Gold, black and crystal",
    views: 2,
  },
  {
    title: "Royal Lidded Cup",
    handle: "royal-lidded-cup",
    itemNo: "1585",
    description:
      "A lidded gold cup with swept handles and an embossed bowl, on a tapered rosewood-finish base.",
    categories: ["Sports", "Metal"],
    inr: 2400,
    finish: "Gold on rosewood",
    views: 3,
  },
  {
    title: "Grand Lidded Cup",
    handle: "grand-lidded-cup",
    itemNo: "1648",
    description:
      "A tall lidded gold cup with open handles, raised on a round rosewood-finish plinth.",
    categories: ["Sports", "Metal"],
    inr: 2200,
    finish: "Gold on rosewood",
    views: 3,
  },
  {
    title: "Team Spirit Award",
    handle: "team-spirit-award",
    itemNo: "4066",
    description:
      "Gilt figures celebrating inside a gold ring, set on a round black base with a gold and rosewood foot.",
    categories: ["Corporate", "Metal"],
    inr: 1650,
    finish: "Gold and black",
    views: 3,
  },
  {
    title: "Classic Silver Cup",
    handle: "classic-silver-cup",
    itemNo: "4091",
    description:
      "A polished silver-finish cup with scrolled handles, on a square black base with a gold and rosewood foot.",
    categories: ["Sports", "Metal"],
    inr: 1850,
    finish: "Silver and gold",
    views: 4,
  },
  {
    title: "Heritage Silver Cup",
    handle: "heritage-silver-cup",
    itemNo: "4092",
    description:
      "A silver-finish cup with ornate cast handles, on a round black base with a gold band.",
    categories: ["Sports", "Metal"],
    inr: 1950,
    finish: "Silver and gold",
    views: 3,
  },
  {
    title: "Rising Star Award",
    handle: "rising-star-award",
    itemNo: "4120",
    description:
      "A gilt figure lifting a five-point star, on a round black base with a gold and rosewood foot.",
    categories: ["Corporate", "Academic"],
    inr: 1450,
    finish: "Gold and black",
    views: 3,
  },
  {
    title: "Gold Statuette",
    handle: "gold-statuette",
    itemNo: "4131",
    description:
      "A classic gold statuette on a black block with a gold and rosewood foot, for film, media and annual awards.",
    categories: ["Corporate", "Metal"],
    inr: 1550,
    finish: "Gold and black",
    views: 2,
  },
  {
    title: "Championship Silver Bowl",
    handle: "championship-silver-bowl",
    itemNo: "5051",
    description:
      "A wide silver-finish bowl with scalloped rim and swept handles, on a square black base with a gold foot.",
    categories: ["Sports", "Metal"],
    inr: 2300,
    finish: "Silver and gold",
    views: 3,
  },
  {
    title: "Medallion Figure Award",
    handle: "medallion-figure-award",
    itemNo: "831",
    description:
      "A twisting gilt figure holding up a medallion disc, on a tapered rosewood-finish base.",
    categories: ["Academic", "Corporate"],
    inr: 1050,
    finish: "Gold on rosewood",
    views: 3,
  },
  {
    title: "Grace Figure Award",
    handle: "grace-figure-award",
    itemNo: "925 SR Lady",
    description:
      "A slender gilt female figure with a textured drape, on an octagonal rosewood-finish base.",
    categories: ["Corporate", "Metal"],
    inr: 1250,
    finish: "Gold on rosewood",
    views: 3,
  },
  {
    title: "Handshake Memento",
    handle: "handshake-memento",
    itemNo: "4228",
    description:
      "A wooden memento with an embossed gold plate, a handshake emblem and a shooting star, for partnerships and farewells.",
    categories: ["Corporate", "Memorial"],
    inr: 1350,
    material: "wood",
    finish: "Gold on walnut",
    views: 3,
  },
  {
    title: "Oval Wreath Memento",
    handle: "oval-wreath-memento",
    itemNo: "4264",
    description:
      "A white oval panel framed in a gold wreath, set on a stepped black stand. Ready for an engraved name or logo.",
    categories: ["Academic", "Memorial"],
    inr: 1250,
    material: "wood",
    finish: "White and gold",
    views: 1,
  },
  {
    title: "Gilt Frame Plaque",
    handle: "gilt-frame-plaque",
    itemNo: "4275",
    description:
      "A rosewood-finish standing plaque inside an ornate gold frame, for citations and long-service awards.",
    categories: ["Academic", "Corporate"],
    inr: 1150,
    material: "wood",
    finish: "Gold on rosewood",
    views: 2,
  },
]

/** The two figures that have studio models. They stay in the shop beside the workshop pieces. */
const STUDIO: Trophy[] = [
  {
    title: "Achievement Statuette",
    handle: "achievement-statuette",
    description:
      "A gilded figure in a classic stance, standing on a black marble plinth over a mahogany foot.",
    categories: ["Corporate"],
    images: ["/images/catalog/trophy-achievement-statuette.webp"],
    inr: 15300,
    material: "brass",
    customization: "full_3d",
    finish: "Gilt brass",
  },
  {
    title: "Ascent Figure Award",
    handle: "ascent-figure-award",
    description:
      "An open-shouldered figure rising through a ring, cast in brass and set on an octagonal mahogany base.",
    categories: ["Corporate"],
    images: ["/images/catalog/trophy-figure-award.webp"],
    inr: 20400,
    material: "brass",
    customization: "full_3d",
    finish: "Gilt brass",
  },
]

const PIECES: Trophy[] = [
  ...WORKSHOP.map(({ views, material, ...piece }) => ({
    ...piece,
    images: shots(piece.handle, views),
    material: material ?? "brass",
    customization: "text_only" as const,
  })),
  ...STUDIO,
]

export const TROPHY_TITLES = PIECES.map((piece) => piece.title)
export const TROPHY_HANDLES = PIECES.map((piece) => piece.handle)
/** The two figures that have studio models. Other handles stay engraving-only. */
export const STUDIO_HANDLES = STUDIO.map((piece) => piece.handle)

/** Demo pieces that were not the workshop's. The seed deletes them from older databases. */
export const RETIRED_DEMO_HANDLES = [
  "laurel-cup",
  "pedestal-cup",
  "flame-award",
  "palace-crystal",
  "ribbon-medallion",
  "excellence-crystal",
] as const

export function trophyCollectionProducts(opts: {
  salesChannelId: string
  categoryByName: Record<string, string>
  storefrontUrl: string
}): CreateProductWorkflowInputDTO[] {
  const origin = opts.storefrontUrl.replace(/\/$/, "")
  return PIECES.map((piece) => {
    const urls = piece.images.map((path) => `${origin}${path}`)
    const usd = Math.max(1, Math.round(piece.inr / 85))
    return {
      title: piece.title,
      handle: piece.handle,
      status: ProductStatus.PUBLISHED,
      category_ids: piece.categories.map((name) => opts.categoryByName[name]).filter(Boolean),
      description: piece.itemNo
        ? `${piece.description} Item No. ${piece.itemNo}.`
        : piece.description,
      thumbnail: urls[0],
      images: urls.map((url) => ({ url })),
      sales_channels: [{ id: opts.salesChannelId }],
      metadata: {
        customization_level: piece.customization,
        material: piece.material,
        collection: "trophy",
        ...(piece.itemNo ? { item_no: piece.itemNo } : {}),
      },
      options: [{ title: "Finish", values: [piece.finish] }],
      variants: [
        {
          title: `${piece.title} — ${piece.finish}`,
          sku: generateSku({
            category: piece.categories[0] ?? "Trop",
            shape: piece.itemNo ?? piece.handle,
            material: piece.material,
            size: "STD",
          }),
          options: { Finish: piece.finish },
          prices: [
            { amount: piece.inr, currency_code: "inr" },
            { amount: usd, currency_code: "usd" },
          ],
          manage_inventory: true,
        },
      ],
    }
  })
}
