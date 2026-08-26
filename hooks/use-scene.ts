"use client"

import { useEffect, useRef } from "react"

import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/motion"

type SceneSetup = (context: {
  /** The scene root. Selectors are already scoped to it. */
  root: HTMLElement
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  /** `gsap.utils.selector` bound to the root — `q(".layer")`, not `document`. */
  q: (selector: string) => Element[]
}) => void

/**
 * Builds one scroll-linked scene and tears it down completely.
 *
 * Every scene on this page is registered through this hook, which buys three
 * things that are easy to get wrong one component at a time:
 *
 *  1. **Scoped cleanup.** `gsap.context()` records every tween, timeline and
 *     ScrollTrigger created inside `setup`, and `revert()` kills exactly those
 *     and restores the inline styles they wrote. Nothing leaks across a route
 *     change, and — unlike `ScrollTrigger.getAll().forEach(kill)` — one scene
 *     unmounting cannot take the rest of the page's triggers with it.
 *
 *  2. **Reduced motion is a layout, not a fallback.** When the preference is
 *     set, `setup` is never called at all: no pinning, no scrubbing, no
 *     transforms. The scene has to be readable in that state, which is why
 *     `data-motion` below is opt-*in*. The DOM's resting state is the finished
 *     state, and motion only ever animates *towards* it.
 *
 *  3. **A styling hook.** `data-motion="on"` lands on the root only once the
 *     effect has run, so CSS can key layered/absolute positioning off it and
 *     fall back to ordinary document flow with scripting off, during SSR, and
 *     under reduced motion — all three at once, with one selector.
 */
export function useScene<T extends HTMLElement = HTMLDivElement>(
  setup: SceneSetup
) {
  const ref = useRef<T>(null)

  /* Scenes pass an inline closure, so `setup` is a new function every render.
     Holding it in a ref — refreshed by its own effect — keeps the scene effect
     below on a genuinely empty dependency list: the timelines are built once
     on mount and torn down once on unmount, which is the actual intent, and
     both linters can verify it rather than being told to look away. */
  const setupRef = useRef(setup)
  useEffect(() => {
    setupRef.current = setup
  })

  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) {
      return
    }

    /* Deferred by one frame, and not as an optimisation: a pinned
       ScrollTrigger re-parents its element into a pin-spacer the moment it is
       created. When a scene mounts only to be swapped out on the very next
       render — the server-rendered fallback being replaced by the WebGL world
       after hydration — a pin created synchronously here leaves React trying
       to unmount a node whose parent ScrollTrigger changed under it, which
       crashes with removeChild. One rAF puts the swap decision first. */
    let context: ReturnType<typeof gsap.context> | null = null
    const frame = requestAnimationFrame(() => {
      root.dataset.motion = "on"
      context = gsap.context((self) => {
        setupRef.current({
          root,
          gsap,
          ScrollTrigger,
          q: self.selector as (selector: string) => Element[],
        })
      }, root)
    })

    return () => {
      cancelAnimationFrame(frame)
      context?.revert()
      delete root.dataset.motion
    }
  }, [])

  return ref
}

/**
 * Damped pointer tracking, in normalised -1..1 coordinates.
 *
 * Writes two CSS custom properties (`--px`, `--py`) on the element and lets
 * CSS decide what to do with them, so the reaction can differ per layer
 * without another listener. The value chases the pointer rather than snapping
 * to it — that lag is the whole difference between "premium" and "twitchy".
 *
 * One `pointermove` listener, one rAF loop, and it parks itself the moment the
 * value settles. Skipped entirely for coarse pointers: on a phone there is no
 * hover, and running it would burn frames to move nothing.
 */
export function usePointerField<T extends HTMLElement = HTMLDivElement>(
  strength = 1
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion()) {
      return
    }

    if (window.matchMedia("(pointer: coarse)").matches) {
      return
    }

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let frame = 0

    const tick = () => {
      currentX += (targetX - currentX) * 0.075
      currentY += (targetY - currentY) * 0.075

      element.style.setProperty("--px", currentX.toFixed(4))
      element.style.setProperty("--py", currentY.toFixed(4))

      if (
        Math.abs(targetX - currentX) > 0.0005 ||
        Math.abs(targetY - currentY) > 0.0005
      ) {
        frame = window.requestAnimationFrame(tick)
      } else {
        frame = 0
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        return
      }

      targetX =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2 * strength
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2 * strength

      if (!frame) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    const onPointerLeave = () => {
      targetX = 0
      targetY = 0
      if (!frame) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    element.addEventListener("pointermove", onPointerMove)
    element.addEventListener("pointerleave", onPointerLeave)

    return () => {
      element.removeEventListener("pointermove", onPointerMove)
      element.removeEventListener("pointerleave", onPointerLeave)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [strength])

  return ref
}
