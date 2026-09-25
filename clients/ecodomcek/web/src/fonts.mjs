/**
 * Builds the site's self-hosted fonts (`src/fonts/*.woff2`) from the variable
 * sources Google Fonts serves from (the google/fonts repository), instanced
 * and subsetted with harfbuzz (subset-font).
 *
 * The site used to pull all three faces from fonts.googleapis.com at runtime.
 * That is a render-blocking request to a third party on every page, it hands
 * every visitor's IP to Google (which EU courts have treated as a GDPR
 * problem for sites that embed Google Fonts), and it is the opposite of the
 * studio's own standard — Codera self-hosts and subsets every face it uses.
 *
 * Each face is pinned to the weights the CSS actually renders, and subsetted
 * to the ranges Slovak copy needs: Basic Latin, Latin-1, Latin Extended-A
 * (č ď ľ ĺ ň ŕ š ť ž and their Central European kin), general punctuation
 * (the „Slovak quotes", the em dash, the ellipsis), the euro and the arrows.
 *
 * Only the outputs are committed. Licences: SIL Open Font License 1.1 for
 * all four families.
 *
 * Needs `subset-font`, which Node resolves from the repository's own
 * node_modules. Only regenerating the faces needs it — `build.py` copies the
 * committed .woff2 files and has no new dependency.
 *
 *   node src/fonts.mjs
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import subsetFont from "subset-font"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, "fonts")
const SRC = path.join(tmpdir(), "ecodomcek-fonts-src")
const BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl"

const RANGES = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1
  [0x100, 0x17f], // Latin Extended-A
  [0x2000, 0x206f], // general punctuation — „ " — …
  [0x20ac, 0x20ac], // €
  [0x2190, 0x2199], // arrows
]
let TEXT = ""
for (const [a, b] of RANGES) {
  for (let c = a; c <= b; c++) {
    TEXT += String.fromCodePoint(c)
  }
}

/* site.css renders 300 / 400 / 500 sans, 200 and 300 serif, 400 / 500 mono.
   Newsreader keeps its optical-size axis — the serif is only ever used
   large and light, which is what opsz is for. Plex Mono is static in
   google/fonts, so its two weights are two files. */
const FACES = [
  { out: "hanken.woff2", src: "hankengrotesk/HankenGrotesk[wght].ttf", axes: { wght: { min: 300, max: 500 } } },
  { out: "newsreader.woff2", src: "newsreader/Newsreader[opsz,wght].ttf", axes: { wght: { min: 200, max: 300 } } },
  /* the poster headline (2026-09-25, client: "krajší, zaujímavejší font"):
     Fraunces pinned to its display optical size, fully SOFT (rounded like
     sanded timber) and WONK on (the leaning n, h, m); upright and italic */
  { out: "fraunces.woff2", src: "fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf",
    axes: { opsz: 144, SOFT: 100, WONK: 1, wght: { min: 300, max: 400 } } },
  { out: "fraunces-italic.woff2", src: "fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf",
    axes: { opsz: 144, SOFT: 100, WONK: 1, wght: { min: 300, max: 400 } } },
  { out: "plex-mono.woff2", src: "ibmplexmono/IBMPlexMono-Regular.ttf", axes: {} },
  { out: "plex-mono-500.woff2", src: "ibmplexmono/IBMPlexMono-Medium.ttf", axes: {} },
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
  console.log(`${face.out.padEnd(20)} ${String(Math.round(out.length / 1024)).padStart(4)} KB  ← ${Math.round(src.length / 1024)} KB source`)
}
console.log(`total ${Math.round(total / 1024)} KB across ${FACES.length} files`)
