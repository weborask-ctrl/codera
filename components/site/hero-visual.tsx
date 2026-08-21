"use client"

import { useEffect, useRef } from "react"

import { BrowserFrame, PhoneFrame } from "@/components/site/device-frames"
import {
  VitalisMobilePreview,
  VitalisPreview,
} from "@/components/site/previews/vitalis"

/**
 * Hero visual: the same concept site shown at desktop and phone width, in
 * real device frames, rendered as live markup rather than a screenshot.
 *
 * Motion has two layers that must not fight over the same `transform`:
 *  - the outer element carries a continuous, damped scroll-progress transform
 *    (the value lags the real scroll, which is what makes it read as weight
 *    rather than as a jump);
 *  - the inner element carries the slow ambient float, so the composition
 *    keeps breathing when scrolling stops.
 *
 * Both are skipped entirely under `prefers-reduced-motion`.
 */
export function HeroVisual() {
  const outerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = outerRef.current
    if (!element) {
      return
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) {
      return
    }

    let current = 0
    let target = 0
    let frame = 0

    const read = () => {
      const travel = window.innerHeight * 0.9
      target = Math.min(1, Math.max(0, window.scrollY / travel))
    }

    const tick = () => {
      current += (target - current) * 0.09
      element.style.setProperty("--p", current.toFixed(4))

      if (Math.abs(target - current) > 0.0004) {
        frame = window.requestAnimationFrame(tick)
      } else {
        element.style.setProperty("--p", target.toFixed(4))
        frame = 0
      }
    }

    const onScroll = () => {
      read()
      if (!frame) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    read()
    current = target
    element.style.setProperty("--p", current.toFixed(4))
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  return (
    <div
      ref={outerRef}
      className="[--p:0] will-change-transform"
      style={{
        transform:
          "translate3d(0, calc(var(--p) * -2.5rem), 0) scale(calc(1 - var(--p) * 0.045))",
      }}
    >
      <div className="relative float-slow">
        {/* On a phone, showing a phone is the useful thing — a shrunken
            desktop frame would demonstrate nothing about mobile work. */}
        <div className="mx-auto w-[62%] max-w-[15rem] sm:hidden">
          <PhoneFrame label="Koncept webu pre súkromnú kliniku Vitalis v mobilnom zobrazení.">
            <VitalisMobilePreview />
          </PhoneFrame>
        </div>

        {/* From `lg` the browser frame is inset from the left to leave the
            phone a column of its own. The two overlap by a few pixels for
            depth, but the phone never covers the preview's content — and no
            negative offsets are used, so nothing can push the page wider
            than the viewport at the breakpoint boundary. */}
        <div className="hidden sm:block">
          <BrowserFrame
            url="vitalis-koncept.sk"
            label="Koncept webu pre súkromnú kliniku Vitalis, zobrazený v okne prehliadača."
            ratio="16 / 10"
            className="lg:ml-[7.5rem]"
          >
            <VitalisPreview />
          </BrowserFrame>

          <PhoneFrame
            label="Ten istý koncept v mobilnom zobrazení."
            className="absolute -bottom-6 left-0 hidden w-[8.5rem] lg:block"
          >
            <VitalisMobilePreview />
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}
