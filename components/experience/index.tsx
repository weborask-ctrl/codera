"use client"

/**
 * Step 5 experience entry: decides the mode and assembles the page.
 *
 * - world mode: ≥1024px viewport + WebGL + motion allowed → persistent
 *   canvas behind the acts (desktop/large-tablet spatial experience)
 * - flat mode: everything else (mobile/tablet edits, no WebGL, reduced
 *   motion, and the SSR default) → the same acts over their own act
 *   tones; the story survives intact (§2.6: same story, different edit)
 *
 * The decision is a useSyncExternalStore subscription, so SSR renders
 * flat deterministically and capable clients upgrade post-hydration.
 */

import dynamic from "next/dynamic"
import { useSyncExternalStore } from "react"
import { ExperienceActs } from "./acts"
import { ContactDrawer } from "./contact-drawer"
import { ExperienceNav } from "./nav"

const ExperienceWorld = dynamic(
  () => import("./world").then((m) => m.ExperienceWorld),
  { ssr: false }
)

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
  const wide = window.matchMedia("(min-width: 1024px)")
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
  wide.addEventListener("change", onChange)
  motion.addEventListener("change", onChange)
  return () => {
    wide.removeEventListener("change", onChange)
    motion.removeEventListener("change", onChange)
  }
}

function snapshot(): boolean {
  return (
    window.matchMedia("(min-width: 1024px)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    webglAvailable()
  )
}

export function Experience({ probe = false }: { probe?: boolean }) {
  const world = useSyncExternalStore(subscribe, snapshot, () => false)
  return (
    <div className="experience">
      <ExperienceNav />
      {world ? <ExperienceWorld /> : null}
      <ExperienceActs world={world} probe={probe} />
      <ContactDrawer />
    </div>
  )
}
