"use client"

import { cn } from "@/lib/utils"

/**
 * A specular band that sweeps across a surface on hover.
 *
 * Adapted from React Bits' `GlareHover`. The effect — an angled linear
 * gradient oversized well beyond the element and slid corner to corner — is
 * the original's. The implementation is CSS only:
 *
 *  - The original drives the sweep from `onMouseEnter` / `onMouseLeave`
 *    handlers that write inline styles. Those handlers sat on a plain `<div>`,
 *    which is both an accessibility lint failure (interaction handlers on a
 *    static element) and a promise the component cannot keep — a
 *    keyboard user never triggers it. Moving the sweep to `:hover` and
 *    `:focus-within` costs no JavaScript and reaches focus as well as hover.
 *  - The original hard-codes its own box: `width`, `height`, `background` and
 *    `border` are props with pixel defaults. Here the component is a pure
 *    overlay that inherits whatever it is placed inside, so a project stage
 *    and a button can share it without either being told what size to be.
 *
 * The glare colour is deliberately not white: on a graphite ground a white
 * band reads as cellophane. It rides the metal ramp instead, which is the same
 * material the mark is made of.
 */
export function GlareHover({
  children,
  className,
  /** Angle of the band, in degrees. */
  angle = -32,
  /** Sweep duration in milliseconds. */
  duration = 750,
}: {
  children: React.ReactNode
  className?: string
  angle?: number
  duration?: number
}) {
  return (
    <div className={cn("group/glare relative isolate overflow-hidden", className)}>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 translate-x-[-120%] opacity-0 transition-[transform,opacity] ease-[var(--ease-out-quint)] group-hover/glare:translate-x-[120%] group-hover/glare:opacity-100 group-focus-within/glare:translate-x-[120%] group-focus-within/glare:opacity-100 motion-reduce:hidden"
        style={{
          transitionDuration: `${duration}ms`,
          background: `linear-gradient(${angle}deg, transparent 38%, var(--metal-high) 50%, transparent 62%)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}

export default GlareHover
