import { chromium } from "@playwright/test"
import { mkdirSync } from "node:fs"

const OUT = "public/images/catalog/plaque-engraved.png"
mkdirSync("public/images/catalog", { recursive: true })

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader"] })
const page = await browser.newPage({
  viewport: { width: 1280, height: 1024 },
  deviceScaleFactor: 2,
})

await page.goto("http://localhost:3000/customize", { waitUntil: "domcontentloaded", timeout: 120_000 })
await page.waitForSelector(".configurator-stage", { timeout: 60_000 })

// The flat proof fades out once the 3D scene has painted; wait for that, but
// fall back to the flat drawing rather than hanging if WebGL is unavailable.
const ready = await page
  .waitForFunction(
    () => {
      const proof = document.querySelector(".configurator-stage [role=img] > div")
      const canvas = document.querySelector(".configurator-stage canvas")
      return Boolean(canvas) && (!proof || getComputedStyle(proof).opacity === "0")
    },
    null,
    { timeout: 30_000 },
  )
  .then(() => true)
  .catch(() => false)

await page.waitForTimeout(1500)

// Crop off the studio chrome (wordmark, view toggle and cart along the top;
// hint text and view buttons along the bottom) so no UI or old logo ships.
const stage = page.locator(".configurator-stage [role=img]").first()
const box = await stage.boundingBox()
if (!box) throw new Error("stage not found")
const TOP = 85
const BOTTOM = 79
await page.screenshot({
  path: OUT,
  clip: { x: box.x, y: box.y + TOP, width: box.width, height: box.height - TOP - BOTTOM },
})
console.log(`webgl-ready=${ready}`)
await browser.close()
