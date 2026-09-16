/**
 * Builds the site's self-hosted fonts (`app/fonts/*.woff2`) from the variable
 * sources Google Fonts serves from (the google/fonts repository), instanced
 * and subsetted with harfbuzz (subset-font):
 *
 * - the weight axis is pinned or narrowed to what the site renders
 *   (audit 2026-09-16: Fraunces was 274 KB of a 390 KB font payload on every
 *   page — the whole 100–900 weight range in two styles and two subsets,
 *   while the site uses italic 400 and normal 400–600),
 * - Fraunces keeps its optical-size axis, which is what the 118 px italic
 *   accent is designed around; SOFT and WONK stay at Google's defaults,
 * - Bricolage is instanced exactly where Google's static 800 sat
 *   (opsz 14, wdth 100), so nothing on the page changes shape,
 * - one file per face covering Basic Latin, Latin-1, Latin Extended-A (every
 *   Central European letter), general punctuation, the euro, the arrows and
 *   the few symbols the copy uses — instead of Google's latin + latin-ext
 *   pair, whose latin-ext block carries far more than Slovak needs.
 *
 * Sources are downloaded from pinned URLs into a temp directory; only the
 * outputs are committed. Licences: SIL Open Font License 1.1 (all five
 * families) — see SOURCES.md.
 *
 *   npm run fonts
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import subsetFont from "subset-font"

const OUT = path.resolve("app/fonts")
const SRC = path.join(tmpdir(), "codera-fonts-src")
const BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl"

/* the glyph set: ranges, not a word list, so anything a visitor types into
   the demos (a bakery name, a booking) still renders in the right face */
const RANGES = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1
  [0x100, 0x17f], // Latin Extended-A — š č ť ž ď ľ ň ŕ ô ä ... and their Central European kin
  [0x2000, 0x206f], // general punctuation — quotes, dashes, ellipsis
  [0x20ac, 0x20ac], // €
  [0x2190, 0x2199], // arrows
  [0x25b6, 0x25b6], // ▶
  [0x25c6, 0x25c6], // ◆
  [0x2713, 0x2713], // ✓
]
let TEXT = ""
for (const [a, b] of RANGES) {
  for (let c = a; c <= b; c++) {
    TEXT += String.fromCodePoint(c)
  }
}

/** face → source file, axes to pin or narrow */
const FACES = [
  { out: "fraunces-italic.woff2", src: "fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf", axes: { SOFT: 0, WONK: 0, wght: 400 } },
  { out: "fraunces.woff2", src: "fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf", axes: { SOFT: 0, WONK: 0, wght: { min: 400, max: 600 } } },
  { out: "geist.woff2", src: "geist/Geist[wght].ttf", axes: { wght: { min: 400, max: 700 } } },
  { out: "geist-mono.woff2", src: "geistmono/GeistMono[wght].ttf", axes: { wght: { min: 400, max: 700 } } },
  { out: "bricolage-800.woff2", src: "bricolagegrotesque/BricolageGrotesque[opsz,wdth,wght].ttf", axes: { opsz: 14, wdth: 100, wght: 800 } },
  { out: "instrument-serif.woff2", src: "instrumentserif/InstrumentSerif-Regular.ttf", axes: {} },
  { out: "instrument-serif-italic.woff2", src: "instrumentserif/InstrumentSerif-Italic.ttf", axes: {} },
]

async function source(rel) {
  const file = path.join(SRC, rel.replace(/[/[\],]/g, "_"))
  try {
    await stat(file)
    return readFile(file)
  } catch {
    const res = await fetch(`${BASE}/${encodeURI(rel)}`)
    if (!res.ok) {
      throw new Error(`${rel}: ${res.status}`)
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await mkdir(SRC, { recursive: true })
    await writeFile(file, buf)
    return buf
  }
}

await mkdir(OUT, { recursive: true })
let total = 0
for (const face of FACES) {
  const src = await source(face.src)
  const out = await subsetFont(src, TEXT, {
    targetFormat: "woff2",
    variationAxes: Object.keys(face.axes).length ? face.axes : undefined,
  })
  await writeFile(path.join(OUT, face.out), out)
  total += out.length
  console.log(`${face.out.padEnd(32)} ${String(Math.round(out.length / 1024)).padStart(4)} KB  ← ${Math.round(src.length / 1024)} KB source`)
}
console.log(`total ${Math.round(total / 1024)} KB across ${FACES.length} files`)
