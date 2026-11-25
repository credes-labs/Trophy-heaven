import type { MedusaContainer } from "@medusajs/framework/types"
import { importCatalogImages } from "../lib/catalog-images"

/**
 * Moves seeded shop photos into the File module so the owner can edit them in
 * the admin. Runs in the server process, not in pre-deploy: Railway mounts the
 * upload volume only on the running container. A no-op once every product is
 * on file storage, so it simply catches newly seeded products.
 */
export default async function importCatalogImagesJob(container: MedusaContainer) {
  await importCatalogImages(container)
}

export const config = {
  name: "import-catalog-images",
  schedule: "*/5 * * * *",
}
