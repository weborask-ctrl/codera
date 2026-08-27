/**
 * Step 5 performance QA: frame pacing through the whole journey under CPU
 * throttle, plus mobile LCP. Run against a PRODUCTION server:
 *
 *   npm run build && npm run start -- --port 3300
 *   node scripts/measure-experience.mjs http://localhost:3300
 */
import { chromium } from "playwright"

const BASE = process.argv[2] ?? "http://localhost:3300"

const browser = await chromium.launch({ args: ["--use-angle=default"] })

async function framePacing(throttle) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(2500)
  const result = await page.evaluate(async () => {
    const deltas = []
    let last = performance.now()
    let raf = 0
    const tick = () => {
      const now = performance.now()
      deltas.push(now - last)
      last = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const max = document.body.scrollHeight - innerHeight
    const t0 = performance.now()
    const duration = 14000
    await new Promise((resolve) => {
      const step = () => {
        const t = (performance.now() - t0) / duration
        if (t >= 1) {
          resolve()
          return
        }
        window.scrollTo(0, Math.round(max * t))
        setTimeout(step, 16)
      }
      step()
    })
    cancelAnimationFrame(raf)
    deltas.sort((a, b) => a - b)
    const pick = (q) => deltas[Math.floor(deltas.length * q)]
    const jank = deltas.filter((d) => d > 34).length / deltas.length
    return {
      frames: deltas.length,
      median: +pick(0.5).toFixed(1),
      p95: +pick(0.95).toFixed(1),
      jankPct: +(jank * 100).toFixed(1),
    }
  })
  await page.close()
  return result
}

async function mobileLcp(throttle) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle })
  await page.goto(BASE, { waitUntil: "load" })
  await page.waitForTimeout(3500)
  const metrics = await page.evaluate(async () => {
    let lcpValue = 0
    await new Promise((resolve) => {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) lcpValue = Math.max(lcpValue, e.startTime)
      })
      po.observe({ type: 'largest-contentful-paint', buffered: true })
      setTimeout(() => { po.disconnect(); resolve() }, 300)
    })
    const lcp = lcpValue ? { startTime: lcpValue } : null
    const cls = performance
      .getEntriesByType("layout-shift")
      .filter((e) => !e.hadRecentInput)
      .reduce((s, e) => s + e.value, 0)
    return { lcp: lcp ? Math.round(lcp.startTime) : null, cls: +cls.toFixed(4) }
  })
  await page.close()
  return metrics
}

console.log("desktop 1x:", JSON.stringify(await framePacing(1)))
console.log("desktop 4x:", JSON.stringify(await framePacing(4)))
console.log("mobile 390 6x:", JSON.stringify(await mobileLcp(6)))
await browser.close()
