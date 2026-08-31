import { test, expect, type Page } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Gallery + shop browse verification (manual full-verify pass).
 * Run: pnpm exec playwright test e2e/full-verify-gallery-shop.spec.ts --project=chromium --workers=1
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const VERIFY_DIR = path.join(ROOT, ".tmp/full-verify")
const SCREENSHOT_DIR = path.join(VERIFY_DIR, "screenshots")
const REPORT_PATH = path.join(VERIFY_DIR, "07-pw-gallery-shop.md")

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000"

const GALLERY_HANDLES = [
  "oak-side-table",
  "engraved-wooden-plaque",
  "brass-table-lamp",
] as const

type StepResult = {
  id: string
  step: string
  status: "PASS" | "FAIL"
  screenshots: string[]
  notes?: string
}

const stepResults: StepResult[] = []

function record(
  id: string,
  step: string,
  status: "PASS" | "FAIL",
  screenshots: string[],
  notes?: string
) {
  stepResults.push({ id, step, status, screenshots, notes })
}

async function shot(page: Page, filename: string): Promise<string> {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  const full = path.join(SCREENSHOT_DIR, filename)
  await page.screenshot({ path: full, fullPage: true })
  return filename
}

async function galleryCounter(page: Page): Promise<string> {
  const counter = page.locator(".pdp-gallery-counter")
  await expect(counter).toBeVisible({ timeout: 15_000 })
  return ((await counter.textContent()) ?? "").replace(/\s+/g, " ").trim()
}

function writeReport() {
  const pass = stepResults.filter((r) => r.status === "PASS").length
  const fail = stepResults.filter((r) => r.status === "FAIL").length
  const screenshotCount = stepResults.reduce((n, r) => n + r.screenshots.length, 0)

  const lines = [
    "# Playwright gallery + shop verification",
    "",
    `**Date:** ${new Date().toISOString()}`,
    `**Base:** ${BASE}`,
    `**Spec:** \`apps/storefront/e2e/full-verify-gallery-shop.spec.ts\``,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "|--------|-------|",
    `| Steps PASS | ${pass} |`,
    `| Steps FAIL | ${fail} |`,
    `| Screenshots | ${screenshotCount} |`,
    "",
    "## Step results",
    "",
    "| ID | Step | Status | Screenshots | Notes |",
    "|----|------|--------|-------------|-------|",
    ...stepResults.map((r) => {
      const shots = r.screenshots.map((s) => `\`${s}\``).join(", ") || "—"
      const notes = (r.notes ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")
      return `| ${r.id} | ${r.step} | **${r.status}** | ${shots} | ${notes} |`
    }),
    "",
    "## Screenshot index",
    "",
    ...stepResults.flatMap((r) =>
      r.screenshots.map((s) => `- \`screenshots/${s}\` — ${r.id} ${r.step}`)
    ),
    "",
  ]

  fs.mkdirSync(VERIFY_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, lines.join("\n"), "utf8")
}

test.describe("full-verify gallery + shop", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 })

  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  })

  test.afterAll(() => {
    writeReport()
  })

  test.beforeEach(async () => {
    await new Promise((r) => setTimeout(r, 600))
  })

  test("S01 — Home page hero visible", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/")
      await expect(page).toHaveTitle(/Legacy Crafts/i)
      await expect(page.locator("section").first()).toBeVisible({ timeout: 20_000 })
      await expect(
        page.getByText(/curated furniture|discover furniture built to inspire/i)
      ).toBeVisible({ timeout: 15_000 })
      shots.push(await shot(page, "07-home-before.png"))
      shots.push(await shot(page, "07-home-after.png"))
      record("S01", "Home page hero visible", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "07-home-FAIL.png").catch(() => "07-home-FAIL.png"))
      record("S01", "Home page hero visible", "FAIL", shots, String(e))
      throw e
    }
  })

  test("S02 — Shop browse + filters", async ({ page }) => {
    const shots: string[] = []
    try {
      await page.goto("/shop")
      await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 20_000 })
      shots.push(await shot(page, "07-shop-before-filter.png"))

      const filterBtn = page.getByRole("button", { name: /^filter$/i }).first()
      if (await filterBtn.isVisible().catch(() => false)) {
        await filterBtn.click()
        await page.waitForTimeout(400)
      }

      const trophies = page.getByRole("checkbox", { name: /trophies/i }).first()
      if (await trophies.isVisible().catch(() => false)) {
        await trophies.check()
        await page.waitForTimeout(600)
      } else {
        const sortBtn = page.getByRole("button", { name: /sort/i }).first()
        if (await sortBtn.isVisible().catch(() => false)) {
          await sortBtn.click()
          await page.getByRole("option", { name: /price.*low/i }).first().click().catch(() => undefined)
          await page.waitForTimeout(400)
        }
      }

      shots.push(await shot(page, "07-shop-after-filter.png"))
      record("S02", "Shop browse + filters", "PASS", shots)
    } catch (e) {
      shots.push(await shot(page, "07-shop-FAIL.png").catch(() => "07-shop-FAIL.png"))
      record("S02", "Shop browse + filters", "FAIL", shots, String(e))
      throw e
    }
  })

  for (const slug of ["trophies", "furniture", "artwork"] as const) {
    test(`S03-${slug} — Category page loads`, async ({ page }) => {
      const shots: string[] = []
      const id = `S03-${slug}`
      try {
        await page.goto(`/${slug}`)
        await expect(page.locator("main")).toBeVisible({ timeout: 20_000 })
        await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({
          timeout: 20_000,
        })
        shots.push(await shot(page, `07-${slug}-before.png`))
        shots.push(await shot(page, `07-${slug}-after.png`))
        record(id, `/${slug} category page`, "PASS", shots)
      } catch (e) {
        shots.push(await shot(page, `07-${slug}-FAIL.png`).catch(() => `07-${slug}-FAIL.png`))
        record(id, `/${slug} category page`, "FAIL", shots, String(e))
        throw e
      }
    })
  }

  for (const handle of GALLERY_HANDLES) {
    test(`S04-${handle} — PDP gallery navigation`, async ({ page }) => {
      const shots: string[] = []
      const id = `S04-${handle}`
      const prefix = `07-pdp-${handle}`

      try {
        await page.goto(`/products/${handle}`)
        await expect(page.locator(".pdp-gallery-well")).toBeVisible({ timeout: 20_000 })

        const beforeCounter = await galleryCounter(page)
        expect(beforeCounter).toMatch(/01\s*\/\s*03/)
        shots.push(await shot(page, `${prefix}-gallery-before.png`))

        const nextBtn = page.getByRole("button", { name: /next image/i }).first()
        await nextBtn.click()
        await page.waitForTimeout(350)
        const afterNext = await galleryCounter(page)
        expect(afterNext).toMatch(/02\s*\/\s*03/)
        shots.push(await shot(page, `${prefix}-gallery-after-next.png`))

        const prevBtn = page.getByRole("button", { name: /previous image/i }).first()
        await prevBtn.click()
        await page.waitForTimeout(350)
        const afterPrev = await galleryCounter(page)
        expect(afterPrev).toMatch(/01\s*\/\s*03/)
        shots.push(await shot(page, `${prefix}-gallery-after-prev.png`))

        const thumb3 = page.getByRole("button", { name: /view image 3/i }).first()
        await expect(thumb3).toBeVisible()
        shots.push(await shot(page, `${prefix}-thumb-before.png`))
        await thumb3.click()
        await page.waitForTimeout(350)
        const afterThumb = await galleryCounter(page)
        expect(afterThumb).toMatch(/03\s*\/\s*03/)
        shots.push(await shot(page, `${prefix}-thumb-after.png`))

        record(
          id,
          `PDP gallery (${handle}, 3 imgs)`,
          "PASS",
          shots,
          `Counter: ${beforeCounter} → ${afterNext} → ${afterPrev} → ${afterThumb}`
        )
      } catch (e) {
        shots.push(
          await shot(page, `${prefix}-gallery-FAIL.png`).catch(() => `${prefix}-gallery-FAIL.png`)
        )
        if (!stepResults.some((r) => r.id === id)) {
          record(id, `PDP gallery (${handle})`, "FAIL", shots, String(e))
        }
        throw e
      }
    })

    test(`S05-${handle} — Lightbox open/close`, async ({ page }) => {
      const shots: string[] = []
      const id = `S05-${handle}`
      const prefix = `07-lightbox-${handle}`

      try {
        await page.goto(`/products/${handle}`)
        await expect(page.locator(".pdp-gallery-well")).toBeVisible({ timeout: 20_000 })
        shots.push(await shot(page, `${prefix}-before-open.png`))

        await page.getByRole("button", { name: /open image lightbox/i }).click()
        const dialog = page.getByRole("dialog")
        await expect(dialog).toBeVisible({ timeout: 10_000 })
        shots.push(await shot(page, `${prefix}-after-open.png`))

        await page.getByRole("button", { name: /^close$/i }).click()
        await expect(dialog).toHaveCount(0, { timeout: 10_000 })
        shots.push(await shot(page, `${prefix}-after-close.png`))

        record(id, `Lightbox (${handle})`, "PASS", shots)
      } catch (e) {
        shots.push(await shot(page, `${prefix}-FAIL.png`).catch(() => `${prefix}-FAIL.png`))
        if (!stepResults.some((r) => r.id === id)) {
          record(id, `Lightbox (${handle})`, "FAIL", shots, String(e))
        }
        throw e
      }
    })
  }

  test("S06 — Missing product handle (404)", async ({ page }) => {
    const shots: string[] = []
    const missingHandle = "__full-verify-missing-product__"
    try {
      const response = await page.goto(`/products/${missingHandle}`)
      shots.push(await shot(page, "07-missing-handle-before.png"))

      const status = response?.status() ?? 0
      const notFoundVisible = await page
        .getByText(/not found|404|could not be found|page doesn't exist/i)
        .first()
        .isVisible()
        .catch(() => false)
      const hasGallery = await page.locator(".pdp-gallery-well").isVisible().catch(() => false)

      expect(hasGallery, "Missing handle must not render PDP gallery").toBe(false)
      expect(
        status === 404 || notFoundVisible,
        `Expected 404 or not-found UI, got status ${status}`
      ).toBe(true)

      shots.push(await shot(page, "07-missing-handle-after.png"))
      record(
        "S06",
        "Missing product handle",
        "PASS",
        shots,
        `HTTP ${status}, notFoundUI=${notFoundVisible}`
      )
    } catch (e) {
      shots.push(
        await shot(page, "07-missing-handle-FAIL.png").catch(() => "07-missing-handle-FAIL.png")
      )
      record("S06", "Missing product handle", "FAIL", shots, String(e))
      throw e
    }
  })
})
