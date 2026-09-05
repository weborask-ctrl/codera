"use client"

/**
 * Experience entry (Iterácia 2.0 — Codera City): decides the edit and
 * assembles the page.
 *
 * - city mode: ≥1024px viewport + motion allowed → the fixed world stage
 *   behind the acts, camera flights on the seams, the street walk in /02
 * - flat mode: everything else (mobile/tablet edits, reduced motion, and
 *   the SSR default) → the same acts over their own plates of the same
 *   world; the story survives intact (same story, different edit)
 *
 * The decision is a useSyncExternalStore subscription, so SSR renders flat
 * deterministically and capable clients upgrade post-hydration. Reduced
 * motion is a layout: no stage, no flat parallax, entrances settled.
 */

import dynamic from "next/dynamic"
import { useEffect, useSyncExternalStore } from "react"
import { CitySections } from "@/components/city/sections"
import { ContactDrawer } from "./contact-drawer"
import { ExperienceNav } from "./nav"

const CityStage = dynamic(() => import("@/components/city/stage").then((m) => m.CityStage), {
  ssr: false,
})
const CityFlatMotion = dynamic(
  () => import("@/components/city/stage").then((m) => m.CityFlatMotion),
  { ssr: false }
)

const WIDE = "(min-width: 1024px)"
const REDUCE = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const wide = window.matchMedia(WIDE)
  const motion = window.matchMedia(REDUCE)
  wide.addEventListener("change", onChange)
  motion.addEventListener("change", onChange)
  return () => {
    wide.removeEventListener("change", onChange)
    motion.removeEventListener("change", onChange)
  }
}

type Mode = "city" | "flat" | "still"

function snapshot(): Mode {
  if (window.matchMedia(REDUCE).matches) {
    return "still"
  }
  return window.matchMedia(WIDE).matches ? "city" : "flat"
}

export function Experience() {
  const mode = useSyncExternalStore(subscribe, snapshot, () => "still" as Mode)
  const city = mode === "city"

  /* the hydration marker means "the edit is final": tests and the smoke
     script wait for it, and a deep link re-lands once the city edit has
     grown the page (the street walk and the seams add real scroll room) */
  useEffect(() => {
    if (mode !== snapshot()) {
      return
    }
    document.querySelector("main[data-experience]")?.setAttribute("data-hydrated", "")
    if (mode === "city" && window.location.hash.length > 1) {
      const target = document.getElementById(window.location.hash.slice(1))
      target?.scrollIntoView({ behavior: "instant" as ScrollBehavior })
    }
  }, [mode])

  return (
    <div className="experience" data-mode={mode}>
      <ExperienceNav />
      {city ? <CityStage /> : null}
      {mode === "flat" ? <CityFlatMotion /> : null}
      {/* keyed on the edit: the city edit is different DOM (the street walk,
          the seams), so the acts remount and bind their observers once */}
      <CitySections key={mode} city={city} />
      <ContactDrawer />
    </div>
  )
}
