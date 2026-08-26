"use client"

import { useInView, useMotionValue, useSpring } from "motion/react"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"

import { prefersReducedMotion } from "@/lib/motion"

/**
 * A number that counts up when it scrolls into view.
 *
 * Adapted from React Bits' `CountUp`. The spring-driven count is theirs; three
 * things had to change before it could be trusted with a price:
 *
 *  1. **It rendered an empty span.** The stock component returns
 *     `<span ref={ref} />` and fills it from an effect, so the server sends no
 *     number at all — with scripting off, or before hydration, "od 699 €"
 *     renders as "od  €". Here the finished value *is* the markup, and the
 *     start value is applied in a layout effect, before paint, and only when
 *     the animation is actually going to run.
 *  2. **It ignored reduced motion.** A number spinning up is motion like any
 *     other. With the preference set the figure simply reads correctly.
 *  3. **It formatted through `Intl` as `en-US` and then string-replaced the
 *     commas.** Grouping is done directly below instead: deterministic, and
 *     byte-identical on the server and the client, which a locale-dependent
 *     formatter is not.
 */

/* `useLayoutEffect` warns when it runs on the server, where it does nothing
   useful anyway. This is the standard guard. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

export default function CountUp({
  to,
  from = 0,
  duration = 2,
  className = "",
  separator = "",
}: {
  to: number
  from?: number
  duration?: number
  className?: string
  /** Thousands separator; omit for none. */
  separator?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(from)

  const springValue = useSpring(motionValue, {
    damping: 20 + 40 * (1 / duration),
    stiffness: 100 * (1 / duration),
  })

  const isInView = useInView(ref, { once: true, margin: "0px" })

  const format = useCallback(
    (value: number) => {
      const digits = Math.round(value).toString()
      return separator
        ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
        : digits
    },
    [separator]
  )

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion() || from === to) {
      return
    }

    /* Wind back to the start before the browser paints, so the finished value
       that came from the server is never seen flickering to zero. */
    element.textContent = format(from)
  }, [from, to, format])

  useEffect(() => {
    if (!isInView || prefersReducedMotion()) {
      return
    }
    motionValue.set(to)
  }, [isInView, motionValue, to])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest: number) => {
      if (ref.current) {
        ref.current.textContent = format(latest)
      }
    })

    return () => unsubscribe()
  }, [springValue, format])

  return (
    <span className={className} ref={ref}>
      {format(to)}
    </span>
  )
}
