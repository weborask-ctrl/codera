/**
 * Captures the EcoDomček art direction boards.
 *
 *   node clients/ecodomcek/boards/capture.mjs
 *
 * Serves clients/ecodomcek/boards over a local static server (so ES modules
 * and fonts load), opens every board × device with Playwright's Chromium and
 * writes PNGs to clients/ecodomcek/boards/out/. No network is needed.
 */

import { readFile, stat } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"
import { chromium } from "@playwright/test"

const root = resolve(new URL(".", import.meta.url).pathname)
const port = 8765
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`)
    let path = normalize(decodeURIComponent(url.pathname))
    if (path === "/") path = "/index.html"
    const file = join(root, path)
    if (!file.startsWith(root)) throw new Error("outside root")
    await stat(file)
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" })
    res.end(await readFile(file))
  } catch {
    res.writeHead(404)
    res.end()
  }
})

const boards = [
  ["hero", "desktop"],
  ["living", "desktop"],
  ["xray", "desktop"],
  ["dollhouse", "desktop"],
  ["dusk", "desktop"],
  ["hero", "mobile"],
  ["living", "mobile"],
  ["dusk", "mobile"],
]
const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2 },
}

await new Promise((ok) => server.listen(port, "127.0.0.1", ok))
const only = process.argv[2]
const executablePath = process.env.CHROMIUM_PATH ?? (await stat("/opt/pw-browsers/chromium").then(() => "/opt/pw-browsers/chromium", () => undefined))
const browser = await chromium.launch({
  executablePath,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
})
try {
  for (const [board, device] of boards) {
    if (only && !`${board}-${device}`.includes(only)) continue
    const vp = viewports[device]
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor })
    const page = await context.newPage()
    page.on("pageerror", (e) => console.error(`[${board}-${device}]`, e.message))
    await page.goto(`http://127.0.0.1:${port}/index.html?board=${board}&device=${device}`)
    await page.waitForFunction(() => window.__boardReady === true, null, { timeout: 60_000 })
    await page.waitForTimeout(300)
    const out = join(root, "out", `${board}-${device}.png`)
    await page.screenshot({ path: out })
    console.log("wrote", out)
    await context.close()
  }
} finally {
  await browser.close()
  server.close()
}
