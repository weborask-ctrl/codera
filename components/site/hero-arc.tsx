"use client"

import { useEffect, useId, useRef } from "react"
import { ARC_PATH } from "@/components/site/arc"
import { usePointerField } from "@/hooks/use-scene"
import { EASE, gsap, prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * The hero's mark: the arc at architectural scale, in polished graphite.
 *
 * Three layers of motion, each on a property the compositor can handle on its
 * own thread, and each doing a different job:
 *
 *  - **Draw.** On mount the arc writes itself in a single 1.5s stroke. It is
 *    the first thing that happens on the page and it is the mark *stating*
 *    itself, not a loading spinner.
 *  - **Specular.** A highlight travels the stroke once the draw lands, then
 *    idles. This is where the "black titanium" reads from — a moving
 *    highlight on a static gradient, which is how real metal behaves and how
 *    a flat chrome gradient never does.
 *  - **Lean.** The whole mark tips towards the pointer, damped, via the
 *    `--px`/`--py` field. Small — a couple of degrees. Enough to feel
 *    attached to the cursor, never enough to look like a toy.
 *
 * The gradient ids are per-instance (`useId`): a second arc elsewhere on the
 * page would otherwise silently adopt this one's fill, since SVG ids are
 * document-global.
 */
export function HeroArc({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const metalId = `arc-metal-${uid}`
  const specId = `arc-spec-${uid}`

  const fieldRef = usePointerField<HTMLDivElement>(1)
  const drawRef = useRef<SVGPathElement>(null)
  const specPathRef = useRef<SVGPathElement>(null)
  const specGradientRef = useRef<SVGLinearGradientElement>(null)

  useEffect(() => {
    const draw = drawRef.current
    const specPath = specPathRef.current
    const specGradient = specGradientRef.current
    if (!draw || !specPath || !specGradient) {
      return
    }

    // Reduced motion gets the finished mark, immediately and completely —
    // which is what the markup already renders, so there is nothing to undo.
    if (prefersReducedMotion()) {
      return
    }

    const timeline = gsap.timeline()

    timeline
      .fromTo(
        [draw, specPath],
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.5, ease: EASE.expo }
      )
      // The highlight sweeps the stroke once the shape exists. Tweening the
      // gradient's own coordinates rather than a transform: `gradientTransform`
      // is not reliably animatable as a CSS property across engines, but the
      // x1/x2 attributes are plain numbers and GSAP writes them directly.
      .fromTo(
        specGradient,
        { attr: { x1: -0.9, x2: -0.35 } },
        {
          attr: { x1: 1.35, x2: 1.9 },
          duration: 1.9,
          ease: "power1.inOut",
        },
        "-=0.75"
      )
      .to(specPath, { opacity: 0.5, duration: 0.6 }, "-=0.5")

    return () => {
      timeline.kill()
    }
  }, [])

  return (
    <div
      ref={fieldRef}
      className={cn(
        // `--px`/`--py` are written by the pointer field and default to 0, so
        // the resting transform is the identity and nothing depends on JS
        // having run.
        "[--px:0] [--py:0] will-change-transform",
        className
      )}
      style={{
        transform:
          "perspective(1200px) rotateX(calc(var(--py) * -5deg)) rotateY(calc(var(--px) * 7deg)) translate3d(calc(var(--px) * 0.9rem), calc(var(--py) * 0.9rem), 0)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full overflow-visible"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Polished graphite: one hue, five stops, angled so the highlight
              lands where a bevel would actually catch light. Not chrome, not
              gold, no rainbow. */}
          <linearGradient id={metalId} x1="0.1" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="var(--metal-high)" />
            <stop offset="30%" stopColor="var(--metal-mid)" />
            <stop offset="52%" stopColor="var(--metal-low)" />
            <stop offset="74%" stopColor="var(--metal-mid)" />
            <stop offset="100%" stopColor="var(--metal-high)" />
          </linearGradient>

          <linearGradient
            ref={specGradientRef}
            id={specId}
            x1="-0.9"
            y1="0"
            x2="-0.35"
            y2="1"
          >
            <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0" />
            <stop offset="50%" stopColor="oklch(1 0 0)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(1 0 0)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Rendered complete. GSAP applies the "from" state of the draw-on
            before first paint, so with scripting off the mark is simply
            there rather than clipped to nothing. */}
        <path
          ref={drawRef}
          d={ARC_PATH}
          pathLength="1"
          stroke={`url(#${metalId})`}
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset="0"
        />
        <path
          ref={specPathRef}
          d={ARC_PATH}
          pathLength="1"
          stroke={`url(#${specId})`}
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset="0"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}
