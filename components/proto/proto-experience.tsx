"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { CAMERA_STATES, film } from "@/components/proto/film"
import { usePointerField } from "@/hooks/use-scene"
import { EASE, gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/motion"

/**
 * PHASE 2 PROTOTYPE — the hardest interaction, in isolation.
 *
 * One pinned stage, one master scrubbed timeline, three camera states
 * (Surface → Reveal → Portal), DOM typography synchronised to the same
 * timeline, and the tier gate: reduced motion or no WebGL gets the SVG mark
 * and identical content with no canvas mounted at all.
 *
 * The kill criteria this route exists to answer live in
 * SPATIAL_REDESIGN_PROGRESS.md. Nothing here is final art.
 */

const RibbonWorld = dynamic(() => import("@/components/proto/ribbon-world"), {
  ssr: false,
})

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

/** Capability tier via external-store subscription: correct on the first
 *  client render, `null` on the server (fallback content renders). */
function subscribeMotionPreference(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)")
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function useCapabilityTier(): "world" | "dom" | null {
  return useSyncExternalStore(
    subscribeMotionPreference,
    () => (!prefersReducedMotion() && webglAvailable() ? "world" : "dom"),
    () => null
  )
}

export function ProtoExperience() {
  // null = undecided (SSR renders the fallback content, which is also the
  // LCP); the canvas fades in over it only when allowed. The dev override
  // exists for the harness's mount/unmount leak test.
  const capability = useCapabilityTier()
  const [override, setOverride] = useState<"world" | "dom" | null>(null)
  const tier = override ?? capability
  const [worldVisible, setWorldVisible] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const pointerRef = usePointerField<HTMLDivElement>(1)

  /* Fade the canvas in one frame after it mounts. */
  useEffect(() => {
    if (tier !== "world") {
      return
    }
    const frame = requestAnimationFrame(() => setWorldVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [tier])

  /* Pointer field feeds the film, not the DOM: the camera sways. */
  useEffect(() => {
    const element = pointerRef.current
    if (!element || tier !== "world") {
      return
    }
    let frame = 0
    const read = () => {
      film.swayX = Number.parseFloat(element.style.getPropertyValue("--px") || "0")
      film.swayY = Number.parseFloat(element.style.getPropertyValue("--py") || "0")
      frame = requestAnimationFrame(read)
    }
    frame = requestAnimationFrame(read)
    return () => cancelAnimationFrame(frame)
  }, [tier, pointerRef])

  /* The master timeline. Scroll scrubs it; everything else reads it. */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || tier !== "world") {
      return
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      })

      const { A, B, C } = CAMERA_STATES

      // State A → B: the pull-back reveal. Camera position, target, light
      // and the idle damping all tween on the same clock.
      timeline
        .fromTo(film.cam, { ...A.cam }, { ...B.cam, duration: 4 }, 0)
        .fromTo(film.target, { ...A.target }, { ...B.target, duration: 4 }, 0)
        .fromTo(film, { key: A.key, idle: 1 }, { key: B.key, idle: 0.25, duration: 4 }, 0)
        // DOM: the whisper label fades as the surface recedes…
        .to("[data-proto-whisper]", { opacity: 0, y: -20, duration: 0.8 }, 0.2)
        // …and the headline lands exactly as the camera settles.
        .fromTo(
          "[data-proto-line]",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.1, ease: EASE.quint, stagger: 0.12 },
          2.9
        )
        .fromTo(
          "[data-proto-actions]",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, ease: EASE.expo },
          3.5
        )
        // Hold on the hero…
        .to({}, { duration: 1.2 })
        // State B → C: the dolly toward the opening; headline hands off.
        .to(film.cam, { ...C.cam, duration: 3 }, 5.2)
        .to(film.target, { ...C.target, duration: 3 }, 5.2)
        .to(film, { key: C.key, duration: 3 }, 5.2)
        .to(
          "[data-proto-hero]",
          { opacity: 0, y: -60, filter: "blur(8px)", duration: 1.4 },
          5.4
        )
        .fromTo(
          "[data-proto-next]",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: EASE.quint },
          6.8
        )
    }, stage)

    return () => context.revert()
  }, [tier])

  /* Dev instrumentation for the harness (throwaway route only): trigger
     count, and a programmatic world mount/unmount for the leak test. */
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    w.__protoTriggers = () => ScrollTrigger.getAll().length
    w.__protoSetTier = (next: "world" | "dom") => {
      setWorldVisible(false)
      setOverride(next)
    }
    return () => {
      delete w.__protoTriggers
      delete w.__protoSetTier
    }
  }, [])

  return (
    <div ref={pointerRef}>
      <div
        ref={stageRef}
        className="relative min-h-[100svh] overflow-hidden bg-[#0d0d0f]"
      >
        {/* The world mounts above the fallback and fades in when ready. */}
        {tier === "world" ? (
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: worldVisible ? 1 : 0 }}
          >
            <RibbonWorld />
          </div>
        ) : null}

        {/* SVG fallback: identical content with no canvas mounted at all. */}
        {tier !== "world" ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-[image:url(/brand/codera-mark.svg)] bg-size-[min(52vw,26rem)] bg-center bg-no-repeat"
          />
        ) : null}

        {/* ---- DOM layer, synchronised to the film ---- */}
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between">
          <p
            data-proto-whisper
            className="label container-page pt-24 text-muted-foreground"
          >
            Prototyp — Ribbon Chamber
          </p>

          <div data-proto-hero className="container-page pb-24">
            <h1 className="text-mega max-w-[12ch] text-foreground">
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-proto-line className="block">
                  Vaša firma je lepšia,
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-proto-line className="block">
                  než ukazuje váš web.
                </span>
              </span>
            </h1>
            <div data-proto-actions className="mt-8 flex gap-3">
              <span className="inline-flex h-13 items-center rounded-full bg-brand px-7 text-[0.9375rem] font-medium text-brand-foreground">
                Začať projekt
              </span>
              <span className="inline-flex h-13 items-center rounded-full border border-border-strong/55 px-7 text-[0.9375rem]">
                Pozrieť prácu
              </span>
            </div>
          </div>

          <p
            data-proto-next
            className="label container-page absolute right-0 bottom-16 text-right text-muted-foreground opacity-0"
          >
            02 — Premena čaká za otvorom
          </p>
        </div>
      </div>

      {/* Runway proof: the world hands back to ordinary flow. */}
      <section className="container-page section-pad">
        <p className="label text-brand">Po pine</p>
        <p className="mt-4 max-w-[36rem] text-lead text-muted-foreground">
          Bežný obsah pokračuje pod svetom — dôkaz, že pin končí čisto a
          stránka sa vráti do normálneho toku.
        </p>
      </section>
    </div>
  )
}
