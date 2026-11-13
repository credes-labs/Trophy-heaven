import { chromium } from "@playwright/test"
const out = process.argv[2]
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 })
const errs = []
p.on("pageerror", (e) => errs.push(String(e)))
for (const piece of ["achievement", "ascent"]) {
  await p.goto("http://localhost:3000/customize?piece=" + piece, { waitUntil: "networkidle", timeout: 180000 }).catch(() => {})
  await p.waitForSelector('[aria-label*="personalised base engraving"] canvas', { timeout: 90000 }).catch(() => console.log("no canvas", piece))
  await p.waitForTimeout(7000)
  await p.screenshot({ path: `${out}/${piece}2.png`, clip: { x: 260, y: 150, width: 500, height: 700 } })
}
console.log("errors:", errs.slice(0, 5))
await b.close()
