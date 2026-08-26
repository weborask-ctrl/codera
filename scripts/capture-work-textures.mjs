/**
 * Bakes the concept previews into textures for the spatial world.
 *
 * Usage: with a production server on :3200 (`next start --port 3200`), run
 * `node scripts/capture-work-textures.mjs`. Screenshots each frame on
 * /textures into public/work/<name>.jpg at 1440×900 (16:10).
 *
 * JPEG on purpose: the textures render on lit, angled 3D planes where
 * compression artefacts are invisible, and the four files together must not
 * cost what one PNG would.
 */
import { mkdirSync } from "node:fs"

import { chromium } from "@playwright/test"

const BASE = process.env.BASE ?? "http://localhost:3200"
const NAMES = ["legacy", "konstrukt", "vitalis", "forma"]

mkdirSync("public/work", { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1600, height: 1100 },
  deviceScaleFactor: 1,
})
await page.goto(`${BASE}/textures`, { waitUntil: "networkidle" })
await page.waitForTimeout(800)

for (const name of NAMES) {
  const frame = page.locator(`#texture-${name}`)
  await frame.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  await frame.screenshot({
    path: `public/work/${name}.jpg`,
    type: "jpeg",
    quality: 86,
  })
  console.log(`baked public/work/${name}.jpg`)
}

await browser.close()
