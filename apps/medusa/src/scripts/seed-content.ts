import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { BLOG } from "../modules/blog"
import type BlogService from "../modules/blog/service"
import { REVIEWS } from "../modules/reviews"
import type ReviewsService from "../modules/reviews/service"

// Blog cover art lives in the storefront public assets (see
// apps/storefront/public/images/manifest.json).
const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "http://localhost:3000"
const COVER_BY_CATEGORY: Record<string, string> = {
  craftsmanship: `${STOREFRONT_URL}/images/blog/blog-craftsmanship.webp`,
  materials: `${STOREFRONT_URL}/images/blog/blog-materials.webp`,
  design: `${STOREFRONT_URL}/images/catalog/trophy-figure-award.webp`,
  stories: `${STOREFRONT_URL}/images/catalog/trophy-achievement-statuette.webp`,
  news: `${STOREFRONT_URL}/images/news/news-silver-dipped.webp`,
}

const CATEGORIES = [
  {
    name: "Craftsmanship",
    slug: "craftsmanship",
    description: "Behind the scenes of how Trophy Heaven pieces are made.",
  },
  {
    name: "Materials",
    slug: "materials",
    description: "Wood, metal, crystal, and the finishes we trust.",
  },
  {
    name: "Design",
    slug: "design",
    description: "Form, proportion, and the language of awards.",
  },
  {
    name: "Stories",
    slug: "stories",
    description: "Client moments, workshops, and studio notes.",
  },
  {
    name: "News",
    slug: "news",
    description: "New finishes, new pieces and studio announcements.",
  },
]

const POSTS: Array<{
  title: string
  slug: string
  categorySlug: string
  excerpt: string
  tags: string[]
  content_md: string
  read_time_minutes: number
}> = [
  {
    title: "The Quiet Discipline of Hand-Finished Wood",
    slug: "hand-finished-wood",
    categorySlug: "craftsmanship",
    excerpt: "Why we still sand, oil, and inspect every wooden base by hand.",
    tags: ["wood", "finishing", "workshop"],
    read_time_minutes: 4,
    content_md: `## Grain as signature

Every timber blank arrives with its own map. We read the grain before the first cut, aligning the award face so light catches the figure rather than fighting it.

## Hand finishing

Machine sanding gets us close. The last three grits — and the oil — are done by hand so edges stay crisp and the surface feels warm, not plastic.

## What you notice

A Trophy Heaven wooden base should feel settled in the hand: balanced weight, soft edges, and a finish that deepens rather than peels.`,
  },
  {
    title: "Choosing Metal for Awards That Last",
    slug: "choosing-metal-for-awards",
    categorySlug: "materials",
    excerpt: "Brass, zinc, and stainless — when each material earns its place.",
    tags: ["metal", "brass", "durability"],
    read_time_minutes: 5,
    content_md: `## Brass for presence

Brass reads ceremonial. We use it when the piece should catch light across a stage or boardroom.

## Zinc for fine detail

Cast zinc lets us hold sharp lettering and sculptural relief without the cost of solid bronze.

## Stainless for restraint

When the brief is modern and understated, brushed stainless keeps the focus on form and inscription.`,
  },
  {
    title: "Proportion: The Invisible Craft",
    slug: "proportion-the-invisible-craft",
    categorySlug: "design",
    excerpt: "How base height, column width, and plaque size decide whether an award feels right.",
    tags: ["design", "proportion", "awards"],
    read_time_minutes: 3,
    content_md: `## Height before ornament

If the silhouette is wrong, no amount of engraving saves it. We start with overall height relative to the trophy’s purpose — desk, shelf, or podium.

## Negative space

Empty space is part of the design. Crowding a plaque or stacking too many elements makes even fine materials feel cheap.

## A simple test

Place the mock beside a book spine. If the award shouts louder than the room, we pull back.`,
  },
  {
    title: "Crystal Clarity: Cutting Light Into Form",
    slug: "crystal-clarity",
    categorySlug: "materials",
    excerpt: "Optical crystal rewards precision — and punishes rushed polishing.",
    tags: ["crystal", "glass", "light"],
    read_time_minutes: 4,
    content_md: `## Why optical crystal

It transmits light cleanly. Facets become architecture rather than decoration.

## Edges matter

A cloudy edge ruins the piece. We inspect every facet under raking light before packing.

## Engraving depth

Too shallow and the message vanishes; too deep and the crystal looks bruised. We calibrate per blank.`,
  },
  {
    title: "From Sketch to Stage: A Trophy’s Journey",
    slug: "from-sketch-to-stage",
    categorySlug: "craftsmanship",
    excerpt: "A short walk through design approval, production, and final QA.",
    tags: ["process", "qa", "production"],
    read_time_minutes: 6,
    content_md: `## Sketch

We lock silhouette and inscription layout before any tooling starts.

## Sample

For custom runs, a physical or high-fidelity digital sample catches proportion issues early.

## Production & QA

Each piece is checked for finish, alignment, and packaging fit — then photographed for the order record.`,
  },
  {
    title: "A Boardroom Moment in Bengaluru",
    slug: "boardroom-moment-bengaluru",
    categorySlug: "stories",
    excerpt: "How a custom oak-and-brass set marked a decade of quiet leadership.",
    tags: ["client", "custom", "bengaluru"],
    read_time_minutes: 3,
    content_md: `## The brief

Ten years. Ten leaders. One material language that felt Indian and modern without pastiche.

## The solution

Oak bases, brushed brass columns, and restrained engraving — identical silhouettes, unique names.

## The moment

They were presented without spectacle. That was the point: craft in service of recognition.`,
  },
  {
    title: "Trophies, Dipped in Silver",
    slug: "dipped-in-silver",
    categorySlug: "news",
    excerpt: "Our figure awards and statuettes now come in a full silver dip: the same sculpted form in a cool, bright finish.",
    tags: ["news", "silver", "finish"],
    read_time_minutes: 3,
    content_md: `## A new finish

Gold has always been the language of first place. Silver says something quieter: precision, calm, a modern room. Our figure awards and statuettes are now available fully dipped in silver.

![A figure award and a statuette, both dipped in silver](/images/news/news-silver-dipped.webp)

## Polish

Every figure is hand-polished before it goes anywhere near the bath. Silver shows every mark underneath it, so the surface has to be clean and even first.

![Silver-dipped figure award on a mahogany base](/images/news/news-silver-figure.webp)

## Dip

The piece is lowered into the bath and takes on an even skin of silver across every fold, ring and edge, including the textured sash and the open ring of the figure award.

## Seal

A clear protective lacquer goes on last, so the shine lasts on a shelf or in a boardroom without tarnishing.

![Silver-dipped statuette on a black marble plinth](/images/news/news-silver-statuette.webp)

## Ordering

Ask for the silver dip in the design notes on your cart, or contact us about silver for a bulk order. Engraving and bases stay the same.`,
  },
]

/**
 * Seeds blog categories/posts and a few approved product reviews.
 * Safe to re-run — skips existing slugs / duplicate customer+product reviews.
 */
export default async function seedContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const blog = container.resolve<BlogService>(BLOG)
  const reviews = container.resolve<ReviewsService>(REVIEWS)
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info("Seeding Trophy Heaven content (blog + reviews)…")

  const categoryBySlug = new Map<string, string>()
  for (const cat of CATEGORIES) {
    const existing = await blog.listBlogCategories({ slug: cat.slug }, { take: 1 })
    if (existing.length) {
      categoryBySlug.set(cat.slug, existing[0].id)
      continue
    }
    const created = await blog.createCategory(cat)
    categoryBySlug.set(cat.slug, created.id)
    logger.info(`Created blog category: ${cat.slug}`)
  }

  for (const post of POSTS) {
    const coverImageUrl = COVER_BY_CATEGORY[post.categorySlug] ?? null
    const existing = await blog.listBlogPosts({ slug: post.slug }, { take: 1 })
    if (existing.length) {
      // Backfill imagery/SEO for posts created by earlier seed runs.
      const current = existing[0]
      // blog-design.webp (an oak-furniture interior) was retired with the rebrand.
      const retiredCover = Boolean(current.cover_image_url?.includes("/blog-design."))
      if (retiredCover || !current.cover_image_url || !current.seo_title || !current.published_at) {
        await blog.updateBlogPosts({
          id: current.id,
          cover_image_url: retiredCover ? coverImageUrl : (current.cover_image_url ?? coverImageUrl),
          seo_title: current.seo_title ?? post.title,
          seo_description: current.seo_description ?? post.excerpt,
          published_at: current.published_at ?? new Date(),
        })
        logger.info(`Backfilled cover/SEO for blog post: ${post.slug}`)
      }
      continue
    }

    await blog.createPost({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content_md: post.content_md,
      cover_image_url: coverImageUrl,
      seo_title: post.title,
      seo_description: post.excerpt,
      tags: post.tags,
      read_time_minutes: post.read_time_minutes,
      category_id: categoryBySlug.get(post.categorySlug) ?? null,
      status: "published",
    })
    logger.info(`Created blog post: ${post.slug}`)
  }

  const [products] = await productModule.listAndCountProducts({}, { take: 50 })
  if (!products.length) {
    logger.info("No products found — skipping sample reviews.")
    return
  }

  // Five reviews per product, mixed 3–5 ratings, one per synthetic customer so
  // re-runs stay idempotent via the (product_id, customer_id) existence check.
  const sampleReviews = [
    {
      rating: 5,
      title: "Exceptional finish",
      body: "The finish and engraving were flawless — it looked stunning on stage.",
    },
    {
      rating: 4,
      title: "Solid and elegant",
      body: "Heavy in the hand and beautifully packed; delivery took a day longer than promised.",
    },
    {
      rating: 5,
      title: "Better than the photos",
      body: "The craftsmanship genuinely surprised us — finer in person than in the pictures.",
    },
    {
      rating: 3,
      title: "Good, with a caveat",
      body: "A good piece overall, though the polish on the base was slightly uneven.",
    },
    {
      rating: 4,
      title: "Would order again",
      body: "Elegant and well made — the engraving preview matched the final product exactly.",
    },
  ]

  for (const product of products) {
    for (let r = 0; r < sampleReviews.length; r++) {
      const template = sampleReviews[r]
      const customerId = `seed_customer_${r + 1}`
      const existing = await reviews.listProductReviews(
        { product_id: product.id, customer_id: customerId },
        { take: 1 }
      )
      if (existing.length) continue

      const review = await reviews.create({
        product_id: product.id,
        customer_id: customerId,
        rating: template.rating,
        title: template.title,
        body: template.body,
        is_verified_purchase: true,
      })
      await reviews.approve(review.id)
    }
    logger.info(`Seeded reviews for product ${product.id}`)
  }

  logger.info("Content seed complete.")
}
