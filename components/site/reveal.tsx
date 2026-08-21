"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * Scroll entrance.
 *
 * One shared IntersectionObserver drives every reveal on the page, so adding
 * more of them costs nothing. The animation itself lives in CSS (`.reveal`),
 * which means it is already covered by the global reduced-motion override.
 *
 * Without JavaScript the elements stay visible: `app/layout.tsx` ships a
 * <noscript> rule that neutralises `.reveal`.
 */

let sharedObserver: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  if (sharedObserver) {
    return sharedObserver
  }

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue
        }
        entry.target.setAttribute("data-revealed", "true")
        sharedObserver?.unobserve(entry.target)
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.01 }
  )

  return sharedObserver
}

type RevealProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Stagger, in milliseconds. Keep cascades under ~4 steps. */
  delay?: number
  /**
   * `fade` is the default entrance used across the page. `wipe` uncovers a
   * line of type from below; it is used once, on the closing headline, so it
   * still reads as deliberate.
   */
  variant?: "fade" | "wipe"
}

export function Reveal({
  className,
  delay = 0,
  variant = "fade",
  style,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    if (typeof IntersectionObserver === "undefined") {
      element.setAttribute("data-revealed", "true")
      return
    }

    const observer = getObserver()
    observer.observe(element)

    return () => observer.unobserve(element)
  }, [])

  return (
    <div
      ref={ref}
      className={cn(variant === "wipe" ? "reveal-wipe" : "reveal", className)}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      {...props}
    />
  )
}
