import { mkdirSync } from "node:fs"
import { chromium } from "playwright"

const BASE = process.argv[2] ?? "http://localhost:3000"
const OUT = process.argv[3]
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [w, h] of [[390, 844], [360, 800], [412, 915]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.addStyleTag({ content: "nextjs-portal{display:none!important} html{scroll-behavior:auto!important}" })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${OUT}/hero-${w}.png` })

  /* overflow check: does anything poke past the viewport width? */
  const overflow = await page.evaluate(() => {
    const bad = []
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && !el.closest("[data-work-deck]") && !el.closest("canvas")) {
        const cs = getComputedStyle(el)
        if (cs.position === "fixed") continue
        bad.push(`${el.tagName}.${String(el.className).slice(0, 50)} L${Math.round(r.left)} R${Math.round(r.right)}`)
      }
      if (bad.length > 12) break
    }
    return { docW: document.documentElement.scrollWidth, vw: innerWidth, bad: bad.slice(0, 12) }
  })
  console.log(w, JSON.stringify(overflow, null, 1))

  /* the deck: screenshot each card */
  await page.evaluate(() => document.querySelector("[data-work-deck]")?.scrollIntoView({ block: "center" }))
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/deck-${w}-card1.png` })
  await page.evaluate(() => {
    const d = document.querySelector("[data-work-deck]")
    if (d) d.scrollLeft = d.scrollWidth / 3
  })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/deck-${w}-card2.png` })
  await page.evaluate(() => {
    const d = document.querySelector("[data-work-deck]")
    if (d) d.scrollLeft = d.scrollWidth
  })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/deck-${w}-card3.png` })
  await page.close()
}
await browser.close()
console.log("done")
