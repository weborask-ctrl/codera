"use client"

import { type ReactNode, useEffect, useMemo, useRef } from "react"

import { gsap, prefersReducedMotion } from "@/lib/motion"

/**
 * Word-by-word scroll-linked reveal.
 *
 * Adapted from React Bits' `ScrollReveal`. The word-splitting and the scrubbed
 * opacity/blur cascade are the original's. Three things were changed, and the
 * first was a bug that would have taken the whole page down with it:
 *
 *  1. **Its cleanup killed every ScrollTrigger on the page.** The original
 *     unmount handler runs `ScrollTrigger.getAll().forEach(t => t.kill())`,
 *     which is not "clean up after me", it is "clean up after everyone". On a
 *     page where four scenes own pinned timelines, this component unmounting
 *     would silently unpin all of them. It now builds its tweens inside a
 *     `gsap.context()` scoped to its own element and reverts only that.
 *  2. **It registered the plugin itself.** It now imports the single
 *     registered instance from `lib/motion`, so there is one engine on the
 *     page rather than one per component that happens to need it.
 *  3. **It had no reduced-motion path.** Scrubbing a blur onto text as the
 *     visitor scrolls is precisely what the preference exists to switch off.
 *     With it set, nothing is registered and the text is simply legible.
 *
 * The rotation was also dropped. Tilting a paragraph and straightening it on
 * scroll reads as a gimmick at this size, and it forced a `transform` onto an
 * element whose only other animated property was `filter`.
 */
export default function ScrollReveal({
  children,
  enableBlur = true,
  baseOpacity = 0.12,
  blurStrength = 5,
  containerClassName = "",
  textClassName = "",
  wordAnimationEnd = "bottom bottom",
}: {
  children: ReactNode
  enableBlur?: boolean
  baseOpacity?: number
  blurStrength?: number
  containerClassName?: string
  textClassName?: string
  wordAnimationEnd?: string
}) {
  const containerRef = useRef<HTMLParagraphElement>(null)

  const words = useMemo(() => {
    const text = typeof children === "string" ? children : ""
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) {
        return word
      }
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: the split is positional and the text is a static literal, so the index *is* the identity.
        <span className="word inline-block" key={index}>
          {word}
        </span>
      )
    })
  }, [children])

  useEffect(() => {
    const element = containerRef.current
    if (!element || prefersReducedMotion()) {
      return
    }

    const context = gsap.context(() => {
      const wordElements = element.querySelectorAll<HTMLElement>(".word")

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : "none" },
        {
          ease: "none",
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: element,
            start: "top bottom-=15%",
            end: wordAnimationEnd,
            scrub: true,
          },
        }
      )
    }, element)

    return () => context.revert()
  }, [enableBlur, baseOpacity, blurStrength, wordAnimationEnd])

  return (
    <p ref={containerRef} className={`${containerClassName} ${textClassName}`}>
      {words}
    </p>
  )
}
