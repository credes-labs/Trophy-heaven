import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Points stored storefront image URLs at the WebP files (WP-85).
 *
 *   npx medusa exec ./src/scripts/images-to-webp.ts
 *
 * Storefront imagery under /images/{products,catalog,explore,blog,about,footer,hero}/
 * was recoded from JPEG/PNG to WebP, and five explore photographs that duplicated
 * catalog ones were removed. This rewrites matching URLs in place (absolute or
 * relative, any host) so admin, emails and order history keep working. Safe to re-run.
 * The storefront also remaps old URLs at render time (localizeImageUrl).
 */
const COLUMNS: Array<[table: string, column: string]> = [
  ["image", "url"],
  ["product", "thumbnail"],
  ["product_variant", "thumbnail"],
  ["inventory_item", "thumbnail"],
  ["cart_line_item", "thumbnail"],
  ["order_line_item", "thumbnail"],
  ["blog_post", "cover_image_url"],
]

const RECODE = String.raw`(/images/(products|catalog|explore|blog|about|footer|hero)/[^?#]+)\.(jpe?g|png)`

/** The WP-85 explore duplicates and their catalog copies were all furniture, retired in the Trophy Heaven rebrand. */
const DEDUPED: Record<string, string> = {}

export default async function imagesToWebp({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  for (const [table, column] of COLUMNS) {
    const exists = await pg.schema.hasTable(table)
    if (!exists) continue
    const recoded = await pg(table)
      .whereRaw("?? ~* ?", [column, RECODE])
      .update({ [column]: pg.raw("regexp_replace(??, ?, '\\1.webp', 'i')", [column, RECODE]) })
    let deduped = 0
    for (const [from, to] of Object.entries(DEDUPED)) {
      deduped += await pg(table)
        .where(column, "like", `%${from}%`)
        .update({ [column]: pg.raw("replace(??, ?, ?)", [column, from, to]) })
    }
    if (recoded || deduped) logger.info(`${table}.${column}: ${recoded} recoded, ${deduped} deduplicated`)
  }
  logger.info("Image URLs now point at WebP files.")
}
