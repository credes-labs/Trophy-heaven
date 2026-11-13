#!/usr/bin/env node
/**
 * Converts site imagery in public/images from JPEG/PNG to WebP with sharp.
 *
 *   pnpm --filter @trophy-heaven/storefront images:webp            # dry run: report sizes only
 *   pnpm --filter @trophy-heaven/storefront images:webp --write    # write .webp, delete originals
 *
 * - Long edge is capped at MAX_EDGE (never enlarged); next/image still makes the
 *   smaller responsive sizes from this master.
 * - PNG transparency is kept (WebP supports alpha).
 * - campaign/ (finished ad units, not shown on the site) and brand/ are skipped.
 * - Afterwards update references (code, seeds, manifest.json) to the .webp names.
 */
import { readdir, stat, unlink } from "node:fs/promises"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const ROOT = fileURLToPath(new URL("../public/images/", import.meta.url))
const SKIP_DIRS = new Set(["campaign", "brand"])
const MAX_EDGE = 2560
const write = process.argv.includes("--write")

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...(await walk(full)))
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

const kb = (n) => `${Math.round(n / 1024)}KB`
let before = 0
let after = 0

for (const file of await walk(ROOT)) {
  const input = sharp(file, { failOn: "none" })
  const { width = 0, height = 0 } = await input.metadata()
  const { isOpaque } = await input.stats()
  const pipeline = sharp(file, { failOn: "none" })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp(isOpaque ? { quality: 82, effort: 6, smartSubsample: true } : { quality: 85, alphaQuality: 90, effort: 6 })
  const buffer = await pipeline.toBuffer()
  const original = (await stat(file)).size
  before += original
  after += buffer.length
  const target = file.replace(/\.(jpe?g|png)$/i, ".webp")
  console.log(
    `${relative(ROOT, file).padEnd(52)} ${`${width}x${height}`.padStart(10)} ${kb(original).padStart(7)} -> ${kb(buffer.length).padStart(6)}`
  )
  if (write) {
    await sharp(buffer).toFile(target)
    await unlink(file)
  }
}

console.log(`\nTotal ${kb(before)} -> ${kb(after)} (${Math.round((1 - after / before) * 100)}% smaller)${write ? "" : " — dry run, pass --write to apply"}`)
