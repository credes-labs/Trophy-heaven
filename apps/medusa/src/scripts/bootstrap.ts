import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getMeili } from "../lib/meilisearch"
import { reindexProducts } from "../lib/reindex-products"
import freeShipping from "./free-shipping"
import seed from "./seed"
import seedContent from "./seed-content"
import seedStudioTrophies from "./seed-studio-trophies"

/**
 * Bump when the seeded catalogue or content changes and must reach databases that are
 * already seeded. Each value is applied once: after that the shop belongs to the owner,
 * and products, posts or reviews deleted in the admin are not recreated on the next deploy.
 */
export const SEED_VERSION = "2026-11-25-owner-catalogue"

/**
 * First-deploy setup, in order: catalogue, studio trophies, journal + reviews, the free
 * shipping rule, the search index. Seeding runs once per SEED_VERSION (recorded on the
 * store's metadata), so it is safe in a pre-deploy command that runs on every deploy.
 * The search index is rebuilt every time. Prints the publishable key the storefront needs.
 *
 *   npx medusa exec ./src/scripts/bootstrap.js   (from .medusa/server in production)
 */
export default async function bootstrap(args: ExecArgs) {
  const { container } = args
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const storeModule = container.resolve(Modules.STORE)
  const [before] = await storeModule.listStores()
  if (before?.metadata?.seed_version === SEED_VERSION) {
    logger.info(`bootstrap: seed ${SEED_VERSION} already applied; leaving the owner's catalogue alone`)
  } else {
    await seed(args)
    await seedStudioTrophies(args)
    await seedContent(args)
    await freeShipping(args)
    // seed() creates the store on an empty database, so look it up again.
    const [store] = await storeModule.listStores()
    if (store) {
      await storeModule.updateStores(store.id, {
        metadata: { ...(store.metadata ?? {}), seed_version: SEED_VERSION },
      })
      logger.info(`bootstrap: recorded seed ${SEED_VERSION}`)
    }
  }

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
