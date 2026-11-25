import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { basename, resolve } from "node:path"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow, uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

/**
 * The seed points product photos at the storefront's own static files
 * (`/images/collection/…`), which the owner cannot replace from the admin. This
 * copies each one into the File module (the Railway volume, or R2/S3 in
 * production) and repoints the product, so every shop photo is an ordinary
 * admin image. Products already on the File module, and images the owner
 * uploaded, are never touched. Safe to run repeatedly.
 */

const MIME: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"])

/** `/images/…` path of a storefront static image, or null for anything else. */
export function storefrontImagePath(url: string | null | undefined, fileHosts: string[] = []): string | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url, "http://relative.invalid")
  } catch {
    return null
  }
  if (!parsed.pathname.startsWith("/images/")) return null
  // A File-module URL never lives under /images/, but guard against a CDN that does.
  if (fileHosts.includes(parsed.host)) return null
  if (parsed.pathname.includes("..")) return null
  return decodeURIComponent(parsed.pathname)
}

/** Public storefront origins to download from: STOREFRONT_PUBLIC_URL, then STORE_CORS. */
export function storefrontOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = [env.STOREFRONT_PUBLIC_URL, ...(env.STORE_CORS ?? "").split(",")]
  const origins: string[] = []
  for (const value of raw) {
    const v = value?.trim()
    if (!v || v.includes("*")) continue
    try {
      const u = new URL(v)
      if (LOCAL_HOSTS.has(u.hostname)) continue
      if (!origins.includes(u.origin)) origins.push(u.origin)
    } catch {
      continue
    }
  }
  return origins
}

function hostOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

/** Storefront `public/` folders a local or monorepo run can read directly. */
function localPublicDirs(): string[] {
  const cwd = process.cwd()
  return [
    resolve(cwd, "../storefront/public"), // apps/medusa
    resolve(cwd, "../../../storefront/public"), // apps/medusa/.medusa/server
  ].filter((dir) => existsSync(dir))
}

async function loadImage(path: string, origins: string[]): Promise<Buffer | null> {
  for (const dir of localPublicDirs()) {
    const file = resolve(dir, `.${path}`)
    if (file.startsWith(dir) && existsSync(file)) return readFile(file)
  }
  for (const origin of origins) {
    try {
      const res = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(20_000) })
      const type = res.headers.get("content-type") ?? ""
      if (res.ok && type.startsWith("image/")) return Buffer.from(await res.arrayBuffer())
    } catch {
      continue
    }
  }
  return null
}

type ProductRow = {
  id: string
  handle?: string | null
  thumbnail?: string | null
  images?: Array<{ url?: string | null } | null> | null
}

export async function importCatalogImages(
  container: MedusaContainer
): Promise<{ products: number; files: number; failed: string[] }> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fileHosts = [process.env.MEDUSA_BACKEND_URL, process.env.CDN_BASE_URL]
    .map(hostOf)
    .filter((h): h is string => Boolean(h))
  const origins = storefrontOrigins()

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "thumbnail", "images.url"],
    pagination: { skip: 0, take: 1000 },
  })
  const pending = (data as ProductRow[]).filter(
    (p) =>
      storefrontImagePath(p.thumbnail, fileHosts) ||
      (p.images ?? []).some((img) => storefrontImagePath(img?.url, fileHosts))
  )

  let files = 0
  const failed: string[] = []
  for (const product of pending) {
    const urls = [
      ...(product.images ?? []).map((img) => img?.url).filter((u): u is string => Boolean(u)),
    ]
    if (product.thumbnail && !urls.includes(product.thumbnail)) urls.push(product.thumbnail)

    // Read every source first, so a product is moved whole or not at all and a
    // missing file never leaves uploaded orphans behind.
    const staticUrls = [...new Set(urls)].filter((u) => storefrontImagePath(u, fileHosts))
    const sources: Array<{ url: string; path: string; bytes: Buffer; ext: string }> = []
    for (const url of staticUrls) {
      const path = storefrontImagePath(url, fileHosts) as string
      const ext = path.split(".").pop()?.toLowerCase() ?? ""
      const bytes = MIME[ext] ? await loadImage(path, origins) : null
      if (!bytes) break
      sources.push({ url, path, bytes, ext })
    }
    if (sources.length !== staticUrls.length) {
      failed.push(product.handle ?? product.id)
      continue
    }
    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files: sources.map((s) => ({
          filename: basename(s.path),
          mimeType: MIME[s.ext],
          content: s.bytes.toString("base64"),
          access: "public" as const,
        })),
      },
    })
    const moved = new Map(sources.map((s, i) => [s.url, result[i].url]))
    files += sources.length
    const swap = (url: string) => moved.get(url) ?? url
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: {
          thumbnail: product.thumbnail ? swap(product.thumbnail) : undefined,
          images: (product.images ?? [])
            .map((img) => img?.url)
            .filter((u): u is string => Boolean(u))
            .map((url) => ({ url: swap(url) })),
        },
      },
    })
  }

  if (pending.length) {
    logger.info(
      `catalog-images: moved ${files} photo(s) for ${pending.length - failed.length} product(s) into file storage` +
        (failed.length ? `; will retry ${failed.join(", ")} (source not reachable from ${origins.join(", ") || "no storefront origin"})` : "")
    )
  }
  return { products: pending.length - failed.length, files, failed }
}
