"use client"

import { useSyncExternalStore } from "react"

import { prefersReducedMotion } from "@/lib/motion"

/**
 * The film state: one mutable object shared between GSAP (which writes it —
 * the intro timeline once, then the scrubbed master timeline) and the R3F
 * frame loop (which reads it and poses the camera). React appears nowhere in
 * the per-frame path; this is the architecture the Phase 2 prototype
 * validated at the vsync floor under 4× CPU throttle.
 */
export const film = {
  cam: { x: 1.7, y: 4.75, z: 2.1 },
  target: { x: -0.9, y: 3.3, z: -0.6 },
  /** Ribbon idle breathing, damped to ~0 once the form has resolved. */
  idle: 1,
  /** Key light intensity, lerped between states. */
  key: 0.55,
  /** Transformation progress: 0 = the 2011 site, 1 = the Codera concept. */
  morph: 0,
  /** Plane visibility: 0 until the portal flight reveals it. */
  planeReveal: 0,
  /** Vitalis and Forma surfaces, revealed as the camera travels to them. */
  planeVitalis: 0,
  planeForma: 0,
  /** Environment tone: 0 graphite, 1 Vitalis paper, 2 Forma warm paper. */
  envTone: 0,
  /** Offer: 0 = the ribbon whole, 1 = split into its three strands. */
  strand: 0,
  /** Per-strand highlight (STRATÉGIA / DIZAJN / VÝVOJ). */
  glow0: 0,
  glow1: 0,
  glow2: 0,
  /** Pointer sway (−1..1), written by the pointer field on fine pointers. */
  swayX: 0,
  swayY: 0,
}

export type Film = typeof film

/**
 * Camera states. World scale: the C stands 10 units tall, centred on the
 * origin; the chevron terminals sit near (4.5, 2.9) and (4.4, −2.5), so the
 * portal axis runs through ≈ (4.45, 0.2). The transformation plane hangs
 * beyond the opening at (7.2, 0, −10).
 *
 * A → B is an AUTOPLAYED intro, not scroll: the brief's first priority is
 * commercial clarity, and the headline must be on screen within seconds —
 * not after 29% of a pin. Scroll owns the film from B onward.
 */
export const CAMERA_STATES = {
  /** A — Surface: raking across the top strap; abstract satin metal. */
  A: { cam: { x: 1.7, y: 4.75, z: 2.1 }, target: { x: -0.9, y: 3.3, z: -0.6 }, key: 0.55 },
  /** B — Reveal: the full C resolved, frame right; type owns the left. */
  B: { cam: { x: -6.5, y: 0.1, z: 23 }, target: { x: -2, y: 0.1, z: 0 }, key: 1.15 },
  /** C — Portal: flying through the gap between the chevron terminals. */
  C: { cam: { x: 4.45, y: 0.15, z: 4.6 }, target: { x: 5.4, y: 0.05, z: -9 }, key: 0.9 },
  /** D — Transformation: settled on the plane beyond the opening. */
  D: { cam: { x: 7.2, y: 0.1, z: -1.6 }, target: { x: 7.2, y: 0, z: -10 }, key: 1.0 },
  /** E1 — Konštrukt presented: off-axis, plane frame-right, metadata air left. */
  E1: { cam: { x: 3.4, y: 0.35, z: 1.6 }, target: { x: 4.9, y: 0, z: -10.6 }, key: 1.0 },
  /** E2 — Vitalis: lateral track left and deeper; the world turns to paper. */
  E2: { cam: { x: -1.6, y: 0.95, z: -3.4 }, target: { x: -0.1, y: 0.7, z: -16.2 }, key: 0.8 },
  /** E3 — Forma: further along the arc; warm paper. */
  E3: { cam: { x: -7.6, y: 1.65, z: -9.0 }, target: { x: -6.3, y: 1.35, z: -21.6 }, key: 0.8 },
  /** F — Offer: profile view — the three strands read as parallel bands. */
  F: { cam: { x: 14, y: 0.7, z: 2.6 }, target: { x: 0, y: -0.2, z: -1.8 }, key: 1.0 },
  /** G — Resolution: frontal; the strands re-merge into the completed C. */
  G: { cam: { x: 0.2, y: 0.35, z: 17.5 }, target: { x: 0, y: 0.35, z: 0 }, key: 1.1 },
} as const

/** The two deeper project surfaces, angled toward the camera path. */
export const PLANES = {
  vitalis: { position: [1.6, 0.7, -15.5] as const, rotationY: 0.24, width: 8.8, height: 5.5 },
  forma: { position: [-4.2, 1.4, -21] as const, rotationY: 0.38, width: 8.8, height: 5.5 },
}

/** Where the transformation plane lives, shared by the world and the states. */
export const PLANE = {
  position: [7.2, 0, -10] as const,
  width: 8.8,
  height: 5.5,
}

// ---- Capability tier -------------------------------------------------------

/** Probed once — a snapshot function must be cheap and stable. */
let webglProbe: boolean | null = null
function webglAvailable(): boolean {
  if (webglProbe === null) {
    try {
      const canvas = document.createElement("canvas")
      webglProbe = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
    } catch {
      webglProbe = false
    }
  }
  return webglProbe
}

function subscribe(onChange: () => void) {
  const queries = [
    window.matchMedia("(prefers-reduced-motion: reduce)"),
    window.matchMedia("(min-width: 1024px)"),
  ]
  for (const query of queries) {
    query.addEventListener("change", onChange)
  }
  return () => {
    for (const query of queries) {
      query.removeEventListener("change", onChange)
    }
  }
}

function snapshot(): "world" | "dom" {
  const wide = window.matchMedia("(min-width: 1024px)").matches
  return !prefersReducedMotion() && wide && webglAvailable() ? "world" : "dom"
}

/**
 * `null` on the server and during hydration (the DOM fallback renders — it is
 * also the LCP and the SEO content), then the real tier on the first client
 * render after hydration. Mobile is deliberately `dom` until Phase 6 authors
 * its own cinematic strategy: the world is a desktop composition.
 */
export function useCapabilityTier(): "world" | "dom" | null {
  return useSyncExternalStore(subscribe, snapshot, () => null)
}
