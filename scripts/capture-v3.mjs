import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ["--use-angle=default"] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:3000/v3", { waitUntil: "networkidle" })
await page.addStyleTag({ content: "nextjs-portal{display:none!important} html{scroll-behavior:auto!important}" })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(2500)
const stops = [["01-hero",0],["t1-pass",0.16],["02-fold-mid",0.245],["02-after-hold",0.31],["03-konstrukt",0.45],["03-vitalis",0.585],["03-forma",0.72],["04-offer",0.855],["05-resolution",1]]
for (const [name, f] of stops) {
  await page.evaluate((f) => window.scrollTo(0, Math.round((document.body.scrollHeight - innerHeight) * f)), f)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name)
}
await browser.close()
