/**
 * Codera C ribbon — production GLB builder.
 *
 * Reconstructs the approved folded-ribbon C as a true swept ribbon surface
 * (NOT an extrusion): one continuous strip that travels from the top-right
 * terminal around the left sweep to the bottom-right terminal, folding
 * sharply at the two approved diagonal creases and diving backwards in Z
 * between them, so the front orthographic view matches the approved 2D
 * mark exactly (Z never alters the XY footprint) while oblique views show
 * real ribbon depth, believable folds, and front/back surfaces.
 *
 * Source of truth for the 2D geometry: the approved parametric mark
 * (scripts/generate-brand-mark.mjs) — spine, half-width, crease planes,
 * terminal cuts. This file is the 3D "source file" of the deliverable:
 * the model is fully parametric; edit the tunables and re-run.
 *
 * Output: CODERA_3D_LOGO_DELIVERABLES/codera-c-ribbon.glb
 * (hand-assembled glTF 2.0 binary — no runtime dependencies).
 */

import { writeFileSync, mkdirSync } from "node:fs"
import {
  SPINE, HALF_WIDTH, CUT_A, CUT_B, CREASE_1, CREASE_2,
} from "./generate-brand-mark.mjs"

// ---- 3D tunables -----------------------------------------------------------

const ROWS_A = 80         // samples along the top strap
const ROWS_B = 180        // samples along the folded band
const ROWS_C = 80         // samples along the bottom strap
const ROWS = ROWS_A + ROWS_B + ROWS_C
const COLS = 20           // samples across the width
const FRONT_Z = 5         // straps float this far toward the viewer
const DIVE_DEPTH = 12     // how far behind the mid-sweep bowl recedes
const FOLD_REACH = 20     // 2D distance over which the dive completes
const FOLD_ROUND = 1.5    // crease tip radius: visually crisp, normal-smooth
const TILT = 9           // differential z across the width in the bowl
const THICKNESS = 1.2     // paper-believable ribbon thickness
const SCALE = 1 / 100     // logo space (~100 units) -> ~1.0 unit asset

// ---- 2D spine (Catmull-Rom, same as the approved generator) ---------------

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

function normal2(t) {
  const e = 0.001
  const [x1, y1] = point(Math.max(0, t - e))
  const [x2, y2] = point(Math.min(1, t + e))
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  return [-dy / len, dx / len]
}

const sdist = ({ p, n }, [x, y]) => (x - p[0]) * n[0] + (y - p[1]) * n[1]

/** 2D surface point: t along the spine, w in [-1, 1] across the width. */
function p2(t, w) {
  const [x, y] = point(t)
  const [nx, ny] = normal2(t)
  return [x + nx * HALF_WIDTH * w, y + ny * HALF_WIDTH * w]
}

// ---- Z profile: straps in front, bowl diving behind, sharp diagonal folds -

function zField([x, y], w) {
  const q = [x, y]
  const s1 = sdist(CREASE_1, q)
  const s2 = sdist(CREASE_2, q)
  if (s1 <= 0 || s2 <= 0) return FRONT_Z // strap sides of either crease
  // Band between the creases: ease-out dive whose tip is rounded over
  // FOLD_ROUND units — the fold stays visually crisp at mark scale while
  // the surface stays normal-continuous (no shading artifacts).
  const d = Math.min(s1, s2)
  const sharp = d >= FOLD_REACH ? 1 : 1 - (1 - d / FOLD_REACH) ** 2
  const r = Math.min(1, d / FOLD_ROUND)
  const round = r * r * (3 - 2 * r)
  const f = sharp * round
  // Differential tilt: the inner edge (w < 0) sits deeper, so the bowl's
  // normal leans away from the upper-left key light and the band shades
  // down toward the opening, like the approved mark.
  return FRONT_Z - (FRONT_Z + DIVE_DEPTH) * f + TILT * f * w
}

/** Mid-surface point in 3D (y-down logo space -> y-up world). */
function p3(t, w) {
  const [x, y] = p2(t, w)
  return [x - 50, 50 - y, zField([x, y], w)]
}

/** Exact height-field normal in world space (y flipped vs logo space). */
function fieldNormal(t, w) {
  const [x, y] = p2(t, w)
  const e = 0.35
  const dzdx = (zField([x + e, y], w) - zField([x - e, y], w)) / (2 * e)
  const dzdy = (zField([x, y + e], w) - zField([x, y - e], w)) / (2 * e)
  // world y = 50 - y2d, so dz/dyWorld = -dzdy; height-field normal:
  return norm([-dzdx, dzdy, 1])
}

// ---- Terminal cuts: warp the row parameter so end rows lie ON the cut ----

function tCut(cut, w, fromStart) {
  // March from the end inward to find where this width-column enters the
  // keep half-space (dot <= 0), then bisect.
  const inside = (t) => sdist(cut, p2(t, w)) <= 0
  let lo = fromStart ? 0 : 1
  let hi = fromStart ? 0.25 : 0.75
  if (inside(lo)) return lo
  // find a bracket
  let t = lo
  const step = fromStart ? 0.002 : -0.002
  while (!inside(t)) {
    t += step
    if (fromStart ? t > 0.3 : t < 0.7) break
  }
  hi = t
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (inside(mid)) hi = mid
    else lo = mid
  }
  return hi
}

// ---- Build the vertex grids ------------------------------------------------

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

const tStart = [] // per column
const tEnd = []
const tC1 = []    // per column: crossing of crease 1 along the column
const tC2 = []    // per column: crossing of crease 2

function tCrease(crease, w, lo, hi) {
  // Bisect for sdist == 0 along the column between lo and hi.
  let a = lo
  let b = hi
  const f = (t) => sdist(crease, p2(t, w))
  const fa = f(a)
  for (let i = 0; i < 48; i++) {
    const m = (a + b) / 2
    if ((f(m) <= 0) === (fa <= 0)) a = m
    else b = m
  }
  return (a + b) / 2
}

for (let j = 0; j <= COLS; j++) {
  const w = -1 + (2 * j) / COLS
  tStart.push(tCut(CUT_A, w, true))
  tEnd.push(tCut(CUT_B, w, false))
  tC1.push(tCrease(CREASE_1, w, tStart[j], 0.5))
  tC2.push(tCrease(CREASE_2, w, 0.5, tEnd[j]))
}

/**
 * Row parameter, crease-aligned: rows 0..ROWS_A span strap A up to the
 * crease-1 crossing of THIS column, rows up to ROWS_A+ROWS_B span the band
 * between the two crossings, the rest span strap C. Every column therefore
 * places a mesh edge exactly on each fold line — crisp folds, no straddling
 * quads, no shading artifacts.
 */
function rowT(i, j) {
  if (i <= ROWS_A) {
    return tStart[j] + (tC1[j] - tStart[j]) * (i / ROWS_A)
  }
  if (i <= ROWS_A + ROWS_B) {
    return tC1[j] + (tC2[j] - tC1[j]) * ((i - ROWS_A) / ROWS_B)
  }
  return tC2[j] + (tEnd[j] - tC2[j]) * ((i - ROWS_A - ROWS_B) / ROWS_C)
}

/** mid-surface sample + finite-difference frame */
function sample(i, j) {
  const w = -1 + (2 * j) / COLS
  const t = rowT(i, j)
  const P = p3(t, w)
  const ew = 0.02
  const w2 = Math.min(1, w + ew)
  const w1 = Math.max(-1, w - ew)
  const dW = sub(p3(t, w2), p3(t, w1))
  // Exact height-field normal: mesh-density-independent, artifact-free.
  const N = fieldNormal(t, w)
  const L = norm(dW) // lateral (outward at w=+1)
  return { P, N, L }
}

const grid = []
for (let i = 0; i <= ROWS; i++) {
  const row = []
  for (let j = 0; j <= COLS; j++) row.push(sample(i, j))
  grid.push(row)
}

// ---- Assemble indexed mesh: front sheet, back sheet, rails, caps ----------

const positions = []
const normals = []
const indices = []
let vtx = 0

function emitGrid(getPos, getNrm, flip) {
  const base = vtx
  for (let i = 0; i <= ROWS; i++) {
    for (let j = 0; j <= COLS; j++) {
      const s = grid[i][j]
      const p = getPos(s)
      const n = getNrm(s)
      positions.push(p[0], p[1], p[2])
      normals.push(n[0], n[1], n[2])
      vtx++
    }
  }
  const W1 = COLS + 1
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const a = base + i * W1 + j
      const b = a + 1
      const c = a + W1
      const d = c + 1
      if (!flip) indices.push(a, c, b, b, c, d)
      else indices.push(a, b, c, b, d, c)
    }
  }
}

const h = THICKNESS / 2
const off = (s, k) => [s.P[0] + s.N[0] * k, s.P[1] + s.N[1] * k, s.P[2] + s.N[2] * k]

// front + back sheets
emitGrid((s) => off(s, +h), (s) => s.N, false)
emitGrid((s) => off(s, -h), (s) => [-s.N[0], -s.N[1], -s.N[2]], true)

// rail walls (w = +1 outer, w = -1 inner)
function emitRail(j, dir) {
  const base = vtx
  for (let i = 0; i <= ROWS; i++) {
    const s = grid[i][j]
    const n = dir > 0 ? s.L : [-s.L[0], -s.L[1], -s.L[2]]
    for (const k of [+h, -h]) {
      const p = off(s, k)
      positions.push(p[0], p[1], p[2])
      normals.push(n[0], n[1], n[2])
      vtx++
    }
  }
  for (let i = 0; i < ROWS; i++) {
    const a = base + i * 2
    const b = a + 1
    const c = a + 2
    const d = c + 1
    if (dir > 0) indices.push(a, c, b, b, c, d)
    else indices.push(a, b, c, b, d, c)
  }
}
emitRail(COLS, +1)
emitRail(0, -1)

// terminal caps (rows 0 and ROWS): flat quadstrip across the width
function emitCap(i, cutN, flip) {
  const base = vtx
  const n3 = [cutN[0], -cutN[1], 0]
  for (let j = 0; j <= COLS; j++) {
    const s = grid[i][j]
    for (const k of [+h, -h]) {
      const p = off(s, k)
      positions.push(p[0], p[1], p[2])
      normals.push(n3[0], n3[1], n3[2])
      vtx++
    }
  }
  for (let j = 0; j < COLS; j++) {
    const a = base + j * 2
    const b = a + 1
    const c = a + 2
    const d = c + 1
    if (!flip) indices.push(a, c, b, b, c, d)
    else indices.push(a, b, c, b, d, c)
  }
}
emitCap(0, CUT_A.n, false)
emitCap(ROWS, CUT_B.n, true)

// ---- Center, scale ---------------------------------------------------------

let min = [1e9, 1e9, 1e9]
let max = [-1e9, -1e9, -1e9]
for (let i = 0; i < positions.length; i += 3) {
  for (let a = 0; a < 3; a++) {
    min[a] = Math.min(min[a], positions[i + a])
    max[a] = Math.max(max[a], positions[i + a])
  }
}
const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]
for (let i = 0; i < positions.length; i += 3) {
  for (let a = 0; a < 3; a++) positions[i + a] = (positions[i + a] - center[a]) * SCALE
}
min = min.map((v, a) => (v - center[a]) * SCALE)
max = max.map((v, a) => (v - center[a]) * SCALE)

// ---- glTF 2.0 binary assembly (no dependencies) ---------------------------

const posArr = new Float32Array(positions)
const nrmArr = new Float32Array(normals)
const idxArr = new Uint32Array(indices)

const pad4 = (n) => Math.ceil(n / 4) * 4
const posBytes = pad4(posArr.byteLength)
const nrmBytes = pad4(nrmArr.byteLength)
const idxBytes = pad4(idxArr.byteLength)
const bin = new Uint8Array(posBytes + nrmBytes + idxBytes)
bin.set(new Uint8Array(posArr.buffer), 0)
bin.set(new Uint8Array(nrmArr.buffer), posBytes)
bin.set(new Uint8Array(idxArr.buffer), posBytes + nrmBytes)

const gltf = {
  asset: { version: "2.0", generator: "codera build-ribbon-glb" },
  scene: 0,
  scenes: [{ name: "codera-c-ribbon-scene", nodes: [0] }],
  nodes: [{ name: "codera-c-ribbon", mesh: 0 }],
  meshes: [
    {
      name: "codera-c-ribbon",
      primitives: [
        { attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 },
      ],
    },
  ],
  materials: [
    {
      name: "codera-satin-titanium",
      pbrMetallicRoughness: {
        baseColorFactor: [0.82, 0.825, 0.835, 1],
        metallicFactor: 0.55,
        roughnessFactor: 0.55,
      },
    },
  ],
  accessors: [
    {
      bufferView: 0, componentType: 5126, count: posArr.length / 3,
      type: "VEC3", min: min, max: max,
    },
    { bufferView: 1, componentType: 5126, count: nrmArr.length / 3, type: "VEC3" },
    { bufferView: 2, componentType: 5125, count: idxArr.length, type: "SCALAR" },
  ],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: posArr.byteLength, target: 34962 },
    { buffer: 0, byteOffset: posBytes, byteLength: nrmArr.byteLength, target: 34962 },
    { buffer: 0, byteOffset: posBytes + nrmBytes, byteLength: idxArr.byteLength, target: 34963 },
  ],
  buffers: [{ byteLength: bin.byteLength }],
}

let json = JSON.stringify(gltf)
while (json.length % 4 !== 0) json += " "
const jsonBuf = Buffer.from(json, "utf8")

const total = 12 + 8 + jsonBuf.length + 8 + bin.byteLength
const glb = Buffer.alloc(total)
let o = 0
glb.writeUInt32LE(0x46546c67, o); o += 4 // magic "glTF"
glb.writeUInt32LE(2, o); o += 4
glb.writeUInt32LE(total, o); o += 4
glb.writeUInt32LE(jsonBuf.length, o); o += 4
glb.writeUInt32LE(0x4e4f534a, o); o += 4 // "JSON"
jsonBuf.copy(glb, o); o += jsonBuf.length
glb.writeUInt32LE(bin.byteLength, o); o += 4
glb.writeUInt32LE(0x004e4942, o); o += 4 // "BIN\0"
Buffer.from(bin.buffer).copy(glb, o)

mkdirSync("CODERA_3D_LOGO_DELIVERABLES", { recursive: true })
writeFileSync("CODERA_3D_LOGO_DELIVERABLES/codera-c-ribbon.glb", glb)

console.log("triangles:", idxArr.length / 3)
console.log("vertices:", posArr.length / 3)
console.log("glb bytes:", total)
console.log("bbox:", min.map((v) => v.toFixed(3)), max.map((v) => v.toFixed(3)))
