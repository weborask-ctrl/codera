"use client"

/**
 * Shared machinery for the concept sites (AD v3 amendment 2).
 *
 * `Shell` is the section-level animator: it sets --tx/--ty from the pointer
 * (for .wpar parallax layers) and arms .wfx/.wdraw entrance choreography via
 * its own IntersectionObserver when the section enters. The CSS lives in
 * globals (`.world-shell` family); reduced motion neutralises everything
 * there, so the components stay dumb.
 *
 * `KonceptRibbon` is the honest label every concept page must wear: these are
 * Codera's demonstration sites, never fake clients, and the way back to the
 * studio is always one tap away.
 *
 * `fx(i)` staggers an entrance by i × 90 ms.
 */

import { useEffect, useRef } from "react"

export const MONO = { fontFamily: "var(--font-geist-mono)" }
export const FR = { fontFamily: "var(--font-fraunces), Georgia, serif" }
export const INST = { fontFamily: "var(--font-instrument), Georgia, serif" }
export const BRIC = { fontFamily: "var(--font-bricolage), var(--font-geist-sans), sans-serif" }

export function fx(i: number): React.CSSProperties {
  return { ["--fx-delay" as string]: `${(i * 0.09).toFixed(2)}s` }
}

export function Shell({
  children,
  className = "",
  style,
  as: Tag = "section",
  id,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  as?: "section" | "div" | "header" | "footer"
  id?: string
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-on", "")
            io.disconnect()
          }
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      /* biome-ignore lint/suspicious/noExplicitAny: polymorphic ref across the four allowed tags */
      ref={ref as any}
      className={`world-shell ${className}`}
      id={id}
      style={style}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty("--tx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
        e.currentTarget.style.setProperty("--ty", ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
      }}
      onPointerLeave={(e: React.PointerEvent<HTMLElement>) => {
        e.currentTarget.style.setProperty("--tx", "0")
        e.currentTarget.style.setProperty("--ty", "0")
      }}
    >
      {children}
    </Tag>
  )
}

/**
 * The honest label (Iterácia 0.8: Ondrej removed the floating corner
 * chips). A demo page still must say what it is — non-negotiable #3 —
 * so every concept footer renders this one quiet line back to the studio.
 */
export function KonceptLine() {
  return (
    <a href="/" className="underline decoration-current/40 underline-offset-2 transition-opacity hover:opacity-100">
      KONCEPT ŠTÚDIA CODERA
    </a>
  )
}
