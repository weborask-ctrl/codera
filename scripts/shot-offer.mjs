import { chromium } from "playwright"

const BASE = process.argv[2]
const OUT = process.argv[3]
const browser = await chromium.launch({ args: ["--use-angle=default"] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(BASE, { waitUntil: "networkidle" })
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(2200)
await page.evaluate(() => {
  const el = document.querySelector("#sluzby")
  const top = el.getBoundingClientRect().top + scrollY
  scrollTo(0, Math.round(top - innerHeight * 0.08))
})
await page.waitForTimeout(1100)
await page.screenshot({ path: OUT })
await browser.close()
console.log("ok")
