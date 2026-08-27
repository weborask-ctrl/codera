import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
for (const [dev, w, h] of [["tablet", 768, 1024], ["mobile", 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" })
  await page.addStyleTag({ content: "nextjs-portal{display:none!important} html{scroll-behavior:auto!important}" })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1500)
  const ids = ["", "#premena", "#praca", "#sluzby", "#kontakt"]
  const names = ["01-hero", "02-premena", "03-work", "04-offer", "05-resolution"]
  for (let i = 0; i < ids.length; i++) {
    if (ids[i]) {
      await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView(), ids[i])
    }
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${OUT}/${names[i]}-${dev}.png` })
  }
  await page.close()
}
await browser.close()
console.log("done")
