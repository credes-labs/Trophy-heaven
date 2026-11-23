import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getMeili } from "../lib/meilisearch"
import { reindexProducts } from "../lib/reindex-products"
import freeShipping from "./free-shipping"
import seed from "./seed"
import seedContent from "./seed-content"
import seedStudioTrophies from "./seed-studio-trophies"

/**
 * First-deploy setup, in order: catalogue, studio trophies, journal + reviews, the free
 * shipping rule, the search index. Every step is safe to re-run. Prints the publishable
 * key the storefront needs.
 *
 *   npx medusa exec ./src/scripts/bootstrap.js   (from .medusa/server in production)
 */
export default async function bootstrap(args: ExecArgs) {
  const { container } = args
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  await seed(args)
  await seedStudioTrophies(args)
  await seedContent(args)
  await freeShipping(args)

  if (getMeili()) {
    const { indexed } = await reindexProducts(container)
    logger.info(`bootstrap: indexed ${indexed} product(s) for search`)
  } else {
    logger.warn("bootstrap: MEILISEARCH_HOST not set; skipped the search index")
  }

  const apiKeys = container.resolve(Modules.API_KEY)
  const keys = await apiKeys.listApiKeys({ type: "publishable" })
  const key = keys.find((k) => !k.revoked_at)
  if (key) logger.info(`bootstrap: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${key.token}`)
  logger.info("bootstrap: done")
}
