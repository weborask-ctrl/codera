"use client"

/**
 * Codera City — the world behind the page.
 *
 * One fixed stage under the naturally scrolling DOM. Five scenes (one per
 * act) and four flights between them: each seam element in the document is
 * a scroll range during which the stage scrubs a rendered camera flight from
 * the scene above to the scene below, with cloud layers sweeping across the
 * seam. Scroll input is native; the world alone interpolates (a ≤100 ms
 * critically-damped follow on the flight progress, so frames never jitter).
 *
 * GSAP + ScrollTrigger is the only motion engine; the canvas only draws.
 * Nothing here pins — every sticky region is CSS sticky, so the document
 * never gains a pin-spacer and End always reaches the footer.
 *
 * References (CODERA_DESIGN_REFERENCES): activetheory — conviction of a
 * single world, the canvas as an instrument; lusion — a 3D stage set into
 * calm chrome, input maps instantly; zentry — the scroll flies through
 * chapters, huge type wrapped around the world.
 */

import type { gsap as GsapType } from "gsap"
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"
import { drawCover, FLIGHT_FRAMES, loadedFlight, warmFlight } from "./frames"

type Gsap = typeof GsapType
type ST = typeof ScrollTriggerType

const HOME = "/home"

/** the five scenes in journey order — the stills are the seams' end frames */
const SCENES = [
  { name: "hero", still: `${HOME}/hero.jpg`, video: `${HOME}/hero.mp4` },
  { name: "work", still: `${HOME}/street.jpg` },
  { name: "offer", still: `${HOME}/services.jpg` },
  { name: "process", still: `${HOME}/bridge.jpg` },
  { name: "resolution", still: `${HOME}/night.jpg`, video: `${HOME}/night.mp4` },
] as const

interface Seam {
  name: string
  from: string
  to: string
  p: number
}

interface Scene {
  el: HTMLElement
  media: HTMLElement | null
  video: HTMLVideoElement | null
  shown: boolean
}

function buildStage(gsap: Gsap, ScrollTrigger: ST, root: HTMLElement): () => void {
  const main = document.querySelector<HTMLElement>("main[data-experience]")
  const canvas = root.querySelector<HTMLCanvasElement>("canvas")
  const ctx = canvas?.getContext("2d", { alpha: false })
  if (!main || !canvas || !ctx) {
    return () => {}
  }

  /* ---------------------------------------------------------- scenes --- */
  const scenes = new Map<string, Scene>()
  for (const el of root.querySelectorAll<HTMLElement>("[data-scene]")) {
    const video = el.querySelector("video")
    scenes.set(el.dataset.scene ?? "", {
      el,
      media: el.querySelector("img, video"),
      video,
      shown: false,
    })
  }
  const showScene = (name: string) => {
    for (const [key, s] of scenes) {
      const on = key === name
      if (on === s.shown) {
        continue
      }
      s.shown = on
      s.el.style.opacity = on ? "1" : "0"
      if (s.video) {
        if (on) {
          s.video.play().catch(() => {})
        } else {
          s.video.pause()
        }
      }
    }
  }
  showScene("hero")

  /* ---------------------------------------------------------- canvas --- */
  let cw = 0
  let ch = 0
  let lastIdx = -1
  const sizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    cw = Math.round(window.innerWidth * dpr)
    ch = Math.round(window.innerHeight * dpr)
    canvas.width = cw
    canvas.height = ch
    lastIdx = -1
  }
  sizeCanvas()

  /* ----------------------------------------------------------- seams --- */
  const seams: Seam[] = []
  const triggers: ScrollTriggerType[] = []
  for (const el of main.querySelectorAll<HTMLElement>("[data-seam]")) {
    const seam: Seam = {
      name: el.dataset.seam ?? "",
      from: el.dataset.from ?? "",
      to: el.dataset.to ?? "",
      p: 0,
    }
    seams.push(seam)
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        end: "bottom 12%",
        onUpdate: (self) => {
          seam.p = self.progress
        },
      }),
      /* the strip streams in a viewport and a half before it is needed */
      ScrollTrigger.create({
        trigger: el,
        start: "top 250%",
        once: true,
        onEnter: () => warmFlight(seam.name),
      })
    )
  }
  if (seams[0]) {
    /* the first flight starts right under the fold — warm it at idle */
    const idle = window.setTimeout(() => warmFlight(seams[0].name), 1200)
    triggers.push(ScrollTrigger.create({ onKill: () => window.clearTimeout(idle) } as never))
  }

  /* ---------------------------------------------- scene drift on scroll --- */
  /* every scene drifts forward while its act scrolls — the camera is never
     parked. The street has its own walk (below). */
  for (const section of main.querySelectorAll<HTMLElement>("[data-zone]")) {
    const scene = scenes.get(section.dataset.zone ?? "")
    if (!scene?.media || section.hasAttribute("data-walk")) {
      continue
    }
    const first = section.dataset.zone === "hero"
    gsap.fromTo(
      scene.media,
      { scale: 1, yPercent: 0 },
      {
        scale: 1.14,
        yPercent: -3,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: first ? "top top" : "top bottom",
          end: "bottom top",
          scrub: 0.4,
        },
      }
    )
  }

  /* ------------------------------------------------ /02 the street walk --- */
  const walk = main.querySelector<HTMLElement>("[data-walk]")
  if (walk) {
    const cards = Array.from(walk.querySelectorAll<HTMLElement>("[data-card]"))
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: walk, start: "top top", end: "bottom bottom", scrub: 0.35 },
    })
    cards.forEach((card, i) => {
      const cap = card.querySelector<HTMLElement>("[data-cap]")
      const at = i
      tl.fromTo(
        card,
        { z: -2600, opacity: 0, yPercent: -10 },
        { z: 0, opacity: 1, yPercent: 0, duration: 0.72, ease: "power2.out" },
        at
      )
      if (cap) {
        tl.fromTo(cap, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.18 }, at + 0.56)
      }
      if (i < cards.length - 1) {
        tl.to(card, { z: 760, opacity: 0, duration: 0.36, ease: "power2.in" }, at + 1.02)
      }
    })
    const street = scenes.get("work")?.media
    if (street) {
      gsap.fromTo(
        street,
        { scale: 1 },
        {
          scale: 1.3,
          ease: "none",
          scrollTrigger: { trigger: walk, start: "top top", end: "bottom bottom", scrub: 0.4 },
        }
      )
    }
  }

  /* ------------------------------------------------ depth parallax (DOM) --- */
  for (const el of main.querySelectorAll<HTMLElement>("[data-depth]")) {
    const d = Number(el.dataset.depth ?? "1")
    gsap.fromTo(
      el,
      { y: 70 * d },
      {
        y: -70 * d,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.3,
        },
      }
    )
  }

  /* ---------------------------------------------------------- clouds --- */
  const clouds = Array.from(root.querySelectorAll<HTMLElement>("[data-cloud]"))
  const cloudAt = (el: HTMLElement, x: number, y: number, s: number, o: number) => {
    el.style.transform = `translate3d(${x}vw, ${y}vh, 0) scale(${s})`
    el.style.opacity = o.toFixed(3)
  }
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
  const span = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)))

  /* ---------------------------------------------------------- render --- */
  let cur: Seam | null = null
  let sp = 0
  let lastT = performance.now()
  const render = () => {
    const now = performance.now()
    const dt = Math.min(64, now - lastT)
    lastT = now

    let active: Seam | null = null
    for (const s of seams) {
      if (s.p > 0 && s.p < 1) {
        active = s
        break
      }
    }
    if (active && active !== cur) {
      cur = active
      sp = active.p
      lastIdx = -1
    }
    const target = cur ? cur.p : 0
    sp += (target - sp) * (1 - Math.exp(-dt / 80))
    if (Math.abs(target - sp) < 0.0005) {
      sp = target
    }

    const frames = cur ? loadedFlight(cur.name) : null
    const flying = cur !== null && sp > 0.0005 && sp < 0.9995

    if (cur) {
      showScene(sp < 0.5 ? cur.from : cur.to)
    }

    if (flying && cur && frames) {
      const idx = Math.round(sp * (FLIGHT_FRAMES - 1))
      if (idx !== lastIdx) {
        lastIdx = idx
        drawCover(ctx, frames[idx], cw, ch)
      }
      canvas.style.opacity = Math.min(1, sp / 0.05, (1 - sp) / 0.05).toFixed(3)
    } else if (flying && cur) {
      /* the strip is still streaming (or missing): the scenes crossfade
         under the cloud sweep instead — the journey never stalls */
      const to = scenes.get(cur.to)
      const from = scenes.get(cur.from)
      if (to && from) {
        to.el.style.opacity = sp.toFixed(3)
        from.el.style.opacity = "1"
        to.shown = sp >= 0.5
        from.shown = sp < 0.5
      }
      canvas.style.opacity = "0"
    } else {
      canvas.style.opacity = "0"
    }

    /* clouds: a bank sweeps up through the seam, a second one trails it */
    const f = flying ? sp : 0
    if (clouds[0]) {
      const t = ease(span(f, 0.08, 0.92))
      cloudAt(clouds[0], -8, 120 - 260 * t, 1.25, flying ? Math.min(1, span(f, 0.05, 0.2), span(1 - f, 0.03, 0.15)) : 0)
    }
    if (clouds[1]) {
      const t = ease(span(f, 0.3, 1))
      cloudAt(clouds[1], 22, 130 - 280 * t, 1.1, flying ? Math.min(1, span(f, 0.28, 0.42), span(1 - f, 0, 0.1)) * 0.95 : 0)
    }
    if (clouds[2]) {
      /* the wisps ride the whole journey — thin, slow, always there */
      const y = -((window.scrollY * 0.05) % 120)
      cloudAt(clouds[2], 0, 60 + y, 1.4, 0.35)
    }
  }
  gsap.ticker.add(render)

  const onResize = () => {
    sizeCanvas()
  }
  window.addEventListener("resize", onResize)

  return () => {
    gsap.ticker.remove(render)
    window.removeEventListener("resize", onResize)
    for (const t of triggers) {
      t.kill()
    }
    for (const t of ScrollTrigger.getAll()) {
      t.kill()
    }
  }
}

export function CityStage() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }
    let alive = true
    let cleanup: () => void = () => {}
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (!alive) {
          return
        }
        gsap.registerPlugin(ScrollTrigger)
        cleanup = buildStage(gsap, ScrollTrigger, root)
      }
    )
    return () => {
      alive = false
      cleanup()
    }
  }, [])

  return (
    <div ref={rootRef} aria-hidden="true" className="city-stage">
      {SCENES.map((s) => (
        <div key={s.name} data-scene={s.name} className={`city-scene city-scene-${s.name}`}>
          {"video" in s ? (
            <video
              className="city-media"
              src={s.video}
              poster={s.still}
              muted
              loop
              playsInline
              preload={s.name === "hero" ? "auto" : "metadata"}
            />
          ) : (
            /* biome-ignore lint/performance/noImgElement: full-bleed world plate, sized by CSS; next/image adds nothing here. */
            <img className="city-media" src={s.still} alt="" decoding="async" loading={s.name === "work" ? "eager" : "lazy"} />
          )}
        </div>
      ))}
      <canvas className="city-flight" />
      {/* biome-ignore lint/performance/noImgElement: screen-blended cloud plates moved by the stage. */}
      <img data-cloud="bank" className="city-cloud" src={`${HOME}/cloud-bank.webp`} alt="" decoding="async" />
      {/* biome-ignore lint/performance/noImgElement: screen-blended cloud plates moved by the stage. */}
      <img data-cloud="one" className="city-cloud" src={`${HOME}/cloud-one.webp`} alt="" decoding="async" />
      {/* biome-ignore lint/performance/noImgElement: screen-blended cloud plates moved by the stage. */}
      <img data-cloud="wisp" className="city-cloud city-cloud-wisp" src={`${HOME}/cloud-wisp.webp`} alt="" decoding="async" />
    </div>
  )
}

/**
 * Flat edit motion (under 1024px, or no city): the same world as per-act
 * plates with a light scroll parallax and the entrance choreography — a
 * layout that moves a little, never a fallback. Reduced motion mounts
 * nothing here.
 */
export function CityFlatMotion() {
  useEffect(() => {
    let alive = true
    let cleanup: () => void = () => {}
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (!alive) {
          return
        }
        gsap.registerPlugin(ScrollTrigger)
        const main = document.querySelector<HTMLElement>("main[data-experience]")
        if (!main) {
          return
        }
        const tweens: ReturnType<Gsap["fromTo"]>[] = []
        for (const plate of main.querySelectorAll<HTMLElement>("[data-plate]")) {
          const section = plate.closest("section") ?? plate
          tweens.push(
            gsap.fromTo(
              plate,
              { yPercent: -8, scale: 1.12 },
              {
                yPercent: 8,
                scale: 1.12,
                ease: "none",
                scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.3 },
              }
            )
          )
        }
        for (const el of main.querySelectorAll<HTMLElement>("[data-depth]")) {
          const d = Number(el.dataset.depth ?? "1")
          tweens.push(
            gsap.fromTo(
              el,
              { y: 36 * d },
              {
                y: -36 * d,
                ease: "none",
                scrollTrigger: { trigger: el.closest("section") ?? el, start: "top bottom", end: "bottom top", scrub: 0.3 },
              }
            )
          )
        }
        cleanup = () => {
          for (const t of tweens) {
            t.scrollTrigger?.kill()
            t.kill()
          }
        }
      }
    )
    return () => {
      alive = false
      cleanup()
    }
  }, [])
  return null
}
