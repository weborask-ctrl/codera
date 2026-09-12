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
 * Scroll input is native. The world alone interpolates — a critically damped
 * spring with a ~0.4 s settle (Iterácia 3.7), so a wheel notch changes the
 * world's acceleration and never its speed. GSAP + ScrollTrigger is the only
 * motion engine; nothing pins, so End always reaches the footer.
 *
 * References (CODERA_DESIGN_REFERENCES): refokus — beat variety over effect
 * variety, the shell never competes with the work; activetheory — conviction
 * of a single world; lusion — input maps to motion instantly, cinematics
 * happen around that mapping.
 */

import type { gsap as GsapType } from "gsap"
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger"
import { useEffect, useRef, useState } from "react"
import { stage } from "@/components/experience/stage"
import { LiveCity, liveElapsed } from "./live"

type Gsap = typeof GsapType
type ST = typeof ScrollTriggerType

const HOME = "/home"
const LIVE = "/home/live"

/** The file the plate CSS will pick for this screen (the AVIF ladder in
 *  city.css), so it can be decoded off the main thread before the class
 *  lands and the first paint of a 4K plate is not a long frame mid-scroll. */
function plateFile(plate: string): string {
  const wide = window.innerWidth > 1920
  const two = window.devicePixelRatio > 1.5
  const w = wide ? (two ? 3840 : 1920) : two ? 2560 : 1280
  return `${HOME}/${plate}-${w}.avif`
}

/** One cloud plate of a passage: the same alpha plates the hero arrives
 *  through (components/city/live.tsx), so the seams speak the hero's
 *  language and nothing is blended — a blend mode reads the whole backdrop
 *  back for every frame, an alpha plate is one composite. */
function CloudPlate({ cloud, name, className = "" }: { cloud: string; name: string; className?: string }) {
  return (
    <picture data-cloud={cloud} className={`city-cloud ${className}`.trim()}>
      <source type="image/avif" srcSet={`${LIVE}/cloud-${name}-1x.avif 1x, ${LIVE}/cloud-${name}-2x.avif 2x`} />
      <source type="image/webp" srcSet={`${LIVE}/cloud-${name}-1x.webp 1x, ${LIVE}/cloud-${name}-2x.webp 2x`} />
      {/* eager: a plate that lazy-loads when the passage brings it on screen
          arrives mid-passage as a network wait and a decode spike */}
      <img className="city-cloud-img" src={`${LIVE}/cloud-${name}-1x.webp`} alt="" decoding="async" />
    </picture>
  )
}

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

type PlateName = "bank" | "puff" | "tower" | "cluster"

interface CloudMove {
  /** which plate: cluster is far, puff and bank are mid, the tower is near;
   *  the wisp rides the whole journey on its own */
  el: PlateName
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

type Tone = "day" | "warm" | "gold" | "night"
/** the light on a plate, per hour of the journey */
const LIGHT = {
  day: "",
  warm: "sepia(0.2) saturate(1.15)",
  gold: "sepia(0.55) saturate(1.5) hue-rotate(-14deg)",
  violet: "sepia(0.45) saturate(1.6) hue-rotate(228deg)",
  night: "brightness(0.55) sepia(0.6) hue-rotate(178deg) saturate(1.5)",
  nightDeep: "brightness(0.45) sepia(0.6) hue-rotate(190deg) saturate(1.5)",
}

/**
 * Cloud choreography per passage, in depth (Iterácia 4.2, Ondrej 2026-09-12:
 * "plynulejšie a výstižnejšie"). Four plates at four distances: the far
 * cluster barely moves and is the first thing to go as we enter the cloud;
 * the two mid plates come toward the camera and part; the near tower (the
 * crispest plate, cut from a 4K render) crosses the camera in the middle
 * and carries the white-out together with the haze. Growth reads as depth — nothing slides across at constant size.
 * t1 descends (they rise past us), t2 flies forward (they part sideways),
 * t3 climbs (they sink away in golden-to-violet light), t4 falls into night.
 */
const PASSAGE_CLOUDS: Record<string, CloudMove[]> = {
  t1: [
    { el: "cluster", x: [26, 22], y: [-12, 10], s: [0.44, 0.62], win: [0, 0.62], o: 0.85, f: LIGHT.day },
    { el: "bank", x: [30, 62], y: [56, -44], s: [0.8, 1.7], win: [0.04, 0.9], o: 0.96, f: LIGHT.day },
    { el: "puff", x: [-42, -72], y: [72, -52], s: [0.9, 1.8], win: [0.1, 0.94], o: 0.95, f: LIGHT.day },
    { el: "tower", x: [-14, -34], y: [80, -78], s: [1.2, 2.3], win: [0.22, 0.86], o: 1, f: LIGHT.day },
  ],
  t2: [
    { el: "cluster", x: [10, 4], y: [14, 8], s: [0.4, 0.56], win: [0, 0.58], o: 0.8, f: LIGHT.day },
    { el: "bank", x: [28, 104], y: [10, -12], s: [0.8, 1.9], win: [0.04, 0.9], o: 0.96, f: LIGHT.warm },
    { el: "puff", x: [-46, -122], y: [6, -8], s: [0.9, 2.0], win: [0.08, 0.92], o: 0.95, f: LIGHT.day },
    { el: "tower", x: [-16, -24], y: [34, -34], s: [1.2, 2.3], win: [0.24, 0.82], o: 1, f: LIGHT.warm },
  ],
  t3: [
    { el: "cluster", x: [-24, -30], y: [-22, -6], s: [0.46, 0.62], win: [0, 0.6], o: 0.85, f: LIGHT.gold },
    { el: "bank", x: [32, 62], y: [-72, 62], s: [1.5, 0.95], win: [0.04, 0.9], o: 0.96, f: LIGHT.violet },
    { el: "puff", x: [-48, -80], y: [-62, 68], s: [1.6, 1.0], win: [0.1, 0.94], o: 0.95, f: LIGHT.gold },
    { el: "tower", x: [-16, -30], y: [-80, 76], s: [2.2, 1.3], win: [0.22, 0.84], o: 1, f: LIGHT.gold },
  ],
  t4: [
    { el: "cluster", x: [24, 20], y: [-10, 12], s: [0.44, 0.6], win: [0, 0.6], o: 0.7, f: LIGHT.night },
    { el: "bank", x: [30, 60], y: [56, -46], s: [0.8, 1.7], win: [0.04, 0.9], o: 0.85, f: LIGHT.nightDeep },
    { el: "puff", x: [-42, -70], y: [72, -54], s: [0.9, 1.8], win: [0.1, 0.94], o: 0.8, f: LIGHT.night },
    { el: "tower", x: [-14, -32], y: [80, -78], s: [1.2, 2.25], win: [0.22, 0.86], o: 0.9, f: LIGHT.nightDeep },
  ],
}

/** the inside of every passage: how dense the haze gets, its tone, how
 *  bright the light we break out into, and the roll of the camera (deg) */
const PASSAGE_LIGHT: Record<string, { haze: number; tone: Tone; bloom: number; roll: number }> = {
  t1: { haze: 0.8, tone: "day", bloom: 0.7, roll: -1.3 },
  t2: { haze: 0.78, tone: "warm", bloom: 0.75, roll: 1.1 },
  t3: { haze: 0.78, tone: "gold", bloom: 0.72, roll: -1.4 },
  t4: { haze: 0.88, tone: "night", bloom: 0.5, roll: 1.2 },
}

/**
 * The world follows the scroll through a critically damped spring rather
 * than a first-order filter. A wheel notch is a 100 px jump; a first-order
 * filter turns every jump into a fresh burst of speed that decays before the
 * next notch lands, and that sawtooth of velocity is what read as stutter
 * (measured 2026-09-11: 10 stalls in 89 passage frames at a steady wheel).
 * A spring keeps velocity continuous — a new target changes acceleration,
 * never speed — so notches blend into one motion. ω sets a ~0.4 s settle.
 */
const SPRING_W = 11.5
const springStep = (x: number, v: number, target: number, dt: number): [number, number] => {
  const h = Math.min(0.064, dt / 1000)
  const a = -2 * SPRING_W * v - SPRING_W * SPRING_W * (x - target)
  const nv = v + a * h
  let nx = x + nv * h
  if (nx < 0) {
    nx = 0
  } else if (nx > 1) {
    nx = 1
  }
  return [nx, nv]
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

export type Plates = Record<string, HTMLElement>
export const platesOf = (root: ParentNode): Plates => {
  const out: Plates = {}
  for (const el of root.querySelectorAll<HTMLElement>("[data-cloud]")) {
    out[el.dataset.cloud ?? ""] = el
  }
  return out
}

/** a plateau bell: up over [a, b], full, down over [c, d] */
const bell = (e: number, a: number, b: number, c: number, d: number) => smooth(span(e, a, b)) * (1 - smooth(span(e, c, d)))

/** the inside of the cloud: dense in the middle, gone at both ends */
const hazeAt = (haze: HTMLElement | null, name: string, e: number, gain = 1) => {
  if (!haze) {
    return
  }
  const h = PASSAGE_LIGHT[name]
  haze.style.opacity = h ? Math.min(0.94, bell(e, 0.2, 0.48, 0.54, 0.82) * h.haze * gain).toFixed(3) : "0"
}
/** the light we break out into: brightest just past the middle, then it
 *  settles into the arriving scene */
const bloomAt = (bloom: HTMLElement | null, name: string, e: number) => {
  if (!bloom) {
    return
  }
  const h = PASSAGE_LIGHT[name]
  bloom.style.opacity = (h ? bell(e, 0.36, 0.58, 0.66, 0.96) * h.bloom : 0).toFixed(3)
  bloom.style.transform = `scale(${(0.9 + 0.5 * e).toFixed(3)})`
}
/** the camera banks a little through the cloud and levels out */
const rollAt = (name: string, e: number) => {
  const h = PASSAGE_LIGHT[name]
  return h ? Math.sin(Math.PI * e) * h.roll : 0
}

/** how much each depth answers the pointer */
const DEPTH: Record<string, number> = { cluster: 0.4, bank: 1.3, puff: 1.5, tower: 2.6 }

/** Places the passage plates at eased progress e. */
export function placeClouds(clouds: Plates, name: string, e: number, px = 0, py = 0) {
  const moves = PASSAGE_CLOUDS[name] ?? []
  const used = new Set<string>()
  for (const m of moves) {
    const el = clouds[m.el]
    if (!el) {
      continue
    }
    used.add(m.el)
    const t = smooth(span(e, m.win[0], m.win[1]))
    /* in and out: every plate arrives over the first tenth of its window and
       is gone by the end of it — the far one inside the cloud, the near one
       as the arriving scene settles */
    const env = Math.min(1, span(e, m.win[0], m.win[0] + 0.1), span(m.win[1] - e, 0, 0.1))
    const k = DEPTH[m.el] ?? 1
    cloudAt(el, lerp(m.x[0], m.x[1], t) + px * k, lerp(m.y[0], m.y[1], t) + py * k * 0.55, lerp(m.s[0], m.s[1], t), m.o * env)
  }
  /* an idle plate stays composited at 0.001, never at 0: a layer at 0 drops
     its texture, and the first frame of the next passage would upload a
     4K plate again */
  for (const key of Object.keys(clouds)) {
    if (key !== "wisp" && !used.has(key)) {
      clouds[key].style.opacity = "0.001"
    }
  }
}

export function lightClouds(clouds: Plates, name: string, extra = "", haze: HTMLElement | null = null, bloom: HTMLElement | null = null) {
  for (const m of PASSAGE_CLOUDS[name] ?? []) {
    const el = clouds[m.el]
    if (el) {
      el.style.filter = `${m.f} ${extra}`.trim()
    }
  }
  const tone = PASSAGE_LIGHT[name]?.tone ?? "day"
  if (haze) {
    haze.dataset.tone = tone
  }
  if (bloom) {
    bloom.dataset.tone = tone
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
    el.removeAttribute("data-scene-plate")
    /* decode first, then paint: img.decode() runs off the main thread, and
       the CSS background then finds the file already in the image cache */
    const warm = new Image()
    warm.src = plateFile(plate)
    const land = () => el.classList.add(`city-plate-${plate}`)
    warm.decode().then(land, land)
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
  const clouds = platesOf(root)
  const haze = root.querySelector<HTMLElement>("[data-haze]")
  const bloom = root.querySelector<HTMLElement>("[data-bloom]")
  /* the living city's depth: each group leans with the pointer by its own
     amount — sky least, the near island and the foreground clouds most */
  const leans = Array.from(root.querySelectorAll<HTMLElement>("[data-lean]")).map((el) => ({
    el,
    k: Number(el.dataset.lean) || 0,
  }))

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
  let sv = 0
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
        sv = 0
      }
    }
    const target = cur ? cur.p : 0
    ;[sp, sv] = springStep(sp, sv, target, dt)
    if (Math.abs(target - sp) < 0.0004 && Math.abs(sv) < 0.002) {
      sp = target
      sv = 0
    }
    const e = cur ? glide(sp) : 0

    if (cur && lit !== cur.name) {
      lit = cur.name
      lightClouds(clouds, cur.name, "", haze, bloom)
      /* whatever the idle queue has not reached yet, the passage needs now */
      attach(byName.get(cur.to))
    }

    /* which act is on screen when no passage is running */
    const act = stage.act
    const actP = stage.p[act] ?? 0
    /* the scene the next seam will bring is composited a beat early — at
       opacity 0.002, already in its arrival pose — so the first visible
       frame of a passage is never the frame that rasterises a 4K layer */
    let warmName = ""
    let warmAhead = true
    if (!cur) {
      for (const p of passages) {
        if (p.from === act && actP > 0.5) {
          warmName = p.to
          warmAhead = true
        } else if (p.to === act && actP < 0.5) {
          warmName = p.from
          warmAhead = false
        }
      }
    }

    for (const scene of scenes) {
      const name = scene.el.dataset.scene ?? ""
      /* every scene keeps its own act drift, so a seam never changes the
         scale it was already at — the passage adds to the drift, never
         replaces it (the 3.7 edit jumped ~0.07 in scale at both seam edges) */
      const own = (stage.p as Record<string, number>)[name] ?? 0
      if (cur && name === cur.from) {
        /* leaving: pushes forward and is gone before the middle of the cloud */
        setScene(scene, 1 - smooth(span(e, 0.24, 0.5)), 1.1 + 0.12 * own + 0.22 * e, -3 * own - 6 * e)
      } else if (cur && name === cur.to) {
        /* arriving: revealed from the middle as the clouds part, settling
           out of a wider shot into the drift its act then continues */
        setScene(scene, smooth(span(e, 0.5, 0.78)), 1.1 + 0.12 * own + 0.14 * (1 - e), -3 * own + 6 * (1 - e))
      } else if (!cur && name === act) {
        setScene(scene, 1, 1.1 + 0.12 * own, -3 * own)
      } else if (!cur && name === warmName) {
        setScene(scene, 0.002, 1.1 + 0.12 * own + (warmAhead ? 0.14 : 0.22), -3 * own + (warmAhead ? 6 : -6))
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
    /* the world banks through the cloud; the slight overscan keeps its corners covered while it rolls */
    const roll = cur ? rollAt(cur.name, e) : 0
    world.style.transform = `translate3d(${(-px * 1.1).toFixed(3)}%, ${(-py * 0.7).toFixed(3)}%, 0) rotate(${roll.toFixed(3)}deg) scale(1.045)`
    for (const { el, k } of leans) {
      el.style.transform = `translate3d(${(-px * k * 0.9).toFixed(3)}%, ${(-py * k * 0.55).toFixed(3)}%, 0)`
    }

    /* clouds: the passage's own choreography */
    placeClouds(clouds, cur ? cur.name : "", e, px, py)
    hazeAt(haze, cur ? cur.name : "", e)
    bloomAt(bloom, cur ? cur.name : "", e)
    if (clouds.wisp) {
      /* the wisps ride the whole journey — thin, slow, always there */
      const y = -((window.scrollY * 0.05) % 120)
      cloudAt(clouds.wisp, px * 3, 60 + y + py * 1.5, 1.4, 0.35)
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
  /* the stage mounts after hydration; its copy of the living city resumes
     the arrival where the server-rendered plate's copy already is */
  const [resume] = useState(() => (typeof window === "undefined" ? 0 : liveElapsed()))

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
            >
              {i === 0 ? <LiveCity resumeFrom={resume} /> : null}
            </div>
          </div>
        ))}
      </div>
      {SCENES.map(([name]) => (
        <div key={name} data-tint={name} className={`city-tint city-tint-${name}`} />
      ))}
      {/* the haze under the plates: the inside of the cloud, dense in the middle */}
      <div data-haze className="city-haze" />
      {/* the light of the hour we break out into */}
      <div data-bloom className="city-bloom" />
      {/* the plates, far to near — paint order is depth order */}
      <CloudPlate cloud="cluster" name="cluster" />
      <CloudPlate cloud="bank" name="bank" />
      <CloudPlate cloud="puff" name="puff" />
      <CloudPlate cloud="wisp" name="wisp" className="city-cloud-wisp" />
      <CloudPlate cloud="tower" name="tower" />
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
        const clouds = veil ? platesOf(veil) : {}
        const haze = veil ? veil.querySelector<HTMLElement>("[data-haze]") : null
        /* the veil follows the seam through the same spring as the stage:
           a finger flick or a wheel notch never lands on the plates directly */
        const flat = { name: "", target: 0, x: 0, v: 0, last: performance.now() }
        for (const el of main.querySelectorAll<HTMLElement>("[data-seam]")) {
          const name = el.dataset.seam ?? ""
          ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => {
              flat.name = name
              flat.x = 0
              flat.v = 0
              lightClouds(clouds, name, FLAT_CLOUD_LIGHT, haze)
            },
            onEnterBack: () => {
              flat.name = name
              flat.x = 1
              flat.v = 0
              lightClouds(clouds, name, FLAT_CLOUD_LIGHT, haze)
            },
            onUpdate: (self) => {
              flat.target = self.progress
            },
            onLeave: () => {
              flat.target = 1
            },
            onLeaveBack: () => {
              flat.target = 0
            },
          })
        }
        const tick = () => {
          const now = performance.now()
          const dt = now - flat.last
          flat.last = now
          ;[flat.x, flat.v] = springStep(flat.x, flat.v, flat.target, dt)
          const e = flat.name ? glide(flat.x) : 0
          const running = e > 0.001 && e < 0.999
          placeClouds(clouds, running ? flat.name : "", e)
          /* the flat seam is a sky band between two plates, so its haze runs
             a little denser than the stage's */
          hazeAt(haze, running ? flat.name : "", e, 1.3)
        }
        gsap.ticker.add(tick)
        bindDepth(gsap, main, 36)
        const stations = bindStations(ScrollTrigger, main)
        const rail = bindRail(main)
        cleanup = () => {
          gsap.ticker.remove(tick)
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
      {/* the haze under the plates, then the plates the hero arrives through */}
      <div data-haze className="city-haze" />
      <CloudPlate cloud="puff" name="puff" />
      <CloudPlate cloud="bank" name="bank" />
    </div>
  )
}
