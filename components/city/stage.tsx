"use client"

/**
 * Codera City — the world behind the page (Iterácia 2.1).
 *
 * One fixed stage under the naturally scrolling DOM. Five scenes (one per
 * act), each an ambient video loop over its still, and four flights between
 * them: every seam element in the document is a scroll range during which
 * the stage scrubs a rendered camera flight from the scene above to the
 * scene below. The flight is eased (slow out of the scene, fast through the
 * clouds, slow into the next), adjacent frames are cross-blended so slow
 * scrolling never steps, the light of the destination fades in over the
 * flight, and each seam has its own cloud choreography — descent, forward
 * passage, ascent, night fall — so no two transitions read the same.
 *
 * Scroll input is native; the world alone interpolates: the flight follows
 * the scroll with a ~240 ms critically-damped glide, so a mouse wheel's
 * stepped deltas become one continuous camera move (the DOM still moves
 * the instant the wheel does).
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
import { drawBlend, FLIGHT_FRAMES, loadedFlight, warmAllFlights, warmFlight } from "./frames"

type Gsap = typeof GsapType
type ST = typeof ScrollTriggerType

const HOME = "/home"

/** the five scenes in journey order — the stills are the seams' end frames */
const SCENES = [
  { name: "hero", still: `${HOME}/hero.jpg`, video: `${HOME}/hero.mp4` },
  { name: "work", still: `${HOME}/street.jpg`, video: `${HOME}/street.mp4` },
  { name: "offer", still: `${HOME}/services.jpg`, video: `${HOME}/services.mp4` },
  { name: "process", still: `${HOME}/bridge.jpg`, video: `${HOME}/bridge.mp4` },
  { name: "resolution", still: `${HOME}/night.jpg`, video: `${HOME}/night.mp4` },
] as const

interface CloudMove {
  /** which cloud plate: 0 bank, 1 single cumulus */
  el: 0 | 1
  x: [number, number] // vw
  y: [number, number] // vh
  s: [number, number]
  /** progress window over which the plate travels */
  win: [number, number]
  /** peak opacity */
  o: number
  /** colour of the light on the cloud, per seam */
  f: string
}

/**
 * Cloud choreography per flight. t1 descends (banks rise past the camera),
 * t2 moves forward (clouds part sideways), t3 climbs (clouds sink below in
 * golden-to-violet light), t4 falls into night (dim blue banks rise).
 */
const FLIGHT_CLOUDS: Record<string, CloudMove[]> = {
  t1: [
    { el: 0, x: [-8, -4], y: [120, -150], s: [1.25, 1.7], win: [0.04, 0.9], o: 1, f: "" },
    { el: 1, x: [30, 12], y: [135, -160], s: [1.0, 1.55], win: [0.28, 1], o: 0.95, f: "" },
  ],
  t2: [
    { el: 0, x: [-40, -135], y: [34, 6], s: [1.35, 2.1], win: [0.08, 0.96], o: 0.95, f: "" },
    { el: 1, x: [30, 125], y: [26, -12], s: [1.1, 2.0], win: [0.18, 1], o: 0.9, f: "sepia(0.2) saturate(1.15)" },
  ],
  t3: [
    { el: 0, x: [-10, -6], y: [-130, 140], s: [1.55, 1.2], win: [0.04, 0.9], o: 0.92, f: "sepia(0.55) saturate(1.5) hue-rotate(-14deg)" },
    { el: 1, x: [26, 14], y: [-150, 130], s: [1.45, 1.1], win: [0.26, 1], o: 0.88, f: "sepia(0.45) saturate(1.6) hue-rotate(228deg)" },
  ],
  t4: [
    { el: 0, x: [-8, -2], y: [120, -150], s: [1.25, 1.6], win: [0.04, 0.9], o: 0.72, f: "brightness(0.55) sepia(0.6) hue-rotate(178deg) saturate(1.5)" },
    { el: 1, x: [28, 12], y: [135, -160], s: [1.0, 1.5], win: [0.28, 1], o: 0.62, f: "brightness(0.45) sepia(0.6) hue-rotate(190deg) saturate(1.5)" },
  ],
}

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
  tint: HTMLElement | null
  shown: boolean
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t: number) => t * t * (3 - 2 * t)
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Stations light up one after another as the visitor reaches them — the
 *  same in both edits. */
function bindStations(ScrollTrigger: ST, main: HTMLElement): ScrollTriggerType[] {
  const out: ScrollTriggerType[] = []
  for (const st of main.querySelectorAll<HTMLElement>("[data-station]")) {
    out.push(
      ScrollTrigger.create({
        trigger: st,
        start: "top 74%",
        onEnter: () => st.setAttribute("data-lit", ""),
        onLeaveBack: () => st.removeAttribute("data-lit"),
      })
    )
  }
  return out
}

/** The flat rail of facades: cards turn toward the visitor as they pass the
 *  centre — the facades of the street, on a thumb. */
function bindRail(main: HTMLElement): () => void {
  const rail = main.querySelector<HTMLElement>(".city-rail")
  if (!rail) {
    return () => {}
  }
  const cards = Array.from(rail.querySelectorAll<HTMLElement>(".city-railcard"))
  let frame = 0
  const place = () => {
    frame = 0
    const mid = window.innerWidth / 2
    for (const card of cards) {
      const r = card.getBoundingClientRect()
      const d = (r.left + r.width / 2 - mid) / window.innerWidth
      const tilt = (-d * 22).toFixed(2)
      const shrink = (1 - Math.min(0.5, Math.abs(d)) * 0.12).toFixed(3)
      card.style.transform = `perspective(1100px) rotateY(${tilt}deg) scale(${shrink})`
    }
  }
  const onScroll = () => {
    if (!frame) {
      frame = requestAnimationFrame(place)
    }
  }
  place()
  rail.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll)
  return () => {
    rail.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onScroll)
    if (frame) {
      cancelAnimationFrame(frame)
    }
  }
}

/** Depth parallax on the glass: each panel rides at its own speed, and
 *  panels with a shift drift sideways too — the layout breathes with the
 *  scroll and the world shows between the panels. */
function bindDepth(gsap: Gsap, main: HTMLElement, amount: number) {
  for (const el of main.querySelectorAll<HTMLElement>("[data-depth]")) {
    const d = Number(el.dataset.depth ?? "1")
    const sx = Number(el.dataset.shift ?? "0")
    gsap.fromTo(
      el,
      { y: amount * d, x: amount * sx },
      {
        y: -amount * d,
        x: -amount * sx,
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
}

function buildStage(gsap: Gsap, ScrollTrigger: ST, root: HTMLElement): () => void {
  const main = document.querySelector<HTMLElement>("main[data-experience]")
  const canvas = root.querySelector<HTMLCanvasElement>("canvas")
  const ctx = canvas?.getContext("2d", { alpha: false })
  const world = root.querySelector<HTMLElement>(".city-world")
  if (!main || !canvas || !ctx || !world) {
    return () => {}
  }

  /* ---------------------------------------------------------- scenes --- */
  const scenes = new Map<string, Scene>()
  for (const el of root.querySelectorAll<HTMLElement>("[data-scene]")) {
    const name = el.dataset.scene ?? ""
    scenes.set(name, {
      el,
      media: el.querySelector("img, video"),
      video: el.querySelector("video"),
      tint: root.querySelector<HTMLElement>(`[data-tint="${name}"]`),
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
  let lastF = -1
  let lite = false
  const sizeCanvas = () => {
    /* the strip is 2304 px wide — a wider canvas only costs fill */
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5, 2560 / window.innerWidth)
    cw = Math.round(window.innerWidth * dpr)
    ch = Math.round(window.innerHeight * dpr)
    canvas.width = cw
    canvas.height = ch
    lastF = -1
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
        start: "top 90%",
        end: "bottom 10%",
        onUpdate: (self) => {
          seam.p = self.progress
        },
      }),
      /* the strip streams in two viewports before it is needed */
      ScrollTrigger.create({
        trigger: el,
        start: "top 300%",
        once: true,
        onEnter: () => warmFlight(seam.name),
      })
    )
  }
  let idle = 0
  if (seams[0]) {
    /* every strip streams in journey order once the page is idle — the
       first one is needed right under the fold */
    idle = window.setTimeout(() => {
      warmAllFlights(seams.map((s) => s.name))
    }, 1200)
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
      scrollTrigger: { trigger: walk, start: "top top", end: "bottom bottom", scrub: 0.4 },
    })
    cards.forEach((card, i) => {
      const cap = card.querySelector<HTMLElement>("[data-cap]")
      const at = i
      /* far and soft, then sharp and readable in front of the visitor */
      tl.fromTo(
        card,
        { z: -2800, opacity: 0, yPercent: -12, filter: "blur(9px)" },
        { z: 0, opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.86, ease: "power2.out" },
        at
      )
      if (cap) {
        tl.fromTo(cap, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.22 }, at + 0.6)
      }
      if (i < cards.length - 1) {
        tl.to(
          card,
          { z: 820, opacity: 0, filter: "blur(7px)", duration: 0.4, ease: "power2.in" },
          at + 1.08
        )
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

  bindDepth(gsap, main, 70)
  triggers.push(...bindStations(ScrollTrigger, main))

  /* ---------------------------------------------------------- clouds --- */
  const clouds = Array.from(root.querySelectorAll<HTMLElement>("[data-cloud]"))
  const cloudAt = (el: HTMLElement, x: number, y: number, s: number, o: number) => {
    el.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) scale(${s.toFixed(3)})`
    el.style.opacity = o.toFixed(3)
  }

  /* ---------------------------------------------------------- pointer --- */
  let tx = 0
  let ty = 0
  let px = 0
  let py = 0
  const onPointer = (e: PointerEvent) => {
    tx = (e.clientX / window.innerWidth) * 2 - 1
    ty = (e.clientY / window.innerHeight) * 2 - 1
  }
  const onPointerLeave = () => {
    tx = 0
    ty = 0
  }
  window.addEventListener("pointermove", onPointer, { passive: true })
  document.addEventListener("pointerleave", onPointerLeave)

  /* ------------------------------------------------- adaptive quality --- */
  /* if frames run long while the world moves, the stage lightens itself:
     single frames instead of blends, a 1× canvas, and the glass loses its
     backdrop blur (CSS reads data-lite on the root). Never the other way
     round — a page that flickers between qualities is worse than a lighter
     one. */
  let slow = 0
  const goLite = () => {
    lite = true
    document.documentElement.setAttribute("data-lite", "")
    sizeCanvas()
  }

  /* ---------------------------------------------------------- render --- */
  let cur: Seam | null = null
  let sp = 0
  let lastT = performance.now()
  const render = () => {
    const now = performance.now()
    const dt = Math.min(64, now - lastT)
    lastT = now
    if (!lite) {
      slow = dt > 34 ? slow + 1 : Math.max(0, slow - 1)
      if (slow > 12) {
        goLite()
      }
    }

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
      lastF = -1
      /* the destination's loop buffers while the flight is in the clouds */
      const dest = scenes.get(cur.to)?.video
      if (dest && dest.preload !== "auto") {
        dest.preload = "auto"
        dest.load()
      }
      const moves = FLIGHT_CLOUDS[cur.name] ?? []
      for (const m of moves) {
        const el = clouds[m.el]
        if (el) {
          el.style.filter = m.f
        }
      }
    }
    const target = cur ? cur.p : 0
    sp += (target - sp) * (1 - Math.exp(-dt / 240))
    if (Math.abs(target - sp) < 0.0004) {
      sp = target
    }
    /* the flight itself is eased: slow out of the scene, fast through the
       clouds, slow into the next — the camera has weight, but it is never
       parked (a third of the motion stays linear) */
    const e = sp * 0.35 + smooth(sp) * 0.65

    const frames = cur ? loadedFlight(cur.name) : null
    const flying = cur !== null && sp > 0.0005 && sp < 0.9995

    if (cur) {
      showScene(sp < 0.5 ? cur.from : cur.to)
    }

    /* the light of the destination arrives over the flight */
    for (const [name, s] of scenes) {
      if (!s.tint) {
        continue
      }
      let o = s.shown ? 1 : 0
      if (cur && flying) {
        o = name === cur.from ? 1 - e : name === cur.to ? e : 0
      }
      s.tint.style.opacity = o.toFixed(3)
    }

    if (flying && cur && frames) {
      const fpos = e * (FLIGHT_FRAMES - 1)
      if (Math.abs(fpos - lastF) > 0.015) {
        lastF = fpos
        const i = Math.min(FLIGHT_FRAMES - 2, Math.floor(fpos))
        drawBlend(ctx, frames[i], frames[i + 1], lite ? 0 : fpos - i, cw, ch)
      }
      canvas.style.opacity = Math.min(1, sp / 0.06, (1 - sp) / 0.06).toFixed(3)
    } else if (flying && cur) {
      /* the strip is still streaming (or missing): the scenes crossfade
         under the cloud sweep instead — the journey never stalls */
      const to = scenes.get(cur.to)
      const from = scenes.get(cur.from)
      if (to && from) {
        to.el.style.opacity = e.toFixed(3)
        from.el.style.opacity = "1"
        to.shown = sp >= 0.5
        from.shown = sp < 0.5
      }
      canvas.style.opacity = "0"
    } else {
      canvas.style.opacity = "0"
    }

    /* pointer: the world leans a little toward the cursor, clouds more */
    px += (tx - px) * (1 - Math.exp(-dt / 240))
    py += (ty - py) * (1 - Math.exp(-dt / 240))
    world.style.transform = `translate3d(${(-px * 1.1).toFixed(3)}%, ${(-py * 0.7).toFixed(3)}%, 0) scale(1.035)`

    /* clouds: the seam's own choreography */
    const moves = cur && flying ? (FLIGHT_CLOUDS[cur.name] ?? []) : []
    const used = new Set<number>()
    for (const m of moves) {
      const el = clouds[m.el]
      if (!el) {
        continue
      }
      used.add(m.el)
      const t = smooth(span(e, m.win[0], m.win[1]))
      const env = Math.min(1, span(e, m.win[0], m.win[0] + 0.14), span(1 - e, 0, 0.1))
      cloudAt(
        el,
        lerp(m.x[0], m.x[1], t) + px * 2.2,
        lerp(m.y[0], m.y[1], t) + py * 1.2,
        lerp(m.s[0], m.s[1], t),
        m.o * env
      )
    }
    for (let i = 0; i < 2; i++) {
      if (!used.has(i) && clouds[i]) {
        clouds[i].style.opacity = "0"
      }
    }
    if (clouds[2]) {
      /* the wisps ride the whole journey — thin, slow, always there */
      const y = -((window.scrollY * 0.05) % 120)
      cloudAt(clouds[2], px * 3, 60 + y + py * 1.5, 1.4, 0.35)
    }
  }
  gsap.ticker.add(render)

  const onResize = () => {
    sizeCanvas()
  }
  window.addEventListener("resize", onResize)

  return () => {
    gsap.ticker.remove(render)
    window.clearTimeout(idle)
    window.removeEventListener("resize", onResize)
    window.removeEventListener("pointermove", onPointer)
    document.removeEventListener("pointerleave", onPointerLeave)
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
      <div className="city-world">
        {SCENES.map((s) => (
          <div key={s.name} data-scene={s.name} className="city-scene">
            <video
              className="city-media"
              src={s.video}
              poster={s.still}
              muted
              loop
              playsInline
              preload={s.name === "hero" ? "auto" : "metadata"}
            />
          </div>
        ))}
        <canvas className="city-flight" />
      </div>
      {SCENES.map((s) => (
        <div key={s.name} data-tint={s.name} className={`city-tint city-tint-${s.name}`} />
      ))}
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
 * Flat edit motion (under 1024px): the same world as per-act plates that
 * ARRIVE — each plate settles from a wider shot as its act enters and the
 * cloud band lifts away — plus depth parallax and the stations lighting up.
 * A layout that moves, never a fallback. Reduced motion mounts nothing here.
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
        for (const plate of main.querySelectorAll<HTMLElement>("[data-plate]")) {
          const section = plate.closest("section") ?? plate
          const first = section.hasAttribute("data-zone") && section.dataset.zone === "hero"
          if (first) {
            gsap.fromTo(
              plate,
              { scale: 1.08, yPercent: 0 },
              {
                scale: 1.2,
                yPercent: -6,
                ease: "none",
                scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.3 },
              }
            )
            continue
          }
          gsap
            .timeline({
              scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.3 },
            })
            .fromTo(
              plate,
              { scale: 1.28, yPercent: -10 },
              { scale: 1.1, yPercent: -4, duration: 0.38, ease: "power2.out" }
            )
            .to(plate, { yPercent: 8, duration: 0.62, ease: "none" })
          const band = section.querySelector<HTMLElement>(".city-band")
          if (band) {
            gsap.fromTo(
              band,
              { yPercent: 22, scale: 1, xPercent: -2 },
              {
                yPercent: -70,
                scale: 1.35,
                xPercent: 2,
                ease: "none",
                scrollTrigger: { trigger: section, start: "top bottom", end: "top 5%", scrub: 0.3 },
              }
            )
          }
        }
        bindDepth(gsap, main, 36)
        const stations = bindStations(ScrollTrigger, main)
        const rail = bindRail(main)
        cleanup = () => {
          rail()
          for (const t of stations) {
            t.kill()
          }
          for (const t of ScrollTrigger.getAll()) {
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
