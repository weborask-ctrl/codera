/**
 * Codera ribbon-mark generator.
 *
 * The approved mark is a flat ribbon swept along a C-shaped path with a
 * LONGITUDINAL twist: through the left curve the band turns over, so the
 * viewer sees the front face (bright) on the top arm, both faces split by the
 * twist line through the curve, and the front face again on the bottom arm.
 * The terminals are straight diagonal cuts, and the negative space between
 * them reads as a chevron.
 *
 * The construction is parametric so the same definition can drive the 3D
 * sweep later: `SPINE` is the centreline, `HALF_WIDTH` the band, and the
 * twist windows say where the band turns over.
 */

// ---- Tunables --------------------------------------------------------------

/** Centreline. Doubled points stiffen the spline into near-straight arms. */
export const SPINE = [
  [93, 24],
  [76, 17],
  [54, 15],
  [34, 17],   // top arm — straight, horizontal
  [17, 30],
  [13, 52],   // left back, shallow
  [20, 74],
  [38, 86],
  [60, 88],
  [78, 84],
  [92, 74],   // bottom arm — tilted slightly down-right
]

export const HALF_WIDTH = 12.4

/** Twist windows, as t along the spine: [start, end]. */
export const TWIST_IN = [0.28, 0.5]  // front face recedes, back face grows
export const TWIST_OUT = [0.6, 0.8] // back face recedes, front face returns

/** Terminal cuts: half-plane { p, n } keeps points where dot(x - p, n) <= 0. */
export const CUT_A = { p: [86, 24], n: [0.87, -0.5] } // top-right terminal
export const CUT_B = { p: [83, 79], n: [0.87, 0.5] }  // bottom-right terminal

/** Crease planes: where the bright straps fold away behind the back band. */
export const CREASE_1 = { p: [26, 26], n: [-0.66, 0.75] } // top-left fold
export const CREASE_2 = { p: [50, 76], n: [-0.8, -0.6] }  // bottom fold

// ---- Spline ---------------------------------------------------------------

function point(t) {
  const p = SPINE
  const n = p.length - 1
  const seg = Math.min(Math.floor(t * n), n - 1)
  const u = t * n - seg
  const p0 = p[Math.max(seg - 1, 0)]
  const p1 = p[seg]
  const p2 = p[seg + 1]
  const p3 = p[Math.min(seg + 2, n)]
  const cr = (a, b, c, d) =>
    0.5 *
    (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u ** 3)
  return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]
}

function normal(t) {
  const e = 0.001
  const [x1, y1] = point(Math.max(0, t - e))
  const [x2, y2] = point(Math.min(1, t + e))
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  return [-dy / len, dx / len]
}

const lerp = (a, b, u) => a + (b - a) * u
const smooth = (u) => u * u * (3 - 2 * u)


/** A point across the band: s = -1 (inner edge) .. +1 (outer edge). */
function across(t, s) {
  const [x, y] = point(t)
  const [nx, ny] = normal(t)
  return [x + nx * HALF_WIDTH * s, y + ny * HALF_WIDTH * s]
}

// ---- Strap construction ---------------------------------------------------
//
// The approved mark reads as three overlapping straps: a bright top arm, a
// grey back band descending the left, and a bright bottom arm passing over
// it. The creases are sharp diagonals, so the front straps are full-width
// bands clipped by crease half-planes rather than a gradual seam.

const STEPS = 90

/** Full-width band polygon over t0..t1. */
function bandPolygon(t0, t1) {
  const outer = []
  const inner = []
  for (let i = 0; i <= STEPS; i++) {
    const t = t0 + ((t1 - t0) * i) / STEPS
    outer.push(across(t, 1))
    inner.push(across(t, -1))
  }
  return [...outer, ...inner.reverse()]
}

// ---- Terminal-cut clipping (Sutherland–Hodgman, one half-plane at a time) --

function clip(polygon, { p, n }) {
  const inside = ([x, y]) => (x - p[0]) * n[0] + (y - p[1]) * n[1] <= 0
  const out = []
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    const ia = inside(a)
    const ib = inside(b)
    if (ia) out.push(a)
    if (ia !== ib) {
      const da = (a[0] - p[0]) * n[0] + (a[1] - p[1]) * n[1]
      const db = (b[0] - p[0]) * n[0] + (b[1] - p[1]) * n[1]
      const u = da / (da - db)
      out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)])
    }
  }
  return out
}

function toPath(polygon) {
  if (polygon.length === 0) return ""
  const fmt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`
  return `M ${fmt(polygon[0])} ` + polygon.slice(1).map((p) => `L ${fmt(p)}`).join(" ") + " Z"
}

export function paths() {
  // Back band: full width, spanning between the creases with a little
  // overlap so the straps visibly pass over it.
  const back = bandPolygon(0.22, 0.82)

  // Front straps: full-width bands clipped by their terminal and crease.
  let top = bandPolygon(0, 0.42)
  top = clip(top, CUT_A)
  top = clip(top, CREASE_1)

  let bottom = bandPolygon(0.58, 1)
  bottom = clip(bottom, CUT_B)
  bottom = clip(bottom, CREASE_2)

  // Crease shadows: cast by the straps onto the back band, faded along it.
  const shadowTop = bandPolygon(0.29, 0.4)
  const shadowBottom = bandPolygon(0.6, 0.71)

  // Draw order: back, shadows, straps.
  return {
    back: toPath(back),
    shadowTop: toPath(shadowTop),
    shadowBottom: toPath(shadowBottom),
    top: toPath(top),
    bottom: toPath(bottom),
  }
}

// ---- SVG emission ---------------------------------------------------------

function bounds() {
  let minX = 1e9
  let minY = 1e9
  let maxX = -1e9
  let maxY = -1e9
  for (let i = 0; i <= 200; i++) {
    const t = i / 200
    for (const side of [-1, 1]) {
      const [x, y] = across(t, side)
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  return { minX, minY, maxX, maxY }
}

function svg({ mono }) {
  const p = paths()
  const b = bounds()
  const pad = 1.5
  const viewBox = [
    (b.minX - pad).toFixed(1),
    (b.minY - pad).toFixed(1),
    (b.maxX - b.minX + 2 * pad).toFixed(1),
    (b.maxY - b.minY + 2 * pad).toFixed(1),
  ].join(" ")

  if (mono) {
    // One colour, two opacities: inherits currentColor, works on any ground.
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" aria-hidden="true">`,
      `  <path d="${p.back}" fill="currentColor" opacity="0.45"/>`,
      `  <path d="${p.top}" fill="currentColor"/>`,
      `  <path d="${p.bottom}" fill="currentColor"/>`,
      `</svg>`,
    ].join("\n")
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" role="img" aria-label="Codera">`,
    `  <title>Codera</title>`,
    `  <defs>`,
    `    <linearGradient id="cm-face" x1="0.1" y1="0" x2="0.45" y2="1">`,
    `      <stop offset="0" stop-color="#f5f5f3"/><stop offset="1" stop-color="#c3c3c1"/>`,
    `    </linearGradient>`,
    `    <linearGradient id="cm-back" x1="0.15" y1="0" x2="0.5" y2="1">`,
    `      <stop offset="0" stop-color="#5c5c5e"/><stop offset="0.55" stop-color="#a3a3a1"/><stop offset="1" stop-color="#7e7e7c"/>`,
    `    </linearGradient>`,
    `    <linearGradient id="cm-sh-top" gradientUnits="userSpaceOnUse" x1="24" y1="22" x2="12" y2="44">`,
    `      <stop offset="0" stop-color="#000" stop-opacity="0.4"/><stop offset="1" stop-color="#000" stop-opacity="0"/>`,
    `    </linearGradient>`,
    `    <linearGradient id="cm-sh-bottom" gradientUnits="userSpaceOnUse" x1="52" y1="78" x2="28" y2="82">`,
    `      <stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/>`,
    `    </linearGradient>`,
    `  </defs>`,
    `  <path d="${p.back}" fill="url(#cm-back)"/>`,
    `  <path d="${p.shadowTop}" fill="url(#cm-sh-top)"/>`,
    `  <path d="${p.shadowBottom}" fill="url(#cm-sh-bottom)"/>`,
    `  <path d="${p.top}" fill="url(#cm-face)"/>`,
    `  <path d="${p.bottom}" fill="url(#cm-face)"/>`,
    `</svg>`,
  ].join("\n")
}

import { writeFileSync } from "node:fs"

writeFileSync("public/brand/codera-mark.svg", `${svg({ mono: false })}\n`)
writeFileSync("public/brand/codera-mark-mono.svg", `${svg({ mono: true })}\n`)
console.log("wrote public/brand/codera-mark.svg and codera-mark-mono.svg")
