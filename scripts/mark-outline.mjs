/**
 * The flat mark, fitted to the approved reference (issue #6, 2026-09-16).
 *
 * `brand/source/02_CODERA_C_MARK_REFERENCE.png` was measured row by row
 * (`scratchpad/mark-compare.js`): two parallel 45° arms — the top one
 * thicker than the bottom one, as the render's perspective left it — with
 * HORIZONTAL terminal cuts, a horizontal crease under the top arm, a 45°
 * crease along the bottom arm, and a rounded chevron fold on the left whose
 * outer edge carries a bright rim of the front face. The earlier sweep had
 * horizontal arms and diagonal cuts: 74 % silhouette overlap. This outline
 * is the measured one, in a 100-unit box, y down.
 */

/* --- the outer boundary, clockwise from the top arm's top-left corner --- */
/* the top terminal and the top arm's inner edge */
const A1 = [43, 0]
const A2 = [94, 0]
const A3 = [70, 25] // rounded, gently
/* the counter: its top edge, then the inner fold curve (measured) */
const K1 = [49.5, 26.5]
const INNER = [
  [44.5, 31], [40.75, 34], [37.75, 37], [35.25, 40], [32.5, 43], [30.75, 46], [30.5, 49],
  [30.75, 52], [31.75, 55], [32.75, 58], [34.25, 61], [36.5, 64], [39.25, 67], [43, 70],
  [48.5, 73], [54.25, 76],
]
const K3 = [54.5, 76.5]
/* the bottom arm: crease edge up to the terminal, the terminal, the inner edge */
const B1 = [65.5, 66]
const B2 = [99.25, 66]
const B3 = [68, 99.5] // rounded
const B4 = [30, 99.5]
/* the outer fold curve (measured), bottom to top */
const OUTER = [
  [24.75, 94], [21.75, 91], [19, 88], [16, 85], [13.25, 82], [10.5, 79], [8.25, 76], [6.25, 73],
  [4.5, 70], [2.75, 67], [1.75, 64], [1, 61], [0.5, 58], [0.25, 55], [0, 52], [0.5, 49],
  [1, 46], [2, 43], [3.25, 40], [5, 37], [7.25, 34], [10, 31], [12.5, 28], [15.25, 25],
  [18, 22], [20.75, 19], [23.5, 16], [26.5, 13], [29.25, 10], [32, 7], [36, 4], [42.5, 1],
]
/* creases: where the front face gives way to the back */
const TOP_CREASE_Y = 26.5
const BOTTOM_CREASE_FOOT = [34.25, 99.5]

const f = (v) => (Math.round(v * 100) / 100).toString()
const L = ([x, y]) => `L ${f(x)} ${f(y)}`

/** Catmull-Rom through points → cubic Béziers (smooth, passes through each) */
function smoothThrough(points, tension = 0.5) {
  let d = ""
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3]
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3]
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

/** a rounded corner at P between the directions to A (in) and B (out) */
function round(A, P, B, r) {
  const u = norm([A[0] - P[0], A[1] - P[1]])
  const v = norm([B[0] - P[0], B[1] - P[1]])
  const pa = [P[0] + u[0] * r, P[1] + u[1] * r]
  const pb = [P[0] + v[0] * r, P[1] + v[1] * r]
  return { pa, pb, q: `Q ${f(P[0])} ${f(P[1])} ${f(pb[0])} ${f(pb[1])}` }
}
const norm = ([x, y]) => {
  const l = Math.hypot(x, y) || 1
  return [x / l, y / l]
}

export function silhouettePath() {
  const a3 = round(A2, A3, K1, 1.8)
  const b3 = round(B2, B3, B4, 3.4)
  return [
    `M ${f(A1[0])} ${f(A1[1])}`,
    L(A2),
    L(a3.pa),
    a3.q,
    L(K1),
    smoothThrough([K1, ...INNER, K3]),
    L(B1),
    L(B2),
    L(b3.pa),
    b3.q,
    L(B4),
    smoothThrough([B4, ...OUTER, A1]),
    "Z",
  ].join(" ")
}

/** the top strap: the front face of the top arm, down to its crease */
export function topStrapPath() {
  const a3 = round(A2, A3, K1, 1.8)
  const leftAtCrease = [15.25, TOP_CREASE_Y]
  return [`M ${f(A1[0])} ${f(A1[1])}`, L(A2), L(a3.pa), a3.q, L([70, TOP_CREASE_Y]), L(leftAtCrease), "Z"].join(" ")
}

/** the bottom strap: the front face of the bottom arm, up to its crease */
export function bottomStrapPath() {
  const b3 = round(B2, B3, B4, 3.4)
  return [`M ${f(B1[0])} ${f(B1[1])}`, L(B2), L(b3.pa), b3.q, L(BOTTOM_CREASE_FOOT), "Z"].join(" ")
}

/** the outer fold curve as an open path, bottom to top: stroked wide and
 *  clipped to the silhouette it becomes the bright rim of the front face
 *  wrapping the fold — a soft edge, not a second object */
export function outerCurvePath() {
  return `M ${f(B4[0])} ${f(B4[1])}${smoothThrough([B4, ...OUTER, A1])}`
}

/** the soft shadows the straps throw on the back face, along their creases */
export function shadowPaths() {
  const top = `M 23 ${f(TOP_CREASE_Y)} L 70 ${f(TOP_CREASE_Y)} L 62 ${f(TOP_CREASE_Y + 9)} L 27 ${f(TOP_CREASE_Y + 9)} Z`
  const bottom = `M ${f(B1[0])} ${f(B1[1])} L ${f(BOTTOM_CREASE_FOOT[0])} ${f(BOTTOM_CREASE_FOOT[1])} L ${f(BOTTOM_CREASE_FOOT[0] - 9)} ${f(BOTTOM_CREASE_FOOT[1])} L ${f(B1[0] - 11)} ${f(B1[1] + 2)} Z`
  return { top, bottom }
}

export const VIEW_BOX = "-1.5 -1.5 103 103"
