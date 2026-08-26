"use client"

import { useSyncExternalStore } from "react"

import Magnet from "@/components/react-bits/Magnet"
import { cn } from "@/lib/utils"

/**
 * Magnetic CTA wrapper — React Bits' `Magnet`, tuned for this site.
 *
 * Two decisions live here rather than in the primitive:
 *
 *  - **When it is allowed to run at all.** A button that walks away from the
 *    pointer is exactly the kind of movement `prefers-reduced-motion` is for,
 *    and on touch it would drift out from under the finger already pressing
 *    it. Both are ruled out below.
 *  - **How far it travels.** `magnetStrength` divides the pointer offset, so a
 *    *higher* number is a smaller pull. The stock default of 2 throws the
 *    button around; 6 with a 90px catch radius gives a few pixels of lean —
 *    noticed, not watched.
 *
 * The media queries are read through `useSyncExternalStore` rather than an
 * effect, so the value is correct on the first client render instead of
 * arriving one render later, and the server snapshot is `false` — a magnet
 * that has not been proven safe to run stays off.
 */

function subscribe(onChange: () => void) {
  const queries = [
    window.matchMedia("(hover: hover) and (pointer: fine)"),
    window.matchMedia("(prefers-reduced-motion: reduce)"),
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

function getSnapshot() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function getServerSnapshot() {
  return false
}

export function Magnetic({
  children,
  className,
  strength = 6,
  padding = 90,
}: {
  children: React.ReactNode
  className?: string
  /** Divisor on the pointer offset — larger means a smaller pull. */
  strength?: number
  /** Catch radius in pixels beyond the element's own box. */
  padding?: number
}) {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  /* Layout classes go on a wrapper, never on `Magnet` itself: the component
     sets its own `display` as an inline style, which silently outranks any
     display utility handed to `wrapperClassName` — so a `hidden sm:inline-flex`
     on it would render visible at every width. */
  return (
    <span className={cn("inline-flex", className)}>
      <Magnet disabled={!enabled} padding={padding} magnetStrength={strength}>
        {children}
      </Magnet>
    </span>
  )
}
