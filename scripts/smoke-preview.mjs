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
  await page.evaluate(() => document.querySelector("main[data-experience=v3]")?.hasAttribute("data-hydrated"))
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
  return [
    ["p-hero", 0],
    ["p-premena-hold", at("premena", 0.98)],
    ["p-konstrukt", at("work", 0.08)],
    ["p-vitalis", at("work", 0.46)],
    ["p-forma", at("work", 0.95)],
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
