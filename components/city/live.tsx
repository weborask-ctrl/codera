"use client"

/**
 * The living city (Iterácia 3.6, Ondrej 2026-09-11: "A + C, vážne si daj na
 * tom záležať").
 *
 * A. Prílet cez oblaky. The hero opens inside a cloud: the plates of the veil
 *    cover the frame, the headline is readable on them from the first paint,
 *    and over the next two seconds the veil parts — the near plates drift out
 *    left and right and thin, the haze clears — while the whole world settles
 *    down from a slightly wider shot, as if we were landing. Nothing is
 *    built and nothing is cut: the city is whole from the first pixel.
 *    (Exo Ape: slow dissolves, never wipes; type floats over the world at
 *    full opacity. Our own passages t1–t4: arriving through clouds.)
 *
 * C. Živé mesto. After the arrival the picture is not a still. The render is
 *    cut into a sky and four groups — the three islands and the bridges —
 *    that sit at different depths, so the pointer gives the scene a gentle
 *    parallax (the stage writes it, see `data-lean`), foreground clouds
 *    drift slowly across, a light travels along the glass tubes now and
 *    then, and the world breathes. Amplitudes are a few pixels; the copy
 *    never moves. (Lusion: input maps to motion instantly, cinematics happen
 *    around it. Zentry: a living world breathing between huge type.)
 *
 * Everything but the pointer is plain CSS, so it starts at first paint on the
 * server-rendered plate and the stage can resume it mid-motion through
 * `--live-t0`. Phones keep the portrait plate and download none of this.
 */

import type { CSSProperties } from "react"
import { LIVE_ELEMENTS, type LiveGroup } from "./live-elements"

const LIVE = "/home/live"
/* a transparent pixel: the <img> fallback below 768 px, where nothing here shows */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
/* back to front; the number is how much the group leans with the pointer */
const GROUPS: readonly [LiveGroup, number][] = [
  ["right", 0.42],
  ["centre", 0.55],
  ["bridges", 0.55],
  ["left", 0.68],
]

function Sources({ name }: { name: string }) {
  return (
    <>
      <source
        media="(min-width: 768px)"
        type="image/avif"
        srcSet={`${LIVE}/${name}-1x.avif 1x, ${LIVE}/${name}-2x.avif 2x`}
      />
      <source
        media="(min-width: 768px)"
        type="image/webp"
        srcSet={`${LIVE}/${name}-1x.webp 1x, ${LIVE}/${name}-2x.webp 2x`}
      />
    </>
  )
}

function Cloud({
  name,
  className,
  lean,
  first = false,
}: {
  name: string
  className: string
  lean?: number
  /** part of the veil: wanted on the first frame */
  first?: boolean
}) {
  return (
    <picture className={className} data-lean={lean}>
      <Sources name={`cloud-${name}`} />
      <img
        className="city-live-img"
        src={PIXEL}
        alt=""
        decoding={first ? "sync" : "async"}
        fetchPriority={first ? "high" : "auto"}
      />
    </picture>
  )
}

export function LiveCity({ resumeFrom = 0 }: { resumeFrom?: number }) {
  const rootStyle =
    resumeFrom > 0
      ? ({ ["--live-t0" as string]: `${-Math.round(resumeFrom)}ms` } as CSSProperties)
      : undefined
  const bridges = LIVE_ELEMENTS.find((e) => e.id === "bridges")
  return (
    <div className="city-live" style={rootStyle}>
      <div className="city-live-world">
        <div className="city-live-sky" data-lean="0" />
        {GROUPS.map(([group, lean]) => (
          <div key={group} className="city-live-group" data-lean={lean}>
            {LIVE_ELEMENTS.filter((e) => e.group === group).map((e) => (
              <picture
                key={e.id}
                className="city-live-el"
                style={{ left: `${e.left}%`, top: `${e.top}%`, width: `${e.width}%` }}
              >
                <Sources name={e.id} />
                <img className="city-live-img" src={PIXEL} alt="" decoding="async" fetchPriority="high" />
              </picture>
            ))}
            {group === "bridges" && bridges ? (
              /* a light travels along the tubes: a moving highlight masked
                 with the bridges' own picture */
              <span
                className="city-live-glint"
                style={
                  {
                    left: `${bridges.left}%`,
                    top: `${bridges.top}%`,
                    width: `${bridges.width}%`,
                    aspectRatio: String(bridges.ratio),
                    ["--gm" as string]: `url("${LIVE}/bridges-1x.avif")`,
                  } as CSSProperties
                }
              />
            ) : null}
          </div>
        ))}
        {/* foreground clouds, always on the move, nearer than the city */}
        <Cloud name="wisp" className="city-live-cloud city-live-drift city-live-drift-far" lean={1.2} />
        <Cloud name="puff" className="city-live-cloud city-live-drift city-live-drift-near" lean={1.7} />
      </div>
      {/* the veil we arrive through; gone after two seconds */}
      <div className="city-live-arrive">
        <div className="city-live-haze" />
        <Cloud name="puff" className="city-live-cloud city-live-part city-live-part-l" first />
        <Cloud name="bank" className="city-live-cloud city-live-part city-live-part-r" first />
        <Cloud name="wisp" className="city-live-cloud city-live-part city-live-part-w" first />
      </div>
    </div>
  )
}

/** ms since the first paint — how far the server-rendered plate's arrival
 *  has already run when the stage takes over. */
export function liveElapsed(): number {
  if (typeof performance === "undefined") {
    return 0
  }
  const fcp = performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")
  const start = fcp ? fcp.startTime : 0
  return Math.max(0, performance.now() - start)
}
