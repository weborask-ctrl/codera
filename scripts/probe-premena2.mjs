import { chromium } from "playwright"

const OUT = process.argv[2] ?? "."
const browser = await chromium.launch({ args: ["--use-angle=default"] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" })
await page.addStyleTag({ content: "nextjs-portal{display:none!important} html{scroll-behavior:auto!important}" })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(2600)

/* replicate the capture sequence */
for (const y of [0, 225, 432, 1080]) {
  await page.evaluate((y) => scrollTo(0, y), y)
  await page.waitForTimeout(900)
}
await page.evaluate(() => scrollTo(0, 1548))
await page.waitForTimeout(900)

const report = await page.evaluate(() => {
  const main = document.querySelector("main[data-experience=v3]")
  const el = document.querySelector("[data-zone=premena]")
  const sticky = el.querySelector(".sticky")
  const before = sticky.children[1]
  const beforeRoot = before.firstElementChild
  const r = beforeRoot.getBoundingClientRect()
  const canvasWrap = document.querySelector("canvas")?.parentElement
  const ccs = canvasWrap ? getComputedStyle(canvasWrap) : null
  return {
    scrollY,
    fold: main.style.getPropertyValue("--fold"),
    beforeClip: getComputedStyle(before).clipPath.slice(0, 120),
    beforeOpacity: getComputedStyle(before).opacity,
    beforeRootRect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
    beforeRootBg: getComputedStyle(beforeRoot).backgroundColor,
    beforeRootOpacity: getComputedStyle(beforeRoot).opacity,
    stickyOverflow: getComputedStyle(sticky).overflow,
    canvasZ: ccs?.zIndex,
    canvasPos: ccs?.position,
    heroH1: (() => {
      const h = document.querySelector("h1")
      if (!h) return null
      const cs = getComputedStyle(h)
      return { opacity: cs.opacity, blend: cs.mixBlendMode, z: cs.zIndex }
    })(),
  }
})
console.log(JSON.stringify(report, null, 2))
await page.screenshot({ path: `${OUT}/probe2.png` })
await browser.close()
