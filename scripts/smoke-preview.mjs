import { mkdirSync } from "node:fs"
import { chromium } from "playwright"

const BASE = process.argv[2]
const OUT = process.argv[3] ?? "preview-smoke"
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ["--use-angle=default"] })

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const res = await page.goto(BASE, { waitUntil: "networkidle" })
console.log("status:", res.status())
await page.evaluate(() => document.fonts.ready)
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" })
await page.waitForTimeout(2600)
console.log(
  "hydrated:",
  await page.evaluate(() => document.querySelector("main[data-experience=v4]")?.hasAttribute("data-hydrated"))
)
console.log("canvas:", await page.locator("canvas").count())

const stops = await page.evaluate(() => {
  const vh = innerHeight
  const zones = {}
  for (const el of document.querySelectorAll("[data-zone]")) {
    const r = el.getBoundingClientRect()
    const top = r.top + scrollY
    const sticky = el.hasAttribute("data-zone-sticky")
    zones[el.getAttribute("data-zone")] = {
      start: sticky ? top : top - vh,
      end: sticky ? top + r.height - vh : top + r.height,
    }
  }
  const at = (z, p) => Math.round(zones[z].start + (zones[z].end - zones[z].start) * p)
  /* Codera City (Iterácia 2.0): the street walk in /02 at three depths,
     then one stop per act — every zone here exists in both edits */
  return [
    ["p-hero", 0],
    ["p-street-first", at("work", 0.32)],
    ["p-street-middle", at("work", 0.6)],
    ["p-street-last", at("work", 0.98)],
    ["p-offer", at("offer", 0.55)],
    ["p-process", at("process", 0.55)],
    ["p-resolution", at("resolution", 0.9)],
  ]
})
for (const [name, y] of stops) {
  await page.evaluate((v) => scrollTo(0, v), y)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name, y)
}
/* drawer opens */
await page.evaluate(() => scrollTo(0, 0))
await page.waitForTimeout(600)
await page.getByRole("button", { name: "Začať projekt" }).first().click()
await page.waitForTimeout(800)
console.log("drawer:", await page.getByRole("dialog").isVisible())
await page.screenshot({ path: `${OUT}/p-drawer.png` })
await page.close()

const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto(BASE, { waitUntil: "networkidle" })
await mob.waitForTimeout(2200)
await mob.screenshot({ path: `${OUT}/p-hero-mobile.png` })
console.log("mobile ok")
await browser.close()
