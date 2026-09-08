"use client"

/**
 * The hero city builds itself (Iterácia 3.1, Ondrej 2026-09-07: "po častiach,
 * po poschodiach, podstavce najprv, jemne otáčať, na konci spojiť").
 *
 * The hero render is cut into an empty-sky base and twelve elements with
 * alpha, all from the same native 5504 px render: three rock bases, eight
 * buildings and one layer of bridges. Buildings and bridges are hand-traced
 * envelopes, rocks a dark-and-not-cloud mask; every pixel belongs to the
 * frontmost element whose envelope holds it, and the base keeps the original
 * picture wherever no element covers it, with sky extrapolated from the
 * surroundings behind the city. At rest the composite is the original with
 * no visible cuts (< 0.05 % of pixels differ); before the build the base is
 * plain sky with no ghost of the city.
 *
 * Choreography, all plain CSS so it starts at first paint on the
 * server-rendered plate and the stage can resume it mid-motion. It is a
 * building site, in the order a building site works:
 *   1. the rock bases rise out of the cloud floor and settle — the ground
 *   2. scaffolding goes up inside each building's silhouette
 *   3. the floors are poured from the ground up, one step per floor, with a
 *      fresh slab glowing at the top of the work
 *   4. the scaffold comes down when the top floor is in
 *   5. the bridges grow out from their middles and connect the islands
 *   6. a cloud puff settles in front of the feet
 * The headline never waits for any of it.
 */

import type { CSSProperties } from "react"
import { ASM_ELEMENTS } from "./assembly-elements"

const ASM = "/home/asm"
/* a transparent pixel: the <img> fallback below 768 px, where the layers are hidden */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

export function HeroAssembly({ resumeFrom = 0 }: { resumeFrom?: number }) {
  const rootStyle =
    resumeFrom > 0
      ? ({ ["--asm-t0" as string]: `${-Math.round(resumeFrom)}ms` } as CSSProperties)
      : undefined
  return (
    <div className="city-asm" style={rootStyle}>
      <div className="city-asm-base" />
      {ASM_ELEMENTS.map((e) => {
        const style = {
          left: `${e.left}%`,
          top: `${e.top}%`,
          width: `${e.width}%`,
          ["--d" as string]: `${e.delay}s`,
          ["--n" as string]: String(Math.max(1, e.floors)),
          /* the scaffold and the slab wear the element's own silhouette; the
             1x file is the one the picture below already loads on 1x screens */
          ["--m" as string]: `url("${ASM}/${e.id}-1x.avif")`,
        } as CSSProperties
        return (
          <span key={e.id} className={`city-asm-el city-asm-${e.kind}`} style={style}>
            <picture>
              {/* phones keep the portrait plate and must not download the
                  layers: the sources are gated on the media query and the
                  fallback img is a transparent pixel */}
              <source
                media="(min-width: 768px)"
                type="image/avif"
                srcSet={`${ASM}/${e.id}-1x.avif 1x, ${ASM}/${e.id}-2x.avif 2x`}
              />
              <source
                media="(min-width: 768px)"
                type="image/webp"
                srcSet={`${ASM}/${e.id}-1x.webp 1x, ${ASM}/${e.id}-2x.webp 2x`}
              />
              <img className="city-asm-img" src={PIXEL} alt="" decoding="async" fetchPriority="high" />
            </picture>
            {e.kind === "building" ? (
              <>
                <i className="city-asm-cage" />
                <i className="city-asm-slab" />
              </>
            ) : null}
          </span>
        )
      })}
      {/* a cloud puff settles last in front of the islands' feet */}
      {/* biome-ignore lint/performance/noImgElement: alpha cloud plate, decorative. */}
      <img className="city-asm-cloud" src="/home/cloud-one-a.webp" alt="" decoding="async" loading="lazy" />
    </div>
  )
}

/** ms since the first paint — how far the server-rendered plate's animation
 *  has already run when the stage takes over. */
export function assemblyElapsed(): number {
  if (typeof performance === "undefined") {
    return 0
  }
  const fcp = performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")
  const start = fcp ? fcp.startTime : 0
  return Math.max(0, performance.now() - start)
}
