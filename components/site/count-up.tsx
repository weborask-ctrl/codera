"use client"

import { useEffect, useLayoutEffect, useRef } from "react"

import { prefersReducedMotion } from "@/lib/motion"

/**
 * A number that counts up the first time it scrolls into view.
 *
 * The behaviour comes from React Bits' `CountUp`, but none of its code does.
 * That component drives the count with `motion`'s spring — a ~120 KB library
 * pulled in for one animated integer on one page. This is the same effect in
 * thirty lines and no dependency, which is the trade the brief's performance
 * section asks for.
 *
 * Three properties the original did not have, and a price figure needs:
 *
 *  - **The finished value is the markup.** The original renders an empty span
 *    and fills it from an effect, so anything that does not run the effect
 *    sees "od  €". Here the server sends the real number, and the start value
 *    is written in a layout effect — before paint, and only when the count is
 *    actually going to run.
 *  - **Reduced motion is respected.** The figure simply reads correctly.
 *  - **Formatting is deterministic.** Grouping is done by hand rather than
 *    through `Intl`, so the server and the client cannot disagree about the
 *    separator and cause a hydration mismatch.
 */

/* `useLayoutEffect` warns when it runs on the server, where it does nothing
   useful anyway. This is the standard guard. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

function group(value: number, separator: string) {
  const digits = Math.round(value).toString()
  return separator
    ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : digits
}

export function CountUp({
  to,
  from = 0,
  duration = 1.4,
  separator = "",
  className,
}: {
  to: number
  from?: number
  /** Seconds. */
  duration?: number
  /** Thousands separator; omit for none. */
  separator?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion() || from === to) {
      return
    }
    /* Wind back before the browser paints, so the finished value that came
       from the server is never seen flickering to zero. */
    element.textContent = group(from, separator)
  }, [from, to, separator])

  useEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion() || from === to) {
      return
    }

    let frame = 0
    let start = 0

    const run = (now: number) => {
      if (!start) {
        start = now
      }
      const progress = Math.min(1, (now - start) / (duration * 1000))
      /* Ease out quint — the same curve the rest of the page settles on, so a
         number arriving feels like everything else arriving. */
      const eased = 1 - (1 - progress) ** 5
      element.textContent = group(from + (to - from) * eased, separator)

      if (progress < 1) {
        frame = requestAnimationFrame(run)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect()
            frame = requestAnimationFrame(run)
          }
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (frame) {
        cancelAnimationFrame(frame)
      }
      /* Restore the true value: a scene torn down mid-count must not leave a
         partial figure on screen. */
      element.textContent = group(to, separator)
    }
  }, [from, to, duration, separator])

  return (
    <span ref={ref} className={className}>
      {group(to, separator)}
    </span>
  )
}
