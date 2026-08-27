import { chromium } from "playwright"

const browser = await chromium.launch({ args: ["--use-angle=default"] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" })
await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" })
await page.waitForTimeout(1500)

const report = await page.evaluate(async () => {
  const el = document.querySelector("[data-zone=premena]")
  const rect = el.getBoundingClientRect()
  const top = rect.top + scrollY
  const start = top
  const end = top + rect.height - innerHeight
  scrollTo(0, Math.round(start + (end - start) * 0.45))
  await new Promise((r) => setTimeout(r, 400))

  const main = document.querySelector("main[data-experience=v3]")
  const sticky = el.querySelector(".sticky")
  const layers = [...sticky.children].map((c) => {
    const cs = getComputedStyle(c)
    const r = c.getBoundingClientRect()
    return {
      cls: c.className.slice(0, 60),
      clip: cs.clipPath.slice(0, 160),
      pos: cs.position,
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      bg: cs.backgroundColor,
      z: cs.zIndex,
    }
  })
  const beforeRoot = sticky.children[1]?.firstElementChild
  const bcs = beforeRoot ? getComputedStyle(beforeRoot) : null
  return {
    fold: main.style.getPropertyValue("--fold"),
    premenaP: (scrollY - start) / (end - start),
    stickyRect: (() => { const r = sticky.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })(),
    stickyDisplay: getComputedStyle(sticky).display,
    layers,
    beforeRootBg: bcs?.backgroundColor,
    beforeRootRect: beforeRoot ? (() => { const r = beforeRoot.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })() : null,
  }
})
console.log(JSON.stringify(report, null, 2))
await browser.close()
