"use client"

/**
 * The paper intro (AD v3 amendment 5, Ondrej's brief).
 *
 * A strip of paper slides in along the top edge; at the right it curls into
 * the C — the brand story told literally, since the mark IS a folded strip.
 * The formed C lifts into 3D, tints a gentle blue, and hands off to the real
 * ribbon underneath.
 *
 * Graffiti-C craft (his reference): the C stays OPEN on the right; a bold
 * dark OUTLINE keyline sits under the body stroke; the DROP SHADOW is a hard
 * dark copy offset bottom-left (light from top-right). Layered: shadow →
 * outline → body.
 *
 * Mechanics: two paths. The STRIP path (the top run plus the bend into the
 * junction) carries a marching dash — the piece of paper. The ARC path (the
 * open C) draws from the junction as the strip feeds into it, lengths synced
 * so paper is neither created nor destroyed. GSAP timeline, overlapping
 * tweens, everything eased — the smoothness is the brief.
 *
 * Never blocks: pointer-events none, content visible beneath. Plays once per
 * session; reduced motion skips it entirely. While it plays, the real C
 * holds back (stage.introHold + html[data-intro]) so the mark never doubles.
 */

import { useEffect, useRef, useState } from "react"
import { gsap, prefersReducedMotion } from "@/lib/motion"
import { stage } from "./stage"

const SESSION_KEY = "codera-intro-done"

function shouldPlay(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  if (prefersReducedMotion()) {
    return false
  }
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1"
  } catch {
    return true
  }
}

export function ExperienceIntro() {
  /* the decision is made before first paint so the hold never flickers */
  const [play] = useState(shouldPlay)
  const svgRef = useRef<SVGSVGElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!play) {
      return
    }
    stage.introHold = true
    document.documentElement.setAttribute("data-intro", "")

    const svg = svgRef.current
    const wrap = stageRef.current
    if (!svg || !wrap) {
      return
    }

    const W = window.innerWidth
    const H = window.innerHeight
    const vmin = Math.min(W, H)

    /* the C's station mirrors the hero object: right of centre */
    const cx = W * (W < 1024 ? 0.72 : 0.8)
    const cy = H * 0.47
    const r = vmin * (W < 1024 ? 0.24 : 0.3)
    const topY = 44

    /* open C: gap on the RIGHT (graffiti rule — never close it).
       Entry at the top edge of the gap, sweeping over the top, left,
       bottom, ending at the gap's lower edge. */
    const a0 = -0.6 // ≈ -34° — upper gap edge
    const a1 = 0.6 // ≈ +34° — lower gap edge
    const p0 = { x: cx + r * Math.cos(a0), y: cy + r * Math.sin(a0) }
    const p1 = { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) }

    const stripD = `M ${-0.2 * W} ${topY} L ${p0.x - 0.22 * W} ${topY} C ${p0.x - 0.08 * W} ${topY}, ${p0.x + r * 0.34} ${topY + (p0.y - topY) * 0.18}, ${p0.x} ${p0.y}`
    const arcD = `M ${p0.x} ${p0.y} A ${r} ${r} 0 1 0 ${p1.x} ${p1.y}`

    for (const el of svg.querySelectorAll<SVGPathElement>("[data-strip]")) {
      el.setAttribute("d", stripD)
    }
    for (const el of svg.querySelectorAll<SVGPathElement>("[data-arc]")) {
      el.setAttribute("d", arcD)
    }

    const stripEl = svg.querySelector<SVGPathElement>("[data-strip]")
    const arcEl = svg.querySelector<SVGPathElement>("[data-arc]")
    if (!stripEl || !arcEl) {
      return
    }
    const stripLen = stripEl.getTotalLength()
    const arcLen = arcEl.getTotalLength()
    const paper = Math.min(0.16 * W, arcLen) // the visible piece of paper

    const strips = Array.from(svg.querySelectorAll<SVGPathElement>("[data-strip]"))
    const arcs = Array.from(svg.querySelectorAll<SVGPathElement>("[data-arc]"))
    for (const el of strips) {
      el.style.strokeDasharray = `${paper} ${stripLen + paper}`
      el.style.strokeDashoffset = `${paper}`
    }
    for (const el of arcs) {
      el.style.strokeDasharray = `${arcLen} ${arcLen}`
      el.style.strokeDashoffset = `${arcLen}`
    }

    const finish = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1")
      } catch {
        /* private mode: the intro simply plays again next time */
      }
      stage.introHold = false
      document.documentElement.removeAttribute("data-intro")
      setGone(true)
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: finish })
    /* 1 — the paper travels the top edge and bends toward the junction */
    tl.to(strips, { strokeDashoffset: -(stripLen - paper), duration: 1.15, ease: "power1.inOut" })
      /* 2 — it feeds into the C: the strip's tail drains while the arc draws,
         overlapping so the paper reads as one continuous piece */
      .to(strips, { strokeDashoffset: -stripLen, duration: 0.5, ease: "none" }, ">-0.02")
      .to(arcs, { strokeDashoffset: 0, duration: 0.95, ease: "power2.out" }, "<")
      /* 3 — the 5D lift: gentle blue, deeper shadow, a breath of rotation */
      .to(svg.querySelectorAll("[data-body]"), { stroke: "#a9c4e4", duration: 0.55 }, ">-0.15")
      .to(wrap, { rotateY: -14, rotateX: 5, scale: 1.045, duration: 0.6, ease: "power2.out" }, "<")
      .to(svg.querySelector("[data-shadow][data-arc]"), { x: 16, y: 22, opacity: 0.6, duration: 0.6 }, "<")
      /* 4 — hand off to the real ribbon beneath */
      .to(wrap, { opacity: 0, duration: 0.45, ease: "power1.in" }, ">+0.1")

    return () => {
      tl.kill()
      stage.introHold = false
      document.documentElement.removeAttribute("data-intro")
    }
  }, [play])

  if (!play || gone) {
    return null
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70]"
      style={{ perspective: "1200px" }}
    >
      <div ref={stageRef} className="h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        <svg ref={svgRef} className="h-full w-full" role="presentation">
          {/* graffiti layering: hard shadow → outline keyline → paper body */}
          <path data-strip data-shadow d="" fill="none" stroke="#0b0d12" strokeOpacity="0.5" strokeWidth="30" strokeLinecap="round" transform="translate(10 14)" />
          <path data-arc data-shadow d="" fill="none" stroke="#0b0d12" strokeOpacity="0.5" strokeWidth="34" strokeLinecap="round" transform="translate(10 14)" />
          <path data-strip data-outline d="" fill="none" stroke="#1a1e26" strokeWidth="27" strokeLinecap="round" />
          <path data-arc data-outline d="" fill="none" stroke="#1a1e26" strokeWidth="31" strokeLinecap="round" />
          <path data-strip data-body d="" fill="none" stroke="#eef2f6" strokeWidth="19" strokeLinecap="round" />
          <path data-arc data-body d="" fill="none" stroke="#eef2f6" strokeWidth="23" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
