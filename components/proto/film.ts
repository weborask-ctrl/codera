"use client"

/**
 * The film state: one mutable object shared between the GSAP master timeline
 * (which writes it, scrubbed by scroll) and the R3F frame loop (which reads
 * it and poses the camera).
 *
 * This is the architectural experiment the prototype exists to validate:
 * scroll → GSAP timeline → plain numbers → camera, with React nowhere in the
 * per-frame path. GSAP stays the only animator; the canvas is a renderer.
 */
export const film = {
  cam: { x: 0.9, y: 4.1, z: 1.15 },
  target: { x: 0.2, y: 3.7, z: 0 },
  /** Ribbon slow idle rotation is scaled down as the camera pulls back. */
  idle: 1,
  /** Key light intensity, lerped between states. */
  key: 0.6,
  /** Pointer sway, written by the pointer field (–1..1). */
  swayX: 0,
  swayY: 0,
}

export type Film = typeof film

/**
 * Camera states, tuned against the real geometry. World scale: the C stands
 * 10 units tall, centred on the origin; the chevron opening's two terminal
 * tips sit near (4.5, 2.9) and (4.4, −2.5), so the portal axis runs through
 * ≈ (4.45, 0.2).
 */
export const CAMERA_STATES = {
  /** A — Surface: raking across the top strap, edge and brushed grain. */
  A: { cam: { x: 1.7, y: 4.75, z: 2.1 }, target: { x: -0.9, y: 3.3, z: -0.6 }, key: 0.55 },
  /** B — Reveal: the full C resolved, frame right; type owns the left. */
  B: { cam: { x: -2.4, y: 0.1, z: 20 }, target: { x: 1.9, y: 0.1, z: 0 }, key: 1.15 },
  /** C — Portal: flying through the gap between the chevron terminals. */
  C: { cam: { x: 4.45, y: 0.15, z: 4.6 }, target: { x: 5.1, y: 0.05, z: -8 }, key: 0.9 },
} as const
