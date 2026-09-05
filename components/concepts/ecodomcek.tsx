"use client"

/**
 * ECODOMČEK — the Vzorový dom as a walk through the house.
 *
 * Client concept (clients/ecodomcek/PLAN.md, ART_DIRECTION.md): six rooms
 * of a timber house, each a scroll-driven camera move, the copy holding
 * fully readable in every one. The world is not modelled live — every room
 * is a photoreal plate: the Blender Cycles scene (clients/ecodomcek/cycles)
 * lifted to photograph level through Higgsfield (Nano Banana Pro image-to-
 * image on our own renders, MiniMax H3 camera moves from those stills), then
 * cut into 48-frame sequences drawn onto a canvas straight from scroll
 * progress. Native scroll, no pin, no smoothing on input: the frame shown IS
 * the scroll position (CLAUDE.md #1, #4). Reduced motion gets the stills.
 *
 * Everything about the business comes from clients/ecodomcek/
 * CONTENT_INVENTORY.md (the live site, verbatim). The house is a concept and
 * says so on every plate: `Vzorový dom · koncept, nie realizácia`.
 *
 * Fonts (Instrument Sans, IBM Plex Mono, Instrument Serif italic) are loaded
 * by app/ecodomcek/page.tsx and arrive as --font-eco-* variables.
 */

import { useEffect, useRef, useState } from "react"
import { KonceptLine } from "./shell"

/* ---- tokens (ART_DIRECTION.md §2) ---- */
const T = {
  paper: "#F3EDE2",
  paper2: "#E8DFCE",
  snow: "#FFFFFF",
  hair: "#D9CDB8",
  ink: "#2B2520",
  ink2: "#6B615A",
  moss: "#4E6B21",
  dusk: "#1B2430",
  amber: "#F2C46D",
} as const

const SANS = { fontFamily: "var(--font-eco-sans), var(--font-geist-sans), sans-serif" } as const
const MONO = { fontFamily: "var(--font-eco-mono), var(--font-geist-mono), monospace" } as const
const SERIF = { fontFamily: "var(--font-eco-serif), var(--font-instrument), Georgia, serif", fontStyle: "italic" } as const

const ASSET = "/demos/ecodomcek"
const PAD = "px-[clamp(1.25rem,4vw,3.5rem)]"

/* frame counts per clip — written by clients/ecodomcek/frames.py */
const CLIPS = {
  prijazd: 48,
  "prijazd-m": 48,
  obyvacka: 48,
  stena: 48,
  model: 48,
  sumrak: 48,
} as const
type ClipId = keyof typeof CLIPS

type ActId = "prijazd" | "onas" | "obyvacka" | "stena" | "realizacie" | "kontakt"
const ACTS: { id: ActId; index: string; name: string; dot: [number, number] }[] = [
  { id: "prijazd", index: "01", name: "Príjazd", dot: [36, 82] },
  { id: "onas", index: "02", name: "Vstup", dot: [36, 60] },
  { id: "obyvacka", index: "03", name: "Obývačka", dot: [36, 30] },
  { id: "stena", index: "04", name: "Technológia", dot: [70, 40] },
  { id: "realizacie", index: "05", name: "Realizácie", dot: [166, 20] },
  { id: "kontakt", index: "06", name: "Kontakt", dot: [100, 70] },
]

/* the seven layers of the diffusion-open wall — an example build-up, labelled so */
const LAYERS = [
  ["Smrekovcový obklad Rhombus", "fasáda"],
  ["Odvetraná medzera", "laty"],
  ["Drevovláknitá doska", "difúzne otvorená"],
  ["Nosný rám + izolácia", "drevovlákno · konope"],
  ["Sadrovláknitá doska", "vzduchotesná rovina"],
  ["Inštalačná vrstva", "ovčia vlna"],
  ["Sadrovláknitá doska", "interiér"],
] as const

/* the client's own realised projects, from the live site */
const PROJECTS = [
  ["lucina", "Lúčina", "2022–2024 · dom, Rhombus + Fundermax", "Rodinný dom Lúčina, drevená fasáda Rhombus s doskami Fundermax"],
  ["presov", "Prešov", "2021 · bungalov", "Bungalov v Prešove"],
  ["rakos", "Rákoš", "2021 · terasa, smrekovec + Lexan", "Terasa pri Košiciach, podlaha zo sibírskeho smrekovca, strecha z Lexanu"],
] as const

/* ------------------------------------------------------------------ gsap */
type Gsap = typeof import("gsap")["gsap"]
type ST = typeof import("gsap/ScrollTrigger")["ScrollTrigger"]
let gsapPromise: Promise<{ gsap: Gsap; ScrollTrigger: ST }> | undefined
function loadGsap() {
  gsapPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger)
    return { gsap, ScrollTrigger }
  })
  return gsapPromise
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const set = () => setReduced(mq.matches)
    set()
    mq.addEventListener("change", set)
    return () => mq.removeEventListener("change", set)
  }, [])
  return reduced
}

/* ------------------------------------------------------------------ stage */
/**
 * One room. A tall section whose sticky viewport draws the clip's frame for
 * the section's own scroll progress; the children are the DOM that floats
 * over it. `.eco-in` children enter over the first 12 % (unless `enter` is
 * off — the first room must read at rest, before any scroll) and, when the
 * stage has `exit`, leave over the last 12 % — the hold between is the read.
 */
function Stage({
  id,
  clip,
  clipPortrait,
  poster,
  posterPortrait,
  alt,
  height = "300svh",
  enter = true,
  exit = true,
  children,
}: {
  id: ActId
  clip: ClipId
  clipPortrait?: ClipId
  poster: string
  posterPortrait?: string
  alt: string
  height?: string
  enter?: boolean
  exit?: boolean
  children: React.ReactNode
}) {
  const secRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px) and (orientation: portrait)")
    const set = () => setPortrait(mq.matches)
    set()
    mq.addEventListener("change", set)
    return () => mq.removeEventListener("change", set)
  }, [])

  useEffect(() => {
    const sec = secRef.current
    const canvas = canvasRef.current
    if (!sec || !canvas || reducedMotion()) {
      return
    }
    const clipId: ClipId = portrait && clipPortrait ? clipPortrait : clip
    const n = CLIPS[clipId]
    const frames: (HTMLImageElement | undefined)[] = new Array(n)
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) {
      return
    }
    let alive = true
    let progress = 0
    let loading = false

    const size = () => {
      const box = canvas.parentElement
      if (!box) {
        return
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(box.clientWidth * dpr)
      canvas.height = Math.round(box.clientHeight * dpr)
    }

    const draw = () => {
      const want = Math.round(progress * (n - 1))
      /* the nearest decoded frame at or below the wanted one — never a hole */
      let img: HTMLImageElement | undefined
      for (let i = want; i >= 0; i--) {
        if (frames[i]) {
          img = frames[i]
          break
        }
      }
      if (!img) {
        return
      }
      const cw = canvas.width
      const ch = canvas.height
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const w = img.naturalWidth * s
      const h = img.naturalHeight * s
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
      canvas.style.opacity = "1"
    }

    const load = () => {
      if (loading) {
        return
      }
      loading = true
      for (let i = 0; i < n; i++) {
        const img = new Image()
        img.decoding = "async"
        img.src = `${ASSET}/seq/${clipId}/${String(i).padStart(3, "0")}.webp`
        img
          .decode()
          .then(() => {
            if (!alive) {
              return
            }
            frames[i] = img
            if (i === 0 || Math.round(progress * (n - 1)) === i) {
              draw()
            }
          })
          .catch(() => {})
      }
    }

    size()
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load()
          io.disconnect()
        }
      },
      { rootMargin: "150% 0px" }
    )
    io.observe(sec)
    const onResize = () => {
      size()
      draw()
    }
    window.addEventListener("resize", onResize)

    let ctxG: { revert: () => void } | undefined
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!alive) {
        return
      }
      ctxG = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            progress = self.progress
            draw()
          },
        })
        const ins = sec.querySelectorAll<HTMLElement>(".eco-in")
        if (ins.length) {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true },
          })
          if (enter) {
            tl.fromTo(ins, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.12, stagger: 0.01, ease: "power2.out" }, 0)
          }
          if (exit) {
            tl.to(ins, { opacity: 0, y: -22, duration: 0.12, ease: "power1.in" }, 0.86)
          }
        }
      }, sec)
    })

    return () => {
      alive = false
      io.disconnect()
      window.removeEventListener("resize", onResize)
      ctxG?.revert()
    }
  }, [clip, clipPortrait, portrait, enter, exit])

  const posterSrc = portrait && posterPortrait ? posterPortrait : poster
  return (
    <section ref={secRef} id={id} data-act={id} className="relative" style={{ height }}>
      <div className="sticky top-0 h-svh overflow-hidden" style={{ background: T.paper2 }}>
        {/* biome-ignore lint/performance/noImgElement: full-bleed plate under a canvas; next/image adds nothing here */}
        <img src={posterSrc} alt={alt} className="absolute inset-0 h-full w-full object-cover" decoding="async" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-0" />
        {children}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ primitives */
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className="eco-in flex items-center gap-3 text-[0.62rem] tracking-[0.2em] uppercase"
      style={{ ...MONO, color: light ? "rgba(243,237,226,0.7)" : T.ink2 }}
    >
      <span aria-hidden="true" className="inline-block h-px w-6" style={{ background: light ? "rgba(243,237,226,0.5)" : T.hair }} />
      {children}
    </p>
  )
}

function Display({ children, size = "lg", light = false }: { children: React.ReactNode; size?: "xl" | "lg"; light?: boolean }) {
  return (
    <h2
      className="eco-in"
      style={{
        ...SANS,
        fontWeight: 400,
        fontSize: size === "xl" ? "clamp(2.6rem, min(7.4vw, 13vh), 6.6rem)" : "clamp(2rem, 4.6vw, 4.2rem)",
        lineHeight: 0.98,
        letterSpacing: "-0.03em",
        color: light ? T.paper : T.ink,
        textWrap: "balance",
      }}
    >
      {children}
    </h2>
  )
}

function Veil({ side }: { side: "left" | "right" }) {
  /* the page's own paper drawn back over the plate — the copy's ground (ART_DIRECTION §9.2) */
  const dir = side === "right" ? "100deg" : "280deg"
  return (
    <div
      aria-hidden="true"
      className="absolute -inset-y-10 -inset-x-14 -z-0"
      style={{
        background: `linear-gradient(${dir}, rgba(243,237,226,0) 0%, rgba(243,237,226,0.84) 18%, rgba(243,237,226,0.95) 48%, rgba(243,237,226,0.97) 100%)`,
      }}
    />
  )
}

function Cta({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-[6px] px-6 py-3.5 text-[0.95rem] font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ ...SANS, background: dark ? T.paper : T.moss, color: dark ? T.ink : T.snow, outlineColor: T.moss }}
    >
      {children}
    </a>
  )
}

/* ---------------------------------------------------------------- the mark */
function Mark({ size = 28 }: { size?: number }) {
  /* the roof-and-larch mark from the boards: two planes meeting at a ridge */
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M2 24 L16 6 L30 24 Z" fill="none" stroke={T.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 24 L16 15 L23 24 Z" fill={T.moss} />
    </svg>
  )
}

/* ================================================================== page */
export default function EcodomcekSite() {
  const rootRef = useRef<HTMLElement>(null)
  const [act, setAct] = useState<ActId>("prijazd")
  const [sent, setSent] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }
    let ctx: { revert: () => void } | undefined
    let alive = true
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!alive) {
        return
      }
      ctx = gsap.context(() => {
        for (const el of Array.from(root.querySelectorAll<HTMLElement>("[data-act]"))) {
          ScrollTrigger.create({
            trigger: el,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) => {
              if (self.isActive) {
                setAct(el.dataset.act as ActId)
              }
            },
          })
        }
        if (!reducedMotion()) {
          /* the two paper chapters: their plates drift a little slower than the page */
          for (const el of Array.from(root.querySelectorAll<HTMLElement>(".eco-par"))) {
            gsap.fromTo(
              el,
              { yPercent: -8 },
              { yPercent: 8, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
            )
          }
        }
      }, root)
    })
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  const current = ACTS.find((a) => a.id === act) ?? ACTS[0]

  return (
    <main ref={rootRef} className="eco relative" style={{ ...SANS, background: T.paper, color: T.ink }} data-current={act}>
      {/* ---- nav: brand, act index, phone, the one action ---- */}
      <header
        className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 ${PAD} py-5`}
        style={{ color: current.id === "kontakt" ? T.paper : T.ink }}
      >
        <a href="#prijazd" className="flex items-center gap-2.5" aria-label="EcoDomček — začiatok">
          <Mark />
          <span className="hidden text-[0.78rem] tracking-[0.22em] sm:inline" style={MONO}>
            ECODOMČEK
          </span>
        </a>
        <span className="tnum hidden text-[0.62rem] tracking-[0.22em] md:inline" style={{ ...MONO, opacity: 0.7 }}>
          {current.index} / {current.name.toUpperCase()}
        </span>
        <div className="flex items-center gap-5">
          <a href="tel:+421908704281" className="tnum hidden text-[0.95rem] underline underline-offset-4 sm:inline" style={SANS}>
            0908 704 281
          </a>
          <Cta href="#kontakt" dark={current.id === "kontakt"}>
            Bezplatná konzultácia
          </Cta>
        </div>
      </header>

      {/* ---- floor-plan minimap: where you are in the house (desktop) ---- */}
      <aside
        className="fixed bottom-6 left-[clamp(1.25rem,4vw,3.5rem)] z-30 hidden w-[12rem] rounded-[6px] p-3 lg:block"
        style={{ background: T.snow, boxShadow: "0 24px 60px -30px rgba(43,37,32,0.35)" }}
        aria-label="Pôdorys vzorového domu"
      >
        <svg viewBox="0 0 204 96" className="w-full" role="img" aria-labelledby="eco-mm">
          <title id="eco-mm">Pôdorys vzorového domu</title>
          <rect x="1" y="1" width="202" height="94" fill="none" stroke={T.ink} strokeWidth="1" />
          <path d="M70 1v94M70 40h133M130 40v55" fill="none" stroke={T.ink} strokeWidth="1" />
          <rect x="1" y="68" width="69" height="27" fill={T.paper2} />
          <path d="M1 68h69" stroke={T.ink} strokeWidth="1" />
          <circle cx={current.dot[0]} cy={current.dot[1]} r="3.5" fill={T.moss} style={{ transition: "cx 0.5s ease, cy 0.5s ease" }} />
        </svg>
        <ul className="mt-2.5 flex flex-wrap gap-1">
          {ACTS.map((a) => (
            <li key={a.id}>
              <a
                href={`#${a.id}`}
                className="inline-block rounded-full border px-2 py-0.5 text-[0.54rem] tracking-[0.08em] uppercase"
                style={{
                  ...MONO,
                  borderColor: a.id === act ? T.moss : T.hair,
                  background: a.id === act ? T.moss : "transparent",
                  color: a.id === act ? T.snow : T.ink2,
                }}
              >
                {a.name}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* ================= 01 Príjazd ================= */}
      <Stage
        id="prijazd"
        clip="prijazd"
        clipPortrait="prijazd-m"
        poster={`${ASSET}/hero.jpg`}
        posterPortrait={`${ASSET}/hero-mobile.jpg`}
        alt="Vzorový drevodom EcoDomček v rannom svetle: smrekovcová fasáda Rhombus, antracitový vykonzolovaný box, terasa a lúka"
        height="340svh"
        enter={false}
      >
        <div className={`absolute inset-0 grid grid-cols-12 items-center gap-x-6 ${PAD} pt-24 pb-28 lg:items-start lg:pt-[15vh]`}>
          <div className="relative col-span-12 self-end md:col-span-6 md:self-center lg:col-span-4 lg:self-start">
            <div className="md:hidden">
              <Veil side="left" />
            </div>
            <div className="relative flex flex-col gap-5">
              <Eyebrow>Montované drevodomy · Lúčina pri Prešove</Eyebrow>
              <h1
                className="eco-in"
                style={{ ...SANS, fontWeight: 400, fontSize: "clamp(2.6rem, min(5.2vw, 10vh), 4.8rem)", lineHeight: 0.98, letterSpacing: "-0.035em", textWrap: "balance" }}
              >
                Postavíme vám dom, ktorý dýcha.
              </h1>
              <p className="eco-in max-w-[24rem] text-[1.08rem] leading-[1.5]" style={{ color: T.ink }}>
                Difúzne otvorené drevodomy z prírodných materiálov, od základov po kolaudáciu. Čo je ekologické, je aj ekonomické.
              </p>
              <div className="eco-in flex flex-wrap items-center gap-4">
                <Cta href="#kontakt">Bezplatná konzultácia</Cta>
                <span className="text-[0.95rem]" style={{ color: T.ink2 }}>
                  alebo zavolajte{" "}
                  <a href="tel:+421908704281" className="tnum font-medium" style={{ color: T.ink }}>
                    0908 704 281
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* the concept disclosure sits on the plate, always */}
        <p
          className="absolute top-24 right-[clamp(1.25rem,4vw,3.5rem)] hidden text-right text-[0.6rem] leading-[1.5] tracking-[0.16em] md:block"
          style={{ ...MONO, color: T.moss }}
        >
          VZOROVÝ DOM
          <br />
          <span style={{ color: T.ink2, letterSpacing: "0.04em", textTransform: "none" }}>koncept, nie realizácia</span>
        </p>
        {/* the benefit band on the meadow */}
        <div
          className={`absolute inset-x-0 bottom-0 hidden grid-cols-4 gap-6 border-t ${PAD} py-6 md:grid`}
          style={{ borderColor: "rgba(43,37,32,0.25)" }}
        >
          {[
            ["01", "Ekologické"],
            ["02", "Ekonomické"],
            ["03", "Na kľúč"],
            ["04", "Staviame od 2007"],
          ].map(([k, v]) => (
            <p key={k} className="flex items-baseline gap-3 text-[0.72rem] tracking-[0.14em] uppercase" style={MONO}>
              <span style={{ color: T.moss }}>{k}</span>
              <span>{v}</span>
            </p>
          ))}
        </div>
      </Stage>

      {/* ================= 02 Vstup · O nás ================= */}
      <section id="onas" data-act="onas" className={`relative overflow-hidden ${PAD} py-[16svh]`} style={{ background: T.paper }}>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>O nás · EcoDomček, s.r.o.</Eyebrow>
            <div className="mt-5">
              <Display>Od roku 2007 staviame z dreva.</Display>
            </div>
            <p className="mt-6 max-w-[34rem] text-[1.05rem] leading-[1.6]" style={{ color: T.ink2 }}>
              Spoločnosť EcoDomček, s.r.o. vznikla 1. januára 2017, kariéra staviteľa sa však začala písať už v roku 2007
              svojpomocne postaveným montovaným drevodomom. Odvtedy sú za nami montované drevodomy, strechy, altánky a iné
              drevené konštrukcie — drevo je materiál a technológia, ktorej veríme.
            </p>
            <p className="mt-6 text-[0.72rem] tracking-[0.14em] uppercase" style={{ ...MONO, color: T.ink2 }}>
              Mgr. Roman Chovanec · konateľ
            </p>
          </div>
          <figure className="relative m-0 overflow-hidden rounded-[6px] lg:col-span-7" style={{ aspectRatio: "16/9" }}>
            {/* biome-ignore lint/performance/noImgElement: a plate that drifts under scroll; next/image would fight the transform */}
            <img
              src={`${ASSET}/deck.jpg`}
              alt="Prah vzorového domu: smrekovcová terasa, posuvné presklenie, betónový sokel a lúka"
              className="eco-par absolute inset-0 h-[116%] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <figcaption
              className="absolute bottom-4 left-4 rounded-[4px] px-2.5 py-1.5 text-[0.6rem] tracking-[0.14em] uppercase"
              style={{ ...MONO, background: "rgba(243,237,226,0.92)", color: T.ink2 }}
            >
              Vstup · sibírsky smrekovec · vzorový dom
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= 03 Obývačka ================= */}
      <Stage
        id="obyvacka"
        clip="obyvacka"
        poster={`${ASSET}/living.jpg`}
        alt="Obývačka vzorového domu: dubová podlaha, presklenie na terasu a lúku, otvorené smrekové schodisko"
        height="300svh"
      >
        <div className={`absolute inset-0 grid grid-cols-12 items-center gap-x-6 ${PAD} pt-24 pb-16`}>
          <div className="relative col-span-12 self-end md:col-span-6 md:col-start-7 md:self-center lg:col-span-5 lg:col-start-8">
            <Veil side="right" />
            <div className="relative flex flex-col gap-5">
              <Eyebrow>Drevodomy na kľúč</Eyebrow>
              <Display>V lete chladí, v zime hreje.</Display>
              <p className="eco-in max-w-[30rem] text-[1.02rem] leading-[1.55]" style={{ color: T.ink2 }}>
                Postavíme vám zdravý, ekologický a ekonomický dom s príjemnou klímou: vysoký komfort bývania, rýchla
                výstavba a finančné výhody. Od základov až po kolaudáciu.
              </p>
            </div>
          </div>
        </div>
      </Stage>

      {/* ================= 04 Technológia ================= */}
      <Stage
        id="stena"
        clip="stena"
        poster={`${ASSET}/wall.jpg`}
        alt="Skladba difúzne otvorenej steny rozložená do siedmich vrstiev: smrekovcový obklad, laty, drevovláknitá doska, nosný rám s izoláciou, sadrovláknité dosky, ovčia vlna"
        height="380svh"
        exit={false}
      >
        <div className={`absolute inset-0 grid grid-cols-12 items-center gap-x-6 ${PAD} pt-24 pb-16`}>
          <div className="relative col-span-12 self-end md:col-span-5 md:self-center lg:col-span-4">
            <Veil side="left" />
            <div className="relative flex flex-col gap-5">
              <Eyebrow>Difúzne otvorená stena</Eyebrow>
              <Display>Stena, ktorá dýcha.</Display>
              <p className="eco-in max-w-[28rem] text-[1.02rem] leading-[1.55]" style={{ color: T.ink2 }}>
                Zatepľujeme prírodnými materiálmi: drevovláknité izolácie, konope, ovčia vlna, minerálna vlna bez
                formaldehydov. Drevo chránime boritou soľou, ktorá je účinná, trvácna a lacnejšia než bežné toxické nátery.
              </p>
            </div>
          </div>
          <ol className="relative col-span-12 hidden flex-col gap-2 self-center md:col-span-5 md:col-start-8 md:flex lg:col-span-4 lg:col-start-9">
            {LAYERS.map(([name, small], i) => (
              <li
                key={name + small}
                className="eco-in flex items-baseline gap-3 rounded-[4px] px-3 py-2"
                style={{ background: "rgba(243,237,226,0.92)" }}
              >
                <span className="tnum text-[0.6rem] tracking-[0.14em]" style={{ ...MONO, color: i === 3 ? T.moss : T.ink2 }}>
                  0{i + 1}
                </span>
                <span className="text-[0.72rem] tracking-[0.1em] uppercase" style={{ ...MONO, color: i === 3 ? T.moss : T.ink }}>
                  {name}
                  <span className="block text-[0.62rem] tracking-[0.02em] normal-case" style={{ color: T.ink2 }}>
                    {small}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p
          className="absolute right-[clamp(1.25rem,4vw,3.5rem)] bottom-8 hidden max-w-[34ch] text-right text-[0.6rem] leading-[1.6] tracking-[0.12em] md:block"
          style={{ ...MONO, color: T.ink2 }}
        >
          PRÍKLAD SKLADBY. PRESNÉ VRSTVY A HRÚBKY DOPLNÍ ECODOMČEK.
        </p>
      </Stage>

      {/* ---- the material, close: a slow slide along the boards, the still under reduced motion ---- */}
      <section className="relative overflow-hidden" style={{ aspectRatio: "21/9", maxHeight: "80svh", background: T.paper2 }}>
        {reduced ? (
          /* biome-ignore lint/performance/noImgElement: full-bleed plate */
          <img
            src={`${ASSET}/cladding.jpg`}
            alt="Detail fasády: smrekovcový obklad profilu Rhombus v nízkom rannom svetle pri antracitovom okennom ráme"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={`${ASSET}/cladding.mp4`}
            poster={`${ASSET}/cladding.jpg`}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-label="Detail fasády: smrekovcový obklad profilu Rhombus v nízkom rannom svetle pri antracitovom okennom ráme"
          />
        )}
        <p
          className="absolute bottom-6 left-[clamp(1.25rem,4vw,3.5rem)] rounded-[4px] px-2.5 py-1.5 text-[0.6rem] tracking-[0.14em] uppercase"
          style={{ ...MONO, background: "rgba(243,237,226,0.92)", color: T.ink2 }}
        >
          Sibírsky smrekovec · profil Rhombus · vzorový dom
        </p>
      </section>

      {/* ================= 05 Realizácie ================= */}
      <Stage
        id="realizacie"
        clip="model"
        poster={`${ASSET}/model.jpg`}
        alt="Model vzorového domu so zdvihnutou strechou na svetlom stole"
        height="280svh"
        exit={false}
      >
        <div className={`absolute inset-0 flex flex-col justify-between ${PAD} pt-20 pb-6 md:pt-24 md:pb-8`}>
          <div className="relative max-w-[34rem]">
            <div className="md:hidden">
              <Veil side="left" />
            </div>
            <div className="relative">
              <Eyebrow>Realizácie 2008–2024</Eyebrow>
              <div className="mt-4">
                <Display>Čo sme už postavili.</Display>
              </div>
              <p className="eco-in mt-4 max-w-[30rem] text-[1.02rem] leading-[1.55]" style={{ color: T.ink2 }}>
                Päť domov, tri terasy. Každá stavba od základov po finál, každú robíme osobne.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:ml-auto lg:w-[72%]">
            {PROJECTS.map(([slug, name, meta, alt]) => (
              <figure key={slug} className="eco-in m-0">
                <div className="overflow-hidden rounded-[6px]" style={{ aspectRatio: "4/3", background: T.paper2 }}>
                  {/* biome-ignore lint/performance/noImgElement: client's own photographs, fixed plates */}
                  <img src={`${ASSET}/realizacie/${slug}.jpg`} alt={alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </div>
                <figcaption className="mt-2 text-[0.6rem] tracking-[0.12em] uppercase" style={{ ...MONO, color: T.ink2 }}>
                  <b style={{ color: T.ink, fontWeight: 500 }}>{name}</b>
                  <span className="hidden sm:inline"> · {meta}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Stage>

      {/* ================= 06 Kontakt · súmrak ================= */}
      <Stage
        id="kontakt"
        clip="sumrak"
        poster={`${ASSET}/dusk.jpg`}
        alt="Vzorový dom za súmraku: okná svietia teplým svetlom, schodisko a obývačka vidno cez presklenie"
        height="300svh"
        exit={false}
      >
        <div className={`absolute inset-0 grid grid-cols-12 items-center gap-x-6 ${PAD} pt-20 pb-16 lg:items-start lg:pt-[13vh]`}>
          <div
            className="eco-in col-span-12 flex flex-col gap-3 rounded-[6px] p-5 sm:p-7 md:col-span-7 lg:col-span-5"
            style={{ background: T.snow, color: T.ink }}
          >
            <p className="text-[1.1rem] leading-[1.35]" style={SERIF}>
              „Postavíme Vám domček, vysnívaný dom, útulné miesto rodinnej pohody. Domov si už z neho spravíte sami.“
            </p>
            <div className="flex flex-col gap-1">
              <a href="tel:+421908704281" className="tnum text-[1.7rem] leading-[1.1] tracking-[-0.02em]" style={SANS}>
                0908 704 281
              </a>
              <a href="mailto:dobryden@ecodomcek.sk" className="text-[1.1rem]" style={{ color: T.moss }}>
                dobryden@ecodomcek.sk
              </a>
            </div>
            <form
              className="mt-1 hidden flex-col gap-2.5 sm:flex"
              onSubmit={(e) => {
                e.preventDefault()
                const f = new FormData(e.currentTarget)
                const body = `${f.get("sprava") ?? ""}\n\n${f.get("meno") ?? ""}\n${f.get("email") ?? ""}`
                window.location.href = `mailto:dobryden@ecodomcek.sk?subject=${encodeURIComponent("Dopyt z webu")}&body=${encodeURIComponent(body)}`
                setSent(true)
              }}
            >
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  ["meno", "Meno", "text"],
                  ["email", "E-mail", "email"],
                ].map(([n, l, t]) => (
                  <label key={n} className="flex flex-col gap-1 text-[0.6rem] tracking-[0.16em] uppercase" style={{ ...MONO, color: T.ink2 }}>
                    {l}
                    <input
                      name={n}
                      type={t}
                      required
                      className="rounded-[4px] border px-3 py-2 text-[0.95rem] tracking-normal normal-case focus-visible:outline-2"
                      style={{ ...SANS, borderColor: T.hair, color: T.ink, outlineColor: T.moss }}
                    />
                  </label>
                ))}
              </div>
              <label className="flex flex-col gap-1 text-[0.6rem] tracking-[0.16em] uppercase" style={{ ...MONO, color: T.ink2 }}>
                Správa
                <textarea
                  name="sprava"
                  rows={2}
                  required
                  className="rounded-[4px] border px-3 py-2.5 text-[0.95rem] tracking-normal normal-case focus-visible:outline-2"
                  style={{ ...SANS, borderColor: T.hair, color: T.ink, outlineColor: T.moss }}
                />
              </label>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="submit"
                  className="rounded-[6px] px-6 py-3 text-[0.95rem] font-medium transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ ...SANS, background: T.moss, color: T.snow, outlineColor: T.moss }}
                >
                  {sent ? "Otvára sa e-mail…" : "Odoslať správu"}
                </button>
                <span className="text-[0.6rem] tracking-[0.14em] uppercase" style={{ ...MONO, color: T.ink2 }}>
                  Ozveme sa. Keď už nič iné, skúsime poradiť.
                </span>
              </div>
            </form>
          </div>
        </div>
        <p
          className={`absolute inset-x-0 bottom-0 flex flex-wrap gap-x-7 gap-y-1 border-t ${PAD} py-4 text-[0.58rem] tracking-[0.14em] uppercase`}
          style={{ ...MONO, color: "rgba(243,237,226,0.72)", borderColor: "rgba(243,237,226,0.25)" }}
        >
          <span>EcoDomček, s.r.o.</span>
          <span>Lúčina 33, 082 07 Lúčina</span>
          <span className="tnum">IČO 50619616</span>
          <span className="tnum">IČ DPH SK2120403648</span>
          <span>OR OS Prešov, Sro 33794/P</span>
        </p>
      </Stage>

      {/* ---- the honest line back to the studio ---- */}
      <footer
        className={`relative flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 ${PAD} py-6 text-[0.58rem] tracking-[0.14em] uppercase`}
        style={{ ...MONO, background: T.paper, color: T.ink2 }}
      >
        <span className="max-w-[64ch] normal-case tracking-[0.02em]">
          Vzorový dom je koncept — priestorová kostra z verejnej 3D prehliadky, materiály EcoDomčeku. Nie je to
          realizovaný projekt. Fotografie realizácií © EcoDomček.
        </span>
        <KonceptLine />
      </footer>
    </main>
  )
}
