import { BufferAttribute, BufferGeometry, Vector3 } from "three"

import sweep from "./ribbon-geometry.json"

/**
 * The Codera ribbon as real geometry.
 *
 * Built by sweeping a chamfered rectangular cross-section along the sampled
 * spine from `ribbon-geometry.json` — the file the brand-mark generator
 * emits. The twist angle θ(t) in that data is what the static SVG renders as
 * the front/back fold, so the 3D object and the logo are projections of the
 * same definition, not two artworks.
 *
 * Construction notes, because each is a decision:
 *
 * - **The cross-section is a box, not a flat plane.** A zero-thickness band
 *   has no edges for light to catch, and edge highlights are most of what
 *   makes satin metal read as machined. Thickness and chamfer are small
 *   relative to the band so the silhouette stays the mark's.
 * - **Vertices are duplicated per side-strip.** Normals stay faceted across
 *   the chamfer (crisp edge highlight) and smooth along the length (no
 *   banding along the sweep). `computeVertexNormals` would smooth both.
 * - **The terminal cuts are the SVG's cut planes, applied by snapping.**
 *   Rings whose spine has passed a cut plane are projected back onto it along
 *   the tangent, which produces the diagonal chevron end faces exactly where
 *   the 2D mark has them — then each end is capped with a fan.
 */

type Frame = { p: [number, number]; n: [number, number]; theta: number }
type Cut = { p: [number, number]; n: [number, number] }

const FRAMES = sweep.frames as Frame[]
const HALF_WIDTH = sweep.halfWidth as number
const CUTS = sweep.cuts as [Cut, Cut]
const BOUNDS = sweep.bounds as {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** World scale: the mark stands `HEIGHT` units tall, centred on the origin. */
export const RIBBON_HEIGHT = 10
const S = RIBBON_HEIGHT / (BOUNDS.maxY - BOUNDS.minY)
const CX = (BOUNDS.minX + BOUNDS.maxX) / 2
const CY = (BOUNDS.minY + BOUNDS.maxY) / 2

/** SVG-space point (y down) to world (y up), centred. */
export function toWorld([x, y]: [number, number], z = 0): Vector3 {
  return new Vector3((x - CX) * S, (CY - y) * S, z)
}

/** A named point on the mark, for camera targets: t along the spine. */
export function spinePoint(t: number): Vector3 {
  const i = Math.min(FRAMES.length - 1, Math.max(0, Math.round(t * (FRAMES.length - 1))))
  return toWorld(FRAMES[i].p)
}

const HW = HALF_WIDTH * S
const HT = HW * 0.16 // half-thickness: slender, still catches edges
const CH = HT * 0.55 // chamfer

/** Chamfered-rectangle outline in local (u = width, v = thickness) coords. */
const OUTLINE: Array<[number, number]> = [
  [HW - CH, HT],
  [HW, HT - CH],
  [HW, -HT + CH],
  [HW - CH, -HT],
  [-HW + CH, -HT],
  [-HW, -HT + CH],
  [-HW, HT - CH],
  [-HW + CH, HT],
]

export function createRibbonGeometry(): BufferGeometry {
  const rings: Vector3[][] = []
  const ringBasis: Array<{ U: Vector3; V: Vector3; T: Vector3 }> = []

  for (const frame of FRAMES) {
    const P = toWorld(frame.p)
    // In-plane normal and tangent, mapped through the y-flip.
    const N = new Vector3(frame.n[0] * 1, -frame.n[1], 0).normalize()
    const T = new Vector3(-N.y, N.x, 0) // perpendicular, in plane
    const B = new Vector3().crossVectors(T, N) // ±z

    // Rotate the width axis around the tangent by θ — the twist itself.
    const cos = Math.cos(frame.theta)
    const sin = Math.sin(frame.theta)
    const U = N.clone().multiplyScalar(cos).addScaledVector(B, sin)
    const V = B.clone().multiplyScalar(cos).addScaledVector(N, -sin)

    rings.push(OUTLINE.map(([u, v]) => P.clone().addScaledVector(U, u).addScaledVector(V, v)))
    ringBasis.push({ U, V, T })
  }

  // Terminal cuts: snap overshooting vertices onto the cut plane along the
  // ring's tangent. Cut planes are vertical (contain z), defined in SVG space.
  const applyCut = (cut: Cut, ringRange: [number, number]) => {
    const planePoint = toWorld(cut.p)
    const planeNormal = new Vector3(cut.n[0], -cut.n[1], 0).normalize()
    for (let r = ringRange[0]; r <= ringRange[1]; r++) {
      const { T } = ringBasis[r]
      for (const vertex of rings[r]) {
        const d = vertex.clone().sub(planePoint).dot(planeNormal)
        if (d > 0) {
          const along = T.dot(planeNormal)
          if (Math.abs(along) > 1e-4) {
            vertex.addScaledVector(T, -d / along)
          }
        }
      }
    }
  }
  const third = Math.floor(rings.length / 3)
  applyCut(CUTS[0], [0, third])
  applyCut(CUTS[1], [rings.length - 1 - third, rings.length - 1])

  // Assemble: one smooth-along, faceted-around strip per outline segment.
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  const segs = OUTLINE.length

  for (let s = 0; s < segs; s++) {
    const sNext = (s + 1) % segs
    // Outward normal of this outline segment, in local (u, v).
    const [u1, v1] = OUTLINE[s]
    const [u2, v2] = OUTLINE[sNext]
    const nu = v2 - v1
    const nv = -(u2 - u1)
    const inv = 1 / Math.hypot(nu, nv)

    const base = positions.length / 3
    for (let r = 0; r < rings.length; r++) {
      const { U, V } = ringBasis[r]
      const worldNormal = new Vector3()
        .addScaledVector(U, nu * inv)
        .addScaledVector(V, nv * inv)
        .normalize()
      for (const vertex of [rings[r][s], rings[r][sNext]]) {
        positions.push(vertex.x, vertex.y, vertex.z)
        normals.push(worldNormal.x, worldNormal.y, worldNormal.z)
      }
    }
    for (let r = 0; r < rings.length - 1; r++) {
      const a = base + r * 2
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  }

  // End caps: after snapping, each terminal ring is planar on its cut plane.
  const cap = (ringIndex: number, flip: boolean) => {
    const ring = rings[ringIndex]
    const { T } = ringBasis[ringIndex]
    const n = T.clone().multiplyScalar(flip ? -1 : 1)
    const base = positions.length / 3
    for (const vertex of ring) {
      positions.push(vertex.x, vertex.y, vertex.z)
      normals.push(n.x, n.y, n.z)
    }
    for (let i = 1; i < ring.length - 1; i++) {
      if (flip) {
        indices.push(base, base + i + 1, base + i)
      } else {
        indices.push(base, base + i, base + i + 1)
      }
    }
  }
  cap(0, true)
  cap(rings.length - 1, false)

  const geometry = new BufferGeometry()
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3))
  geometry.setIndex(indices)
  return geometry
}
