import { mkdirSync } from "node:fs"
import { chromium } from "playwright"

const OUT = process.argv[2] ?? "captures-v4"
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ["--use-angle=default"] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" })
await page.addStyleTag({
  content:
    "nextjs-portal{display:none!important} html{scroll-behavior:auto!important}",
})
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(2600)

/* zone-relative scroll targets, mirroring stage.ts measurement */
const targets = await page.evaluate(() => {
  const vh = innerHeight
  const zones = {}
  for (const el of document.querySelectorAll("[data-zone]")) {
    const rect = el.getBoundingClientRect()
    const top = rect.top + scrollY
    const sticky = el.hasAttribute("data-zone-sticky")
    zones[el.getAttribute("data-zone")] = {
      start: sticky ? top : top - vh,
      end: sticky ? top + rect.height - vh : top + rect.height,
    }
  }
  const at = (z, p) => Math.round(zones[z].start + (zones[z].end - zones[z].start) * p)
  return [
    ["01-hero", 0],
    ["01b-hero-settled", Math.round(vh * 0.25)],
    ["t1-pass-early", at("pass", 0.3)],
    ["t1-pass-late", at("pass", 0.75)],
    ["02-before", at("premena", 0.1)],
    ["02-fold-mid", at("premena", 0.45)],
    ["02-after", at("premena", 0.8)],
    ["02-after-hold", at("premena", 0.98)],
    ["03-konstrukt", at("work", 1 / 6)],
    ["03-konstrukt-late", at("work", 0.3)],
    ["03-vitalis", at("work", 3 / 6)],
    ["03-forma", at("work", 5 / 6)],
    ["04-offer-early", at("offer", 0.35)],
    ["04-offer-late", at("offer", 0.7)],
    ["05-resolution", at("resolution", 0.9)],
  ]
})

for (const [name, y] of targets) {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name, y)
}
await browser.close()
