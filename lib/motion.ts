"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * The page's single motion engine.
 *
 * Everything that moves in response to scroll goes through GSAP and
 * ScrollTrigger, and through this module in particular — the plugin is
 * registered exactly once here rather than at the top of every component that
 * happens to need it. Two registrations are harmless; twenty scattered ones
 * are how a codebase ends up with two competing animation systems that each
 * assume they own the scroll position.
 *
 * Deliberately absent: a smooth-scroll library. Lenis and friends replace the
 * browser's scrolling with a JavaScript approximation of it, which breaks
 * find-in-page, native momentum on trackpads and phones, and the scroll
 * anchoring the browser does for free. The choreography here is scroll-*linked*
 * — it reads the real scroll position and never takes it over.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)

  /**
   * ScrollTrigger caches every start/end offset it computes. On a phone the
   * URL bar collapsing changes `innerHeight` without being a real layout
   * change, and refreshing on that produces a visible jump mid-scene. Ignoring
   * resizes that only change the height keeps pinned scenes stable while the
   * bar animates; a width change is a genuine layout change and still
   * refreshes.
   */
  ScrollTrigger.config({ ignoreMobileResize: true })
}

/** Duration presets, so timings stay recognisable across scenes. */
export const DURATION = {
  quick: 0.4,
  base: 0.8,
  slow: 1.2,
  scene: 1.6,
} as const

/**
 * The house curves. `expo` for entrances, `soft` for anything that eases both
 * in and out, and linear for scrubbed timelines — a scrubbed tween must never
 * carry its own easing, or the motion stops tracking the pointer/wheel and
 * starts fighting it.
 */
export const EASE = {
  expo: "expo.out",
  quint: "power4.out",
  soft: "power2.inOut",
  none: "none",
} as const

/** True when the visitor has asked for less movement. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export { gsap, ScrollTrigger }
