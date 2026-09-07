"use client"

/**
 * Codera City — the world behind the page (Iterácia 2.7).
 *
 * One fixed stage under the naturally scrolling DOM: five scenes, one per
 * act, and four passages between them.
 *
 * A passage is NOT a rendered flight any more. Scrubbing a frame sequence
 * gives the camera a new picture only every ~30 px of scroll, so one wheel
 * tick jumped three frames and the move read as stepped no matter how the
 * frames were blended (Ondrej, 2026-09-07: "trhané a nepostupné"). Every
 * beat is now a CONTINUOUS function of scroll — the leaving scene pushes
 * forward and dissolves, cloud plates sweep the swap, the arriving scene
 * settles out of a wider shot — so the picture changes on every single
 * frame at any scroll speed, and the scenes stay at their full 4K sharpness
 * because nothing is re-encoded. Transform and opacity only: the compositor
 * carries the whole passage.
 *
 * Scroll input is native. The world alone interpolates (a ~200 ms
 * critically-damped follow), which now smooths a continuous signal instead
 * of hiding steps. GSAP + ScrollTrigger is the only motion engine; nothing
 * pins, so End always reaches the footer.
 *
 * References (CODERA_DESIGN_REFERENCES): refokus — beat variety over effect
 * variety, the shell never competes with the work; activetheory — conviction
 * of a single world; lusion — input maps to motion instantly, cinematics
 * happen around that mapping.
 */

import type { gsap as GsapType } from "gsap"
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger"
import { useEffect, useRef } from "react"
import { stage } from "@/components/experience/stage"

type Gsap = typeof GsapType
type ST = typeof ScrollTriggerType

const HOME = "/home"

/** The five scenes in journey order. Stills, not video: a still is sharper
 *  than any encode of the same frame and cannot stutter on decode. Each ships
 *  an AVIF/JPEG ladder so a 1920 screen never downloads the 4K plate. */
/* act name -> the plate the flat edit already paints, so both edits share one
   file per scene per device class */
const SCENES = [
  ["hero", "hero"],
  ["work", "street"],
  ["offer", "services"],
  ["process", "bridge"],
  ["resolution", "night"],
] as const

interface CloudMove {
  /** which cloud plate: 0 and 1 sweep the passage, 2 is the always-on wisp */
  el: 0 | 1
  x: [number, number] // vw
  y: [number, number] // vh
  s: [number, number]
  /** progress window over which the plate travels */
  win: [number, number]
  /** peak opacity */
  o: number
  /** the light this passage puts on the cloud */
  f: string
}

/**
 * Cloud choreography per passage. t1 descends (banks rise past the camera),
 * t2 moves forward (clouds part sideways), t3 climbs (clouds sink below in
 * golden-to-violet light), t4 falls into night (dim blue banks rise).
 */
const PASSAGE_CLOUDS: Record<string, CloudMove[]> = {
  t1: [
    { el: 0, x: [-8, -4], y: [125, -155], s: [1.25, 1.7], win: [0.02, 0.94], o: 1, f: "" },
    { el: 1, x: [30, 12], y: [140, -165], s: [1.0, 1.55], win: [0.18, 1], o: 0.95, f: "" },
  ],
  t2: [
    { el: 0, x: [-30, -130], y: [30, 4], s: [1.35, 2.1], win: [0.04, 0.96], o: 0.95, f: "" },
    { el: 1, x: [24, 122], y: [22, -14], s: [1.1, 2.0], win: [0.12, 1], o: 0.9, f: "sepia(0.2) saturate(1.15)" },
  ],
  t3: [
    { el: 0, x: [-10, -6], y: [-135, 145], s: [1.55, 1.2], win: [0.02, 0.94], o: 0.92, f: "sepia(0.55) saturate(1.5) hue-rotate(-14deg)" },
    { el: 1, x: [26, 14], y: [-155, 135], s: [1.45, 1.1], win: [0.16, 1], o: 0.88, f: "sepia(0.45) saturate(1.6) hue-rotate(228deg)" },
  ],
  t4: [
    { el: 0, x: [-8, -2], y: [125, -155], s: [1.25, 1.6], win: [0.02, 0.94], o: 0.78, f: "brightness(0.55) sepia(0.6) hue-rotate(178deg) saturate(1.5)" },
    { el: 1, x: [28, 12], y: [140, -165], s: [1.0, 1.5], win: [0.18, 1], o: 0.66, f: "brightness(0.45) sepia(0.6) hue-rotate(190deg) saturate(1.5)" },
  ],
}

interface Passage {
  name: string
  from: string
  to: string
  p: number
}

interface Scene {
  el: HTMLElement
  media: HTMLElement | null
  tint: HTMLElement | null
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t: number) => t * t * (3 - 2 * t)
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** eased passage curve: weighted so the camera has mass but never parks */
const glide = (p: number) => p * 0.32 + smooth(p) * 0.68

const cloudAt = (el: HTMLElement, x: number, y: number, s: number, o: number) => {
  /* a mirrored plate reads as a second cloud, not the same one again */
  const sx = el.dataset.flip ? -s : s
  el.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0) scale(${sx.toFixed(3)}, ${s.toFixed(3)})`
  el.style.opacity = o.toFixed(3)
}

/** Places the two passage plates at eased progress e. */
export function placeClouds(clouds: HTMLElement[], name: string, e: number, px = 0, py = 0) {
  const moves = PASSAGE_CLOUDS[name] ?? []
  const used = new Set<number>()
  for (const m of moves) {
    const el = clouds[m.el]
    if (!el) {
      continue
    }
    used.add(m.el)
    const t = smooth(span(e, m.win[0], m.win[1]))
    const env = Math.min(1, span(e, m.win[0], m.win[0] + 0.12), span(1 - e, 0, 0.08))
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
}

export function lightClouds(clouds: HTMLElement[], name: string, extra = "") {
  for (const m of PASSAGE_CLOUDS[name] ?? []) {
    const el = clouds[m.el]
    if (el) {
      el.style.filter = `${m.f} ${extra}`.trim()
    }
  }
}

/* the flat passages draw alpha cutouts on a pale sky: a touch of contrast
   keeps their volume readable (cheap — no blur, no shadow) */
const FLAT_CLOUD_LIGHT = "contrast(1.12) saturate(1.05)"

/** Stations light up one after another as the visitor reaches them. */
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

/** Depth parallax on the glass: each panel rides at its own speed, and
 *  panels with a shift drift sideways too. Panels that must read as one
 *  aligned row (the price terraces) carry neither. */
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

function buildStage(gsap: Gsap, ScrollTrigger: ST, root: HTMLElement): () => void {
  const main = document.querySelector<HTMLElement>("main[data-experience]")
  const world = root.querySelector<HTMLElement>(".city-world")
  if (!main || !world) {
    return () => {}
  }

  /* ---------------------------------------------------------- scenes --- */
  const scenes: Scene[] = []
  const byName = new Map<string, Scene>()
  for (const el of root.querySelectorAll<HTMLElement>("[data-scene]")) {
    const scene: Scene = {
      el,
      media: el.querySelector<HTMLElement>(".city-media"),
      tint: root.querySelector<HTMLElement>(`[data-tint="${el.dataset.scene}"]`),
    }
    scenes.push(scene)
    byName.set(el.dataset.scene ?? "", scene)
  }

  /* The plates are the same backgrounds the flat edit paints, so the hero is
     one file the browser already has. Only the hero is attached at mount; the
     rest join once the page is idle, in journey order, so the first paint
     never queues five plates behind itself. */
  const attach = (scene: Scene | undefined) => {
    const el = scene?.media
    const plate = el?.dataset.scenePlate
    if (!el || !plate) {
      return
    }
    el.classList.add(`city-plate-${plate}`)
    el.removeAttribute("data-scene-plate")
  }
  const warmRest = () => {
    for (const scene of scenes) {
      attach(scene)
    }
  }
  const idleWarm = window.requestIdleCallback
    ? window.requestIdleCallback(warmRest, { timeout: 4000 })
    : window.setTimeout(warmRest, 1500)

  /* -------------------------------------------------------- passages --- */
  const passages: Passage[] = []
  const triggers: ScrollTriggerType[] = []
  for (const el of main.querySelectorAll<HTMLElement>("[data-seam]")) {
    const passage: Passage = {
      name: el.dataset.seam ?? "",
      from: el.dataset.from ?? "",
      to: el.dataset.to ?? "",
      p: 0,
    }
    passages.push(passage)
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        end: "bottom 8%",
        onUpdate: (self) => {
          passage.p = self.progress
        },
      })
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
      /* every card sits in the same grid cell, so the transparent ones used
         to swallow the click and open the wrong demo — only the card in
         front of the visitor takes the pointer (Ondrej, 2026-09-07). It hands
         the pointer over exactly when the next card takes it, so there is
         never a moment on the street with nothing to click. */
      tl.set(card, { pointerEvents: "auto" }, i === 0 ? 0 : at + 0.5)
      if (i < cards.length - 1) {
        tl.set(card, { pointerEvents: "none" }, at + 1.5)
        tl.to(
          card,
          { z: 820, opacity: 0, filter: "blur(7px)", duration: 0.4, ease: "power2.in" },
          at + 1.08
        )
      }
    })
  }

  bindDepth(gsap, main, 70)
  triggers.push(...bindStations(ScrollTrigger, main))

  /* ---------------------------------------------------------- clouds --- */
  const clouds = Array.from(root.querySelectorAll<HTMLElement>("[data-cloud]"))

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

  /* ---------------------------------------------------------- render --- */
  /* One writer for the whole world: every scene's opacity and transform is
     a continuous function of the damped passage progress, so there is no
     frame to step through and no state to switch. */
  let cur: Passage | null = null
  let sp = 0
  let lastT = performance.now()
  let lit = ""
  /* if frames run long while the world moves, the page lightens itself once
     and stays there: the glass drops its backdrop blur (CSS reads data-lite).
     Never the other way round — flickering between qualities is worse. */
  let lite = false
  let slow = 0

  const setScene = (scene: Scene, opacity: number, scale: number, yPct: number) => {
    scene.el.style.opacity = opacity.toFixed(3)
    if (scene.media) {
      scene.media.style.transform = `translate3d(0, ${yPct.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`
    }
    if (scene.tint) {
      scene.tint.style.opacity = opacity.toFixed(3)
    }
  }

  const render = () => {
    const now = performance.now()
    const dt = Math.min(64, now - lastT)
    lastT = now
    if (!lite) {
      slow = dt > 34 ? slow + 1 : Math.max(0, slow - 1)
      if (slow > 14) {
        lite = true
        document.documentElement.setAttribute("data-lite", "")
      }
    }

    let active: Passage | null = null
    for (const p of passages) {
      if (p.p > 0.0001 && p.p < 0.9999) {
        active = p
        break
      }
    }
    if (active !== cur) {
      cur = active
      if (cur) {
        sp = cur.p
      }
    }
    const target = cur ? cur.p : 0
    sp += (target - sp) * (1 - Math.exp(-dt / 200))
    if (Math.abs(target - sp) < 0.0004) {
      sp = target
    }
    const e = cur ? glide(sp) : 0

    if (cur && lit !== cur.name) {
      lit = cur.name
      lightClouds(clouds, cur.name)
      /* whatever the idle queue has not reached yet, the passage needs now */
      attach(byName.get(cur.to))
    }

    /* which act is on screen when no passage is running */
    const act = stage.act
    /* the act's own progress gives every scene a slow forward drift, so the
       world is never parked even while the copy is being read */
    const actP = stage.p[act] ?? 0

    for (const scene of scenes) {
      const name = scene.el.dataset.scene ?? ""
      if (cur && name === cur.from) {
        /* leaving: pushes forward and dissolves into the clouds */
        setScene(scene, 1 - smooth(span(e, 0.34, 0.72)), 1.1 + 0.24 * e, -3 - 6 * e)
      } else if (cur && name === cur.to) {
        /* arriving: settles out of a wider shot */
        setScene(scene, smooth(span(e, 0.28, 0.66)), 1.34 - 0.24 * e, 7 * (1 - e))
      } else if (!cur && name === act) {
        setScene(scene, 1, 1.1 + 0.12 * actP, -3 * actP)
      } else {
        scene.el.style.opacity = "0"
        if (scene.tint) {
          scene.tint.style.opacity = "0"
        }
      }
    }

    /* pointer: the world leans a little toward the cursor, clouds more */
    px += (tx - px) * (1 - Math.exp(-dt / 240))
    py += (ty - py) * (1 - Math.exp(-dt / 240))
    world.style.transform = `translate3d(${(-px * 1.1).toFixed(3)}%, ${(-py * 0.7).toFixed(3)}%, 0)`

    /* clouds: the passage's own choreography */
    placeClouds(clouds, cur ? cur.name : "", e, px, py)
    if (clouds[2]) {
      /* the wisps ride the whole journey — thin, slow, always there */
      const y = -((window.scrollY * 0.05) % 120)
      cloudAt(clouds[2], px * 3, 60 + y + py * 1.5, 1.4, 0.35)
    }
  }
  gsap.ticker.add(render)

  return () => {
    gsap.ticker.remove(render)
    if (window.cancelIdleCallback) {
      window.cancelIdleCallback(idleWarm)
    } else {
      window.clearTimeout(idleWarm)
    }
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
        {SCENES.map(([name, plate], i) => (
          <div key={name} data-scene={name} className="city-scene">
            <div
              className={i === 0 ? `city-media city-plate-${plate}` : "city-media"}
              {...(i === 0 ? {} : { "data-scene-plate": plate })}
            />
          </div>
        ))}
      </div>
      {SCENES.map(([name]) => (
        <div key={name} data-tint={name} className={`city-tint city-tint-${name}`} />
      ))}
      {/* biome-ignore lint/performance/noImgElement: screen-blended cloud plates moved by the passage. */}
      <img data-cloud="bank" className="city-cloud" src={`${HOME}/cloud-bank.webp`} alt="" decoding="async" />
      {/* biome-ignore lint/performance/noImgElement: screen-blended cloud plates moved by the passage. */}
      <img data-cloud="one" className="city-cloud" src={`${HOME}/cloud-one.webp`} alt="" decoding="async" />
      {/* biome-ignore lint/performance/noImgElement: screen-blended cloud plates moved by the passage. */}
      <img data-cloud="wisp" className="city-cloud city-cloud-wisp" src={`${HOME}/cloud-wisp.webp`} alt="" decoding="async" />
    </div>
  )
}

/**
 * Flat edit motion (phones and touch tablets): the same world as per-act
 * plates that ARRIVE — each plate settles from a wider shot as its act enters
 * and the cloud band lifts away — and the seams are CLOUD PASSAGES: a fixed
 * veil of two cloud plates sweeps the viewport while the seam scrolls
 * through it, with the same four choreographies as the desktop passages.
 * Transform-only, no canvas, no video. Reduced motion mounts nothing here.
 */
export function CityFlatMotion() {
  const veilRef = useRef<HTMLDivElement>(null)
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

        /* the cloud passages */
        const veil = veilRef.current
        const clouds = veil ? Array.from(veil.querySelectorAll<HTMLElement>("[data-cloud]")) : []
        for (const el of main.querySelectorAll<HTMLElement>("[data-seam]")) {
          const name = el.dataset.seam ?? ""
          ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => lightClouds(clouds, name, FLAT_CLOUD_LIGHT),
            onEnterBack: () => lightClouds(clouds, name, FLAT_CLOUD_LIGHT),
            onUpdate: (self) => placeClouds(clouds, name, glide(self.progress)),
            onLeave: () => placeClouds(clouds, "", 0),
            onLeaveBack: () => placeClouds(clouds, "", 0),
          })
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
  return (
    <div ref={veilRef} aria-hidden="true" className="city-veil">
      {/* the soft white bank vanished on a phone's pale sky — the passage
          uses the volumetric cumulus twice, the first one mirrored */}
      {/* biome-ignore lint/performance/noImgElement: alpha cloud plates moved by the passage. */}
      <img data-cloud="bank" data-flip="" className="city-cloud" src={`${HOME}/cloud-one-a.webp`} alt="" decoding="async" />
      {/* biome-ignore lint/performance/noImgElement: alpha cloud plates moved by the passage. */}
      <img data-cloud="one" className="city-cloud" src={`${HOME}/cloud-one-a.webp`} alt="" decoding="async" />
    </div>
  )
}
