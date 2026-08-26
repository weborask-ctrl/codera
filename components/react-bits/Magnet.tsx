"use client"

import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
} from "react"

/**
 * Magnetic pointer attraction.
 *
 * Adapted from React Bits' `Magnet`. The behaviour and the props are the
 * original's; the implementation is not, for two reasons that showed up as
 * soon as it was put on a real page:
 *
 *  1. **It rendered React on every mouse move.** The stock component keeps the
 *     offset in `useState`, so moving the pointer anywhere near the element
 *     scheduled a render per frame — for a transform that never needed React
 *     to know about it. The offset now lives in a ref and is written straight
 *     to `style.transform` inside a rAF, so a hovering pointer costs zero
 *     renders.
 *  2. **The listener was global and unconditional.** It ran for every pointer
 *     move anywhere in the document, on every instance, including ones that
 *     were disabled. It is now skipped entirely when `disabled` is set, and
 *     the work per event is a bounding-box read that exits early.
 *
 * The movement is also damped rather than instant: the element chases the
 * pointer over a few frames instead of tracking it exactly, which is the
 * difference between a control that feels weighted and one that feels twitchy.
 */
interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Catch radius in pixels beyond the element's own box. */
  padding?: number
  disabled?: boolean
  /** Divisor on the pointer offset — a larger number means a smaller pull. */
  magnetStrength?: number
  wrapperClassName?: string
  innerClassName?: string
}

export default function Magnet({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  wrapperClassName = "",
  innerClassName = "",
  ...props
}: MagnetProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) {
      return
    }

    if (disabled) {
      inner.style.transform = ""
      return
    }

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let frame = 0

    const tick = () => {
      currentX += (targetX - currentX) * 0.16
      currentY += (targetY - currentY) * 0.16

      inner.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`

      if (
        Math.abs(targetX - currentX) > 0.05 ||
        Math.abs(targetY - currentY) > 0.05
      ) {
        frame = window.requestAnimationFrame(tick)
      } else {
        frame = 0
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const { left, top, width, height } = wrapper.getBoundingClientRect()
      const centreX = left + width / 2
      const centreY = top + height / 2

      const withinX = Math.abs(centreX - event.clientX) < width / 2 + padding
      const withinY = Math.abs(centreY - event.clientY) < height / 2 + padding

      if (withinX && withinY) {
        targetX = (event.clientX - centreX) / magnetStrength
        targetY = (event.clientY - centreY) / magnetStrength
      } else if (targetX === 0 && targetY === 0) {
        // Already parked and still out of range — nothing to schedule.
        return
      } else {
        targetX = 0
        targetY = 0
      }

      if (!frame) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
      inner.style.transform = ""
    }
  }, [padding, disabled, magnetStrength])

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
      style={{ position: "relative", display: "inline-flex" }}
      {...props}
    >
      <div
        ref={innerRef}
        className={innerClassName}
        style={{ display: "inline-flex", willChange: "transform" }}
      >
        {children}
      </div>
    </div>
  )
}
