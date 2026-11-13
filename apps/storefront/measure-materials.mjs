import { chromium } from "@playwright/test"

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 120_000 })
await page.waitForSelector("#materials-heading")
await page.waitForTimeout(800)

const out = await page.evaluate(() => {
  const section = document.querySelector("#materials")
  const eyebrow = section?.querySelector("p")
  const heading = document.querySelector("#materials-heading")
  const list = section?.querySelector("ul")
  const listWrap = list?.parentElement
  const firstSlot = list?.querySelector("li > div")
  const firstH3 = list?.querySelector("li > h3")
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      height: Math.round(r.height),
      mt: cs.marginTop,
      pt: cs.paddingTop,
      fontSize: cs.fontSize,
    }
  }
  return {
    sectionFontSize: section ? getComputedStyle(section).fontSize : null,
    eyebrow: box(eyebrow),
    heading: box(heading),
    listWrap: box(listWrap),
    list: box(list),
    firstSlot: box(firstSlot),
    firstH3: box(firstH3),
  }
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
