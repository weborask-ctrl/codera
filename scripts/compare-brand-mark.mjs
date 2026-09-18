/**
 * The mark against the approved raster, same scale (issue #6).
 *
 * Both are rendered to a mask, cropped to their bounding boxes, resampled
 * into the same 400-unit box and overlaid. Two numbers come out: how much
 * of the silhouette agrees (intersection over union) and how much of the
 * bright front face does. Optionally writes the side-by-side — reference,
 * ours, overlay (reference cyan, ours magenta, agreement white) — to a
 * directory, for the pull request that changes the geometry.
 *
 *   npm run brand:compare               # numbers only
 *   npm run brand:compare -- <dir>      # + <dir>/mark-comparison.jpg
 *
 * `sharp` ships with Next (image optimisation); no extra install.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import sharp from "sharp"

const REF = "brand/source/02_CODERA_C_MARK_REFERENCE.png"
const SVG = "public/brand/codera-mark.svg"
const OUT = process.argv[2]
const S = 800
const N = 400

async function maskOf(input, isSvg) {
  const img = isSvg
    ? sharp(input, { density: 600 }).resize(S, S, { fit: "contain", background: "#000" }).flatten({ background: "#000" })
    : sharp(input).resize(S, S, { fit: "contain", background: "#000" })
  const { data, info } = await img.greyscale().raw().toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

function bbox(m, thr) {
  let x0 = m.w
  let y0 = m.h
  let x1 = 0
  let y1 = 0
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (m.data[y * m.w + x] > thr) {
        x0 = Math.min(x0, x)
        y0 = Math.min(y0, y)
        x1 = Math.max(x1, x)
        y1 = Math.max(y1, y)
      }
    }
  }
  return { x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

/** the mask's bounding box resampled into the N box; 0 ground, 1 back face, 2 front face */
function normalise(m, thr) {
  const b = bbox(m, thr)
  const out = new Uint8Array(N * N)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const sx = Math.round(b.x0 + (x / N) * b.w)
      const sy = Math.round(b.y0 + (y / N) * b.h)
      const v = m.data[sy * m.w + sx]
      out[y * N + x] = v > 150 ? 2 : v > thr ? 1 : 0
    }
  }
  return { out, aspect: b.w / b.h }
}

const ref = normalise(await maskOf(REF, false), 40)
const ours = normalise(await maskOf(readFileSync(SVG), true), 40)

let both = 0
let either = 0
let faceBoth = 0
let faceEither = 0
const rgb = Buffer.alloc(N * N * 3)
for (let i = 0; i < N * N; i++) {
  const a = ref.out[i] > 0
  const b = ours.out[i] > 0
  if (a || b) either++
  if (a && b) both++
  const fa = ref.out[i] === 2
  const fb = ours.out[i] === 2
  if (fa || fb) faceEither++
  if (fa && fb) faceBoth++
  rgb[i * 3] = b ? 255 : a ? 40 : 12
  rgb[i * 3 + 1] = a ? 255 : b ? 40 : 12
  rgb[i * 3 + 2] = a && b ? 255 : a ? 255 : b ? 200 : 16
}

console.log(`silhouette IoU ${(both / either).toFixed(3)} · front-face IoU ${(faceBoth / faceEither).toFixed(3)}`)
console.log(`aspect (w/h): reference ${ref.aspect.toFixed(3)} · ours ${ours.aspect.toFixed(3)}`)

if (OUT) {
  const overlay = await sharp(rgb, { raw: { width: N, height: N, channels: 3 } }).png().toBuffer()
  const refPng = await sharp(REF).resize(N, N, { fit: "contain", background: "#000" }).png().toBuffer()
  const oursPng = await sharp(readFileSync(SVG), { density: 600 })
    .resize(N, N, { fit: "contain", background: "#000" })
    .flatten({ background: "#000" })
    .png()
    .toBuffer()
  const file = join(OUT, "mark-comparison.jpg")
  await sharp({ create: { width: N * 3 + 40, height: N, channels: 3, background: "#000" } })
    .composite([
      { input: refPng, left: 0, top: 0 },
      { input: oursPng, left: N + 20, top: 0 },
      { input: overlay, left: N * 2 + 40, top: 0 },
    ])
    .jpeg({ quality: 90 })
    .toFile(file)
  console.log(`wrote ${file}  (reference · ours · overlay)`)
}
