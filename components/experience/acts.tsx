"use client"

/**
 * Žiara — the DOM acts (/01–/05).
 *
 * One atmosphere, one sunrise: the acts share a single fog-to-frost world
 * and differ only in camera and light (CODERA_ART_DIRECTION_V3.md).
 * Native scroll, zero pins; sticky regions choreograph /02 and /03.
 * Reference records: CODERA_DESIGN_REFERENCES (igloo, exoape, basement).
 */

import { useEffect, useRef } from "react"
import { MeridianHero } from "@/components/concepts/meridian"
import { StatutHero } from "@/components/concepts/statut"
import { VlnaHero } from "@/components/concepts/vlna"
import { packages } from "@/lib/site-config"
import { openEnquiry } from "./enquiry-bus"
import { ActPremena } from "./premena"
import { bindStage, stage } from "./stage"

const MONO = { fontFamily: "var(--font-geist-mono)" }

/* Exhibition rail: ORYZO's vertical edge label — quiet act signage
   running down the right edge on desktop. */
function EdgeLabel({ text }: { text: string }) {
  return (
    <p
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 text-[0.54rem] tracking-[0.34em] mix-blend-difference lg:block"
      style={{ writingMode: "vertical-rl", color: "rgba(242,244,246,0.4)", ...MONO }}
    >
      {text}
    </p>
  )
}

/* Hyperstudio's dot-matrix map, localized: Slovakia raster-scanned into
   dots, one frost-lit point on Prešov. Deterministic, computed
   once at module scope. */
const SK_POLY: [number, number][] = [
  [16.85, 48.38], [16.94, 48.62], [17.19, 48.87], [17.72, 48.86], [18.06, 49.05],
  [18.39, 49.4], [18.85, 49.52], [19.45, 49.6], [19.8, 49.41], [20.3, 49.4],
  [20.9, 49.3], [21.6, 49.45], [22.1, 49.3], [22.56, 49.08], [22.53, 48.85],
  [22.15, 48.4], [21.7, 48.35], [21.1, 48.5], [20.5, 48.55], [20.1, 48.25],
  [19.6, 48.23], [18.85, 48.05], [18.75, 47.87], [18.3, 47.76], [17.7, 47.76],
  [17.25, 47.9], [17.1, 48.03], [16.98, 48.17],
]

function skInside(x: number, y: number) {
  let c = false
  for (let i = 0, j = SK_POLY.length - 1; i < SK_POLY.length; j = i++) {
    const [xi, yi] = SK_POLY[i]
    const [xj, yj] = SK_POLY[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      c = !c
    }
  }
  return c
}

const SK_DOTS: [number, number][] = (() => {
  const dots: [number, number][] = []
  for (let r = 0; r < 16; r++) {
    for (let cIdx = 0; cIdx < 46; cIdx++) {
      const lon = 16.8 + ((cIdx + 0.5) / 46) * 5.8
      const lat = 49.65 - ((r + 0.5) / 16) * 1.95
      if (skInside(lon, lat)) {
        dots.push([
          Math.round(((lon - 16.8) / 5.8) * 3200) / 10,
          Math.round(((49.65 - lat) / 1.95) * 1100) / 10,
        ])
      }
    }
  }
  return dots
})()

function SlovakiaDotMap() {
  return (
    <div data-enter className="enter relative z-10 mx-auto mb-8 w-[min(300px,72vw)]">
      <svg viewBox="0 0 320 110" aria-hidden="true" className="w-full">
        <g fill="#17181d" opacity="0.2">
          {SK_DOTS.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />
          ))}
        </g>
        {/* Prešov — the studio's home */}
        <circle cx="244.6" cy="36.8" r="2.8" fill="#17181d" />
        <circle cx="244.6" cy="36.8" r="6" fill="none" stroke="#17181d" strokeOpacity="0.35" strokeWidth="1" />
      </svg>
      <p className="mt-3 text-center whitespace-nowrap text-[0.52rem] tracking-[0.18em] text-[#17181d]/50" style={MONO}>
        PREŠOV · 49.00° N / 21.23° E
      </p>
    </div>
  )
}

/* ------------------------------------------------------------ binding --- */

/* Laxenaire's scroll pill, retold as act signage in the nav. */
const ACT_NO: Record<string, string> = {
  hero: "01",
  pass: "01",
  premena: "02",
  work: "03",
  meridian: "03",
  statut: "03",
  vlna: "03",
  offer: "04",
  resolution: "05",
}

function useStage(probe: boolean) {
  const probeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const unbind = bindStage()
    const root = document.querySelector<HTMLElement>("main[data-experience=v3]")
    root?.setAttribute("data-hydrated", "")
    const actPill = document.querySelector<HTMLElement>("[data-act-pill]")
    let frame = 0
    let lastScrollTs = 0
    let worst = 0
    const onScroll = () => {
      lastScrollTs = performance.now()
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    const write = () => {
      frame = requestAnimationFrame(write)
      if (!root) {
        return
      }
      /* /02 wipe: completes at 62% of the region, then HOLDS readable */
      const fold = Math.min(1, stage.p.premena / 0.62)
      root.style.setProperty("--fold", fold.toFixed(4))
      if (fold >= 0.97 && !root.hasAttribute("data-wipe-done")) {
        root.setAttribute("data-wipe-done", "")
      }
      root.style.setProperty("--recede-a", Math.min(1, stage.p.statut * 2).toFixed(4))
      root.style.setProperty("--recede-b", Math.min(1, stage.p.vlna * 2).toFixed(4))
      root.style.setProperty("--journey", stage.total.toFixed(4))

      if (actPill) {
        const label = `${ACT_NO[stage.act] ?? "01"} / 05`
        if (actPill.textContent !== label) {
          actPill.textContent = label
        }
      }

      if (probe && probeRef.current) {
        const now = performance.now()
        const delta = lastScrollTs ? now - lastScrollTs : 0
        if (delta > worst && delta < 250) {
          worst = delta
        }
        probeRef.current.textContent = `act ${stage.act} · input→write ${delta.toFixed(1)} ms (worst ${worst.toFixed(1)}) · fold ${fold.toFixed(2)}`
      }
    }
    frame = requestAnimationFrame(write)

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-entered", "")
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: "-12% 0px" }
    )
    for (const el of document.querySelectorAll("[data-enter]")) {
      io.observe(el)
    }

    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-offer-row]"))
    const rowIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.toggleAttribute("data-active", e.isIntersecting)
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    )
    for (const r of rows) {
      rowIo.observe(r)
    }

    return () => {
      unbind()
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      io.disconnect()
      rowIo.disconnect()
    }
  }, [probe])
  return probeRef
}

/* ---------------------------------------------------------- /01 ENTRY --- */

function ActHero({ world }: { world: boolean }) {
  return (
    <section
      data-zone="hero"
      className={`relative flex h-svh flex-col overflow-hidden text-[#f2f4f6] ${world ? "" : "molten-field"}`}
    >
      {/* poster-scale wordmark living BEHIND the object (North Kingdom) */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[31svh] left-1/2 w-full -translate-x-1/2 text-center text-[clamp(2.9rem,15vw,19rem)] font-light whitespace-nowrap text-[#f2f4f6]/[0.05] select-none lg:text-[clamp(6rem,19vw,19rem)]"
        style={{ lineHeight: 1, letterSpacing: "0.08em" }}
      >
        CODERA
      </p>

      {!world ? (
        <>
          {/* flat mode: the C glowing from within the fog [igloo]. The glow
              is cool and sits BEHIND the mark — the object is lit, the page
              is not decorated. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[26svh] right-[6vmin] h-[46vmin] w-[46vmin] rounded-full opacity-70 lg:top-1/2 lg:right-[2vmin] lg:h-[60vmin] lg:w-[60vmin] lg:-translate-y-1/2"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(220,230,238,0.22) 0%, rgba(220,230,238,0.07) 45%, transparent 70%)" }}
          />
          {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
          <img
            src="/brand/codera-mark.svg"
            alt=""
            fetchPriority="high"
            className="pointer-events-none absolute top-[14svh] right-[-10vmin] w-[62vmin] max-w-none opacity-95 lg:top-[46%] lg:right-[-8vmin] lg:w-[74vmin] lg:-translate-y-1/2"
            style={{ filter: "drop-shadow(0 0 34px rgba(220,230,238,0.28)) drop-shadow(0 46px 90px rgba(0,0,0,0.55))" }}
          />
          {/* engineering annotation over the object [igloo] */}
          <p
            aria-hidden="true"
            className="absolute top-[30svh] right-[8vmin] hidden text-[0.56rem] leading-[1.8] tracking-[0.14em] text-[#8b909a] lg:block"
            style={MONO}
          >
            {"// OBJEKT — STUHA C"}
            <br />
            R 9.0 · MEDZERA 90°<br />
            TITÁN · VNÚTORNÉ SVETLO
          </p>
        </>
      ) : null}

      <EdgeLabel text="/01 — ŽIARA" />

      {/* rotating scroll badge (monopo) */}
      <a
        href="#premena"
        aria-label="Posunúť na premenu"
        className="absolute right-[clamp(1.25rem,4vw,3.5rem)] bottom-[7svh] hidden h-[92px] w-[92px] lg:block"
      >
        <svg viewBox="0 0 100 100" className="scroll-badge h-full w-full opacity-70" role="img" aria-label="Skrolujte">
          <defs>
            <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text fill="#f2f4f6" fontSize="10" letterSpacing="2.6" style={MONO}>
            <textPath href="#badge-circle">SCROLL · POZRIEŤ PRÁCU ·</textPath>
          </text>
          <path d="M50 42 L50 58 M44 52 L50 58 L56 52" stroke="#f2f4f6" strokeWidth="1.6" fill="none" />
        </svg>
      </a>

      <div data-enter className="enter relative z-10 mt-auto mb-[8svh] px-[clamp(1.25rem,4vw,3.5rem)]">
        <p className="mb-5 text-[0.6rem] tracking-[0.2em] text-[#8b909a] lg:text-[0.68rem] lg:tracking-[0.32em]" style={MONO}>
          KREATÍVNE WEBOVÉ ŠTÚDIO — PREŠOV · 49.00° N
        </p>
        {/* Žiara display voice: LIGHT weight at scale, slightly larger than
            the v2 semibold could afford — confidence through lightness
            [exoape]. Tight but not crushed; the halo keeps it legible where
            it crosses the lit C. */}
        <h1
          data-hero-line
          className="max-w-[10.5em] text-[clamp(1.7rem,8.8vw,4.8rem)] font-light lg:text-[clamp(2.4rem,7vw,7.4rem)]"
          style={{
            lineHeight: 1.02,
            letterSpacing: "-0.022em",
            textShadow: "0 1px 2px rgba(10,11,14,0.55), 0 14px 44px rgba(10,11,14,0.6)",
          }}
        >
          <span className="rise-wrap">
            <span className="rise">Vaša firma je lepšia,</span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.12s" }}>
              než ukazuje váš web.
            </span>
          </span>
        </h1>
        {/* the support line is about the READER, not our disciplines —
            CODERA_STEP6_CONTENT.md §3 */}
        <p className="mt-5 max-w-[30rem] text-[0.95rem] leading-[1.6] text-[#f2f4f6]/70">
          Navrhujeme a staviame firemné weby, ktoré pôsobia tak dôveryhodne, ako
          naozaj pracujete.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="rounded-full bg-[#f2f4f6] px-6 py-3 text-[0.85rem] font-medium text-[#17181d]"
          >
            Začať projekt
          </button>
          <a href="#praca" className="border-b border-white/35 pb-0.5 text-[0.85rem] text-white/80">
            Pozrieť prácu ↓
          </a>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- /03 WORK --- */

/**
 * /03 as a PORTAL GALLERY (AD v3 amendment 2). The full-bleed sticky stack
 * retires: each project is an editorial split — the name at poster scale in
 * its own face, the reasoning line, and a PORTAL: the concept's live hero
 * rendered at half scale inside a perspective-tilted frame that answers the
 * pointer. Two ways in — the full concept site and the case study. The hero
 * components are the same ones the /koncept pages open with, so the portal
 * and the destination cannot drift.
 */
const PROJECTS = [
  {
    id: "meridian",
    name: "Meridián",
    sector: "PRAŽIAREŇ KÁVY · E-SHOP",
    line: "Obal predáva skôr než popis — balenie je hrdinom stránky, nie fotka zrniek.",
    Hero: MeridianHero,
    font: { fontFamily: "var(--font-fraunces), Georgia, serif" },
    accent: "#C4531F",
  },
  {
    id: "statut",
    name: "Štatút",
    sector: "ADVOKÁTSKA KANCELÁRIA",
    line: "Klient hľadá istotu, nie efekt — stránka mu ju dá hustotou a poriadkom.",
    Hero: StatutHero,
    font: { fontFamily: "var(--font-instrument), Georgia, serif" },
    accent: "#6E1F26",
  },
  {
    id: "vlna",
    name: "Vlna",
    sector: "WELLNESS A POHYB",
    line: "Rozvrh na prvej obrazovke — rozhodnutie padne skôr, než návštevník začne hľadať.",
    Hero: VlnaHero,
    font: { fontFamily: "var(--font-bricolage), var(--font-geist-sans), sans-serif" },
    accent: "#123B3A",
  },
] as const

function Portal({ Hero, id }: { Hero: React.ComponentType<{ portal?: boolean }>; id: string }) {
  return (
    <a
      href={`/koncept/${id}`}
      aria-label="Vstúpiť do konceptu"
      className="group relative block overflow-hidden rounded-[12px]"
      style={{
        aspectRatio: "16/10",
        transform:
          "perspective(1400px) rotateY(calc(var(--tx, 0) * 7deg)) rotateX(calc(var(--ty, 0) * -7deg))",
        transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s",
        boxShadow: "0 40px 90px -35px rgba(14,15,19,0.55), 0 0 0 1px rgba(23,24,29,0.1)",
      }}
    >
      {/* the live hero at half scale — a real page behind glass, never a screenshot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[200%] w-[200%] origin-top-left"
        style={{ transform: "scale(0.5)", containerType: "inline-size" }}
      >
        <div className="h-full">
          <Hero portal />
        </div>
      </div>
      {/* frost glass lip + invitation */}
      <span
        className="absolute right-4 bottom-4 z-10 rounded-full bg-[#17181d]/85 px-5 py-2.5 text-[0.6rem] tracking-[0.16em] text-[#f2f4f6] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        style={MONO}
      >
        VSTÚPIŤ →
      </span>
    </a>
  )
}

function ActWork({ world }: { world: boolean }) {
  return (
    <section
      data-zone="work"
      id="praca"
      className="relative"
      style={world ? undefined : { background: "linear-gradient(180deg,#9BA1AC 0%,#C4C9D1 55%,#DFE3E8 100%)" }}
    >
      <div className="px-[clamp(1.1rem,4vw,3.5rem)] pt-[10svh]">
        <p className="text-[0.66rem] tracking-[0.3em] text-[#17181d]/70" style={MONO}>
          03 — VYBRANÁ PRÁCA · TRI KONCEPTY, TRI JAZYKY
        </p>
      </div>

      {PROJECTS.map(({ id, name, sector, line, Hero, font, accent }, i) => (
        <div
          key={id}
          data-enter
          className="world-shell grid min-h-[92svh] items-center gap-8 px-[clamp(1.1rem,4vw,3.5rem)] py-[6svh] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:gap-14"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            e.currentTarget.style.setProperty("--tx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
            e.currentTarget.style.setProperty("--ty", ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.setProperty("--tx", "0")
            e.currentTarget.style.setProperty("--ty", "0")
          }}
        >
          <div className={i % 2 ? "lg:order-2" : ""}>
            <p className="tnum text-[0.66rem] text-[#17181d]/50" style={MONO}>
              03·0{i + 1}
            </p>
            <p className="mt-3 text-[0.6rem] tracking-[0.24em]" style={{ ...MONO, color: accent }}>
              {sector} · UKÁŽKOVÝ KONCEPT
            </p>
            <h3
              className="mt-2 text-[#17181d]"
              style={{ ...font, fontSize: "clamp(3rem,7.2vw,6.6rem)", lineHeight: 0.95, letterSpacing: "-0.015em" }}
            >
              {name}
            </h3>
            <p className="mt-4 max-w-[26rem] text-[0.95rem] leading-[1.6] text-[#17181d]/70">{line}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <a
                href={`/koncept/${id}`}
                className="rounded-full px-6 py-3 text-[0.66rem] tracking-[0.14em] text-[#f2f4f6] transition-transform hover:-translate-y-0.5"
                style={{ ...MONO, background: "#17181d" }}
              >
                VSTÚPIŤ DO KONCEPTU →
              </a>
              <a
                href={`/praca/${id}`}
                className="text-[0.66rem] tracking-[0.14em] text-[#17181d]/70 underline underline-offset-4"
                style={MONO}
              >
                PRÍPADOVÁ ŠTÚDIA
              </a>
            </div>
          </div>

          <div className={i % 2 ? "lg:order-1" : ""}>
            <Portal Hero={Hero} id={id} />
          </div>
        </div>
      ))}
    </section>
  )
}

/* ---------------------------------------------------------- /04 OFFER --- */

/** Work artifacts for the craft rows — each discipline shows a small
    specimen of its output instead of resting on type alone (The1's
    "show the material", Mercury's quiet plates). */
const PRIORITY_DOTS = (() => {
  const dots: { x: number; y: number; gold: boolean }[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 12; c++) {
      dots.push({
        x: Math.round((6 + c * 12.4) * 10) / 10,
        y: 8 + r * 13,
        gold: (r === 1 && c === 2) || (r === 2 && c === 6) || (r === 0 && c === 9),
      })
    }
  }
  return dots
})()

function OfferArtifact({ kind }: { kind: "strategia" | "dizajn" | "vyvoj" }) {
  if (kind === "strategia") {
    return (
      <div className="w-[176px] border border-black/20 bg-white/45 p-3">
        <svg viewBox="0 0 148 54" className="w-full" aria-hidden="true">
          {PRIORITY_DOTS.map((d) => (
            <circle
              key={`${d.x}-${d.y}`}
              cx={d.x}
              cy={d.y}
              r={d.gold ? 2.6 : 1.4}
              fill={d.gold ? "#a4520f" : "rgba(25,26,28,0.25)"}
            />
          ))}
          <path
            d="M30.8 21 L80.4 34 L117.6 8"
            fill="none"
            stroke="#a4520f"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
        </svg>
        <p className="mt-2 text-[0.45rem] tracking-[0.18em] text-black/55" style={MONO}>
          Z AUDITU — MAPA PRIORÍT
        </p>
      </div>
    )
  }
  if (kind === "dizajn") {
    return (
      <div className="w-[176px] border border-black/20 bg-white/45 p-3">
        <div className="flex h-[54px] items-stretch gap-1.5">
          <div
            className="flex flex-1 items-center justify-center border border-black/20 text-[0.95rem] font-semibold"
            style={{ background: "#d8d7d2", color: "#191a1c", fontStretch: "125%" }}
          >
            Aa
          </div>
          <div
            className="flex flex-1 items-center justify-center text-[0.95rem] font-semibold"
            style={{ background: "#e7efe9", color: "#1d5f5a" }}
          >
            Aa
          </div>
          <div
            className="flex flex-1 items-center justify-center text-[1rem] italic"
            style={{ background: "#201a15", color: "#efe6d8", fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Aa
          </div>
        </div>
        <p className="mt-2 text-[0.45rem] tracking-[0.18em] text-black/55" style={MONO}>
          TRI SVETY · VLASTNÁ RÉŽIA
        </p>
      </div>
    )
  }
  return (
    <div className="w-[176px] border border-black/20 bg-[#17181d] p-3">
      <div className="space-y-1.5 text-[0.6rem] text-[#dce6ee]" style={MONO}>
        {[
          ["LCP", "1,9 s"],
          ["CLS", "0,00"],
          ["SNÍMKA", "16,7 ms"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between">
            <span className="text-white/45">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[0.45rem] tracking-[0.18em] text-white/40" style={MONO}>
        MERANÉ NA TOMTO WEBE
      </p>
    </div>
  )
}

function ActOffer({ world }: { world: boolean }) {
  return (
    <section
      data-zone="offer"
      id="sluzby"
      className="act-rule relative text-[#17181d]"
      style={world ? undefined : { background: "#EDF0F3" }}
    >
      <EdgeLabel text="/04 — REMESLO" />
      <div className="flex flex-col gap-10 px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh] lg:flex-row lg:gap-16">
        {/* sticky act title (Navigate band structure) */}
        <div className="lg:w-[34%]">
          <div className="lg:sticky lg:top-28">
            <p className="text-[0.66rem] tracking-[0.3em] text-black/55" style={MONO}>
              04 — REMESLO
            </p>
            <h2
              data-enter
              className="mt-4 font-light"
              style={{ fontSize: "clamp(2rem,3.6vw,3.6rem)", lineHeight: 1.02, letterSpacing: "-0.022em" }}
            >
              <span className="rise-wrap">
                <span className="rise">Čo pre vás</span>
              </span>
              <span className="rise-wrap">
                <span className="rise" style={{ ["--rise-delay" as string]: "0.12s" }}>
                  urobíme.
                </span>
              </span>
            </h2>
            <p className="mt-4 max-w-[22em] text-[0.85rem] leading-relaxed text-black/60">
              Jedna stuha, tri disciplíny — od pochopenia firmy až po web
              pripravený na produkciu.
            </p>
            {/* strand hairlines drawing toward the rows */}
            <svg aria-hidden="true" viewBox="0 0 220 60" className="mt-6 hidden w-[220px] lg:block">
              <path d="M0 8 H150 M0 30 H190 M0 52 H120" stroke="#17181d" strokeOpacity="0.35" strokeWidth="1.2" />
              <circle cx="150" cy="8" r="2.4" fill="#a4520f" />
              <circle cx="190" cy="30" r="2.4" fill="#1d5f5a" />
              <circle cx="120" cy="52" r="2.4" fill="#9c3b22" />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          {(
            [
              ["01", "STRATÉGIA", "Najprv pochopíme vašu firmu, zákazníkov a to, čo má web reálne priniesť.", "audit · pozicionovanie · obsah", "strategia"],
              ["02", "DIZAJN", "Z pochopenia vznikne vizuálny systém, ktorý firmu odlíši a pôsobí dôveryhodne.", "art direction · UI · prototyp", "dizajn"],
              ["03", "VÝVOJ", "Rýchly, responzívny web pripravený na produkciu — bez kompromisov v detailoch.", "Next.js · výkon · nasadenie", "vyvoj"],
            ] as const
          ).map(([n, t, d, tags, kind]) => (
            <div
              key={n}
              data-enter
              data-offer-row
              className="enter offer-row grid grid-cols-[3.4rem_1fr] items-baseline gap-x-6 border-t border-black/15 px-2 py-[3.4svh] lg:grid-cols-[3.4rem_1fr_auto] lg:items-center"
            >
              <span
                className="font-semibold text-black/20"
                style={{ fontSize: "clamp(1.6rem,2.6vw,2.6rem)", fontStretch: "118%" }}
              >
                {n}
              </span>
              <div>
                <span
                  className="offer-title font-semibold"
                  style={{ fontSize: "clamp(1.6rem,3vw,3rem)", letterSpacing: "-0.02em", fontStretch: "112%" }}
                >
                  {t}
                </span>
                <p className="mt-2 max-w-[32em] text-[0.85rem] leading-relaxed text-black/70">{d}</p>
                <p className="mt-2 text-[0.56rem] tracking-[0.2em] text-black/55" style={MONO}>
                  {tags.toUpperCase()}
                </p>
              </div>
              <div className="hidden lg:block">
                <OfferArtifact kind={kind} />
              </div>
            </div>
          ))}

          {/* The offer itself. Three packages, no highlighted middle column:
              pushing one of them is the pricing form of scarcity theatre, and
              the audit bans it. The "čo v tom nie je" line is the point of the
              whole block — it proves the price is a boundary, not bait. */}
          <div
            data-enter
            className="enter mt-2 grid gap-px border-t border-black/15 bg-black/12 pt-px sm:grid-cols-3"
          >
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col bg-[#EDF0F3] px-5 py-6">
                <p
                  className="text-[0.56rem] tracking-[0.2em] text-black/50"
                  style={MONO}
                >
                  {pkg.name.toUpperCase()}
                </p>
                <p
                  className="mt-2 font-semibold"
                  style={{ fontSize: "clamp(1.5rem,2.4vw,2.1rem)", letterSpacing: "-0.02em", fontStretch: "112%" }}
                >
                  od {pkg.priceFrom}
                </p>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-black/65">
                  {pkg.audience}
                </p>
                <ul className="mt-4 flex flex-col gap-2 border-t border-black/12 pt-4 text-[0.76rem] leading-snug text-black/75">
                  {pkg.scope.map((line) => (
                    <li key={line} className="grid grid-cols-[0.7rem_1fr] gap-2">
                      <span aria-hidden="true" className="mt-[0.42em] h-px bg-black/35" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-black/12 pt-3 text-[0.72rem] text-black/50">
                  Čo v tom nie je: {pkg.notIncluded}.
                </p>
              </div>
            ))}
          </div>

          {/* conversational close (The1's question + pill) */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-6">
            <p className="text-[0.9rem] text-black/70">
              Uvedené sú východiskové ceny — presnú cenu poviete po konzultácii,
              nie až v zmluve.
            </p>
            <span className="flex items-center gap-3 text-[0.8rem] text-black/70">
              Koľko by stál ten váš?
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="rounded-full bg-[#17181d] px-5 py-2.5 text-[0.75rem] font-medium text-[#f2f4f6]"
              >
                Zistiť cenu
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------- /05 RESOLUTION --- */

function ActResolution({ world }: { world: boolean }) {
  return (
    <section
      data-zone="resolution"
      id="kontakt"
      className="relative flex min-h-svh flex-col overflow-hidden text-[#17181d]"
      style={world ? undefined : { background: "radial-gradient(70% 55% at 50% 38%, #FFFFFF 0%, #EDF0F3 62%, #E2E6EB 100%)" }}
    >
      {!world ? (
        // biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here.
        <img
          src="/brand/codera-mark.svg"
          alt=""
          className="pointer-events-none absolute top-1/2 left-1/2 w-[44vmin] -translate-x-1/2 -translate-y-[64%] opacity-80"
          style={{ filter: "drop-shadow(0 30px 70px rgba(0,0,0,0.5))" }}
        />
      ) : null}

      <div
        data-enter
        className="enter relative z-10 flex flex-1 flex-col items-center justify-end px-[clamp(1.25rem,4vw,3.5rem)] pt-[34svh] pb-[10svh] text-center lg:justify-center lg:pt-[46svh]"
      >
        <h2
          className="text-[clamp(1.6rem,7.6vw,4.9rem)] font-light lg:text-[clamp(2rem,4.9vw,5rem)]"
          style={{
            lineHeight: 1.02,
            letterSpacing: "-0.022em",
            /* the closing line crosses the bright C — a FROST halo now, the
               ground is risen light and ink needs lift, not shadow */
            textShadow: "0 1px 2px rgba(250,251,252,0.7), 0 10px 36px rgba(250,251,252,0.55)",
          }}
        >
          <span className="rise-wrap">
            <span className="rise">Váš ďalší web nemusí</span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.12s" }}>
              vyzerať ako všetky ostatné.
            </span>
          </span>
        </h2>
        <p className="mt-5 text-[0.95rem] text-[#17181d]/70">Vytvorme taký, ktorý si ľudia zapamätajú.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-6" id="dopyt">
          <span className="hidden text-[0.85rem] text-[#17181d]/60 md:block">Máte projekt v hlave?</span>
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="rounded-full bg-[#17181d] px-7 py-3.5 text-[0.9rem] font-medium text-[#fafbfc]"
          >
            Začať projekt
          </button>
          <a href="mailto:coderaslovakia@gmail.com" className="text-[0.8rem] text-[#17181d]/60 underline underline-offset-4">
            coderaslovakia@gmail.com
          </a>
        </div>
      </div>

      {/* What happens after the form — the biggest SMB friction is not the
          price, it is not knowing what they are starting
          (CODERA_STEP6_CONTENT.md §7). Three verifiable commitments. */}
      <div
        data-enter
        className="enter relative z-10 mx-auto mb-14 w-full max-w-[52rem] px-[clamp(1.25rem,4vw,3.5rem)]"
      >
        <p className="text-center text-[0.62rem] tracking-[0.28em] text-[#17181d]/50" style={MONO}>
          ČO BUDE NASLEDOVAŤ
        </p>
        <ol className="mt-5 grid gap-px overflow-hidden rounded-[8px] border border-black/12 bg-black/12 sm:grid-cols-3">
          {[
            ["01", "Do 24 hodín sa ozveme a spýtame sa na to, čo z formulára nevyplynulo."],
            ["02", "Do 72 hodín uvidíte prvý vizuálny návrh vašej stránky."],
            ["03", "Ak vás nezaujme, končíme — nič neplatíte a nič nepodpisujete."],
          ].map(([n, line]) => (
            <li key={n} className="bg-[#F6F8FA]/80 px-5 py-5 text-left">
              <span className="tnum text-[0.7rem] text-[#17181d]/40" style={MONO}>
                {n}
              </span>
              <p className="mt-2 text-[0.85rem] leading-[1.55] text-[#17181d]/80">{line}</p>
            </li>
          ))}
        </ol>
      </div>

      <EdgeLabel text="/05 — LIATIE" />
      <SlovakiaDotMap />

      <footer className="relative z-10 border-t border-black/15 px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-[0.62rem] text-[#17181d]/70">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="flex items-center gap-2">
            {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
            <img src="/brand/codera-mark-mono.svg" alt="" className="h-3.5 w-3.5 opacity-70" />
            <span className="tracking-[0.26em]">CODERA</span>
          </span>
          <span>
            <a href="tel:+421949753556">+421 949 753 556</a> ·{" "}
            <a href="mailto:coderaslovakia@gmail.com">coderaslovakia@gmail.com</a>
          </span>
          <span>
            <a href="#praca">Práca</a> · <a href="#sluzby">Služby</a> · <a href="#kontakt">Kontakt</a>
          </span>
          <span>© 2026 Codera</span>
        </div>
        <p className="mt-2 opacity-80">
          Meridián, Štatút a Vlna sú ukážkové koncepty — nejde o realizácie pre klientov.
        </p>
      </footer>
    </section>
  )
}

/* ------------------------------------------------------------ export ---- */

export function ExperienceActs({ world, probe = false }: { world: boolean; probe?: boolean }) {
  const probeRef = useStage(probe)
  return (
    <main
      id="hlavny-obsah"
      data-experience="v3"
      tabIndex={-1}
      className="relative z-10 outline-none"
      style={{ background: world ? "transparent" : undefined }}
    >
      {/* the journey hairline: real scroll state, worn at the top edge */}
      <div aria-hidden="true" className="journey-line" />
      <ActHero world={world} />
      {world ? <div data-zone="pass" aria-hidden="true" className="h-[60svh]" /> : null}
      <ActPremena />
      <ActWork world={world} />
      <ActOffer world={world} />
      <ActResolution world={world} />
      {probe ? (
        <div
          ref={probeRef}
          className="fixed right-2 bottom-2 z-50 rounded bg-black/80 px-2 py-1 font-mono text-[11px] text-lime-300"
        />
      ) : null}
    </main>
  )
}
