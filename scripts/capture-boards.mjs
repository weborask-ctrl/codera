/**
 * Step 5 Phase B — captures the /boards compositions at the three device
 * classes for static design review. Run with the dev server on :3000:
 *
 *   node scripts/capture-boards.mjs [outDir]
 */

import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "playwright"

const OUT = process.argv[2] ?? "board-shots"
const BASE = process.env.BOARDS_BASE ?? "http://localhost:3000"
const BOARDS = ["01", "02", "03a", "03b", "03c", "04", "05"]
const DEVICES = [
  ["desktop", 1440, 900],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
]

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
for (const [device, width, height] of DEVICES) {
  const page = await browser.newPage({ viewport: { width, height } })
  for (const s of BOARDS) {
    await page.goto(`${BASE}/boards?s=${s}`, { waitUntil: "networkidle" })
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(250)
    await page.screenshot({ path: join(OUT, `${s}-${device}.png`) })
    console.log(`${s}-${device}.png`)
  }
  await page.close()
}
await browser.close()
