import { cn } from "@/lib/utils"

/**
 * THE ARC — Codera's mark, and the site's whole motion language.
 *
 * The mark is an open C: a single stroked arc with a 90° gap on the right.
 * That gap is the idea the site is built on — an unfinished circle, closed by
 * the end of the page. The same geometry does a different job in every scene,
 * which is what keeps four scenes reading as one environment rather than four
 * sections:
 *
 *   Scene 01  it draws itself, and leans towards the pointer
 *   Scene 02  it widens into the mask that wipes the dated site away
 *   Scene 02B it becomes the progress track of the pinned project stage
 *   Scene 03  it becomes the rule under the active service word
 *   Scene 04  it closes back into the complete C
 *
 * Geometry lives here, once: centre (12,12), radius 9, sweeping
 * counter-clockwise the long way round from 45° to −45°. Everything else
 * derives from these two exports, so the shape cannot drift between
 * components.
 */

/** The mark's path, on a 24×24 viewBox. */
export const ARC_PATH = "M18.364 5.636 A9 9 0 1 0 18.364 18.364"

export const ARC_CENTRE = 12
export const ARC_RADIUS = 9

/** A point on the mark's circle, in viewBox units. */
export function arcPoint(degrees: number): readonly [number, number] {
  const radians = (degrees * Math.PI) / 180
  return [
    ARC_CENTRE + ARC_RADIUS * Math.cos(radians),
    ARC_CENTRE + ARC_RADIUS * Math.sin(radians),
  ] as const
}

/**
 * The mark.
 *
 * Monochrome and stateless: it inherits `currentColor`, so the same component
 * works in the nav, on a paper chapter and in the footer with no second colour
 * variant and no client JavaScript. The polished-graphite treatment is a
 * separate, client-side component (`HeroArc`) because it needs per-instance
 * gradient ids and a pointer loop — neither of which belongs in the piece of
 * furniture that renders in the header on every page.
 *
 * `pathLength="1"` normalises the arc's length to 1 regardless of its actual
 * geometry, so drawing it is a plain 0–1 dash offset with no measurement pass
 * at runtime.
 */
export function Arc({
  className,
  weight = 2.4,
  draw,
  title,
}: {
  className?: string
  /** Stroke width in viewBox units; the mark is drawn 24 units square. */
  weight?: number
  /**
   * Draw progress, 0–1. Left undefined the arc is simply complete — which is
   * what SSR, `noscript` and reduced motion all get.
   */
  draw?: number
  /** Give a standalone instance an accessible name; omit when decorative. */
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-[1.15em] w-auto overflow-visible", className)}
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d={ARC_PATH}
        pathLength="1"
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        style={
          draw === undefined
            ? undefined
            : { strokeDasharray: 1, strokeDashoffset: 1 - draw }
        }
      />
    </svg>
  )
}

/**
 * Mark plus wordmark.
 *
 * The wordmark is set at its own optical size rather than inheriting the
 * surrounding text size: a logotype that resizes with its container stops
 * being a logotype.
 */
export function Logo({
  className,
  wordmark = true,
}: {
  className?: string
  wordmark?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Arc />
      {wordmark ? (
        <span className="text-[1.0625rem] leading-none font-semibold tracking-[-0.04em]">
          Codera
        </span>
      ) : null}
    </span>
  )
}

/**
 * A short segment of the arc, used as a rule and as an index marker — cut from
 * the same circle as the mark rather than drawn as a fresh curve, so even the
 * smallest furniture on the page is made of the logo.
 */
export function ArcTick({
  className,
  sweep = 60,
  weight = 2.4,
  stretch = false,
}: {
  className?: string
  /**
   * How many degrees of the mark's circle to cut, centred on its **top**.
   *
   * Centring is not a detail: a segment centred on 0° sits at the rightmost
   * point of the circle and comes out *vertical*, which is not what anything
   * using this wants. Anchoring to the top means a small sweep is a shallow,
   * near-horizontal rule and a large one curves — which is the whole range of
   * uses on the page, from a hover underline to a marker.
   */
  sweep?: number
  weight?: number
  /**
   * Let the segment fill its box instead of keeping its aspect ratio.
   *
   * SVG defaults to `xMidYMid meet`, which letterboxes: given a box that is
   * wide and a few pixels tall, the arc shrinks to a dot in the middle rather
   * than becoming the wide, shallow rule that was asked for. Set this wherever
   * the tick is used as a rule under something.
   */
  stretch?: boolean
}) {
  const [x1, y1] = arcPoint(-90 - sweep / 2)
  const [x2, y2] = arcPoint(-90 + sweep / 2)
  const large = Math.abs(sweep) > 180 ? 1 : 0
  const direction = sweep > 0 ? 1 : 0

  /**
   * When stretching, crop the viewBox to the segment itself.
   *
   * `preserveAspectRatio: none` maps the *viewBox* onto the element, not the
   * path — so a shallow segment inside the full 24-unit square stretches to
   * about a sixth of the width and leaves the rest empty. Cropping to the
   * segment's own bounds is what makes a rule actually span what it is under.
   * The top of the arc is always at y = centre − radius, since the segment is
   * centred on the top of the circle.
   */
  const top = ARC_CENTRE - ARC_RADIUS
  const viewBox = stretch
    ? `${x1} ${top} ${(x2 - x1).toFixed(3)} ${Math.max(y1 - top, 0.01).toFixed(3)}`
    : "0 0 24 24"

  return (
    <svg
      viewBox={viewBox}
      className={cn("h-2.5 overflow-visible", stretch ? "w-full" : "w-auto", className)}
      fill="none"
      preserveAspectRatio={stretch ? "none" : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={`M${x1.toFixed(3)} ${y1.toFixed(3)} A${ARC_RADIUS} ${ARC_RADIUS} 0 ${large} ${direction} ${x2.toFixed(3)} ${y2.toFixed(3)}`}
        stroke="currentColor"
        strokeWidth={weight}
        strokeLinecap="round"
        /* Under `preserveAspectRatio: none` the stroke is scaled with the box
           and would end up as thick as the element is tall. Anchoring it to
           the width keeps a rule looking like a rule. */
        vectorEffect={stretch ? "non-scaling-stroke" : undefined}
      />
    </svg>
  )
}

/** A numbered index — the tick is the arc, the number is set in the mono face. */
export function IndexMark({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <ArcTick className="h-2 translate-y-[-0.1em] text-brand" />
      <span className="label tnum text-muted-foreground">{value}</span>
    </span>
  )
}
