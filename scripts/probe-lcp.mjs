import { chromium } from "playwright"

const BASE = process.argv[2] ?? "http://localhost:3300"
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const cdp = await page.context().newCDPSession(page)
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 })
await page.goto(BASE, { waitUntil: "load" })
await page.waitForTimeout(3500)
const out = await page.evaluate(async () => {
  const entries = []
  await new Promise((resolve) => {
    const po = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        entries.push({
          t: Math.round(e.startTime),
          tag: e.element?.tagName,
          cls: String(e.element?.className || "").slice(0, 70),
          text: (e.element?.textContent || "").slice(0, 40),
          url: e.url || null,
        })
      }
    })
    po.observe({ type: "largest-contentful-paint", buffered: true })
    setTimeout(() => {
      po.disconnect()
      resolve()
    }, 300)
  })
  return entries
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
