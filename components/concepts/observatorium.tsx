"use client"

/**
 * OBSERVATÓRIUM — the Animácie & 3D concept as a full site (Iterácia 1.0,
 * Ondrej's brief 2026-09-04: full 5D wow — zoom in and out, transitions
 * through space, a dynamic planet surface, vivid saturated colour; the
 * Higgsfield ring-dive video as the guide).
 *
 * The page is a flight: a 900vh journey over one fixed WebGL scene
 * (`observatorium-globe.tsx`) whose camera rides a spline scrubbed by
 * ScrollTrigger through `journeyState`. Copy chapters ride in and out on
 * the same scrub. After the flight the planet rests under a real page —
 * the bookable programme, the dome records, the close. References:
 * zentry.com (a living 3D world between huge type), kprverse.com (type
 * layered before/behind the central figure), noomoagency.com. Native
 * scroll, no smoothing layer; reduced motion is a stacked layout with the
 * hero frame held. Mechanic: BOOK-an-evening (seats genuinely count down).
 */

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { journeyState } from "./observatorium-globe"
import { BRIC, FR, fx, KonceptLine, MONO, Shell } from "./shell"

const SaturnCanvas = dynamic(() => import("./observatorium-globe"), { ssr: false })

const SPACE = "#04050C"
const PAPER = "#EEF2F8"
const GOLD = "#F2C46B"
const PINK = "#FF5EC4"
const CYAN = "#57E6FF"

const PAD = "px-[clamp(1.25rem,4vw,3.5rem)]"

/* [in-start, in-end, out-start, out-end] on the journey's 0..1 */
const CHAPTERS = [
  { tag: "01 — PRSTENCE", color: GOLD, side: "left", k: [0.14, 0.2, 0.27, 0.31], line: "Široké 282 000 km, hrubé len pár metrov. Z diaľky celistvý disk." },
  { tag: "02 — VNÚTRI PRSTENCA", color: CYAN, side: "right", k: [0.36, 0.42, 0.5, 0.55], line: "Zblízka milióny kúskov ľadu a kameňa. Teraz letíš pomedzi ne." },
  { tag: "03 — ATMOSFÉRA", color: PINK, side: "left", k: [0.6, 0.66, 0.74, 0.79], line: "Búrky väčšie ako Zem, vietor 1 800 km/h. Povrch, ktorý nikdy nestojí." },
  { tag: "SOBOTA 21:30", color: GOLD, side: "low", k: [0.84, 0.89, 0.96, 1.0], line: "Toto všetko uvidíš v okulári. Kupola sa otvára o deviatej." },
] as const

const PROGRAM = [
  ["PIA · 21:00", "Saturn a jeho mesiace", "Titan a Rhea v okulári, prstence vo veľkom rozlíšení.", 6],
  ["SOB · 21:30", "Noc prstencov", "Saturn v opozícii — najlepší pohľad roka, komentuje astronóm.", 3],
  ["NED · 20:45", "Mesiac a planéty pre rodiny", "Krátery zblízka, Saturn na záver. Pre deti od 6 rokov.", 12],
] as const

function HeroStack({ portal }: { portal: boolean }) {
  const size = portal ? "6.2rem" : "clamp(4rem,11vw,10.2rem)"
  return (
    <div className="ob-stack pointer-events-none relative z-10 mx-auto w-fit px-[clamp(1.5rem,5vw,4rem)] pt-[9svh] pb-4 text-center">
      <h1 style={{ ...BRIC, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.015em", textTransform: "uppercase" }}>
        <span className="wfx block" style={fx(0)}>
          Pozri sa
        </span>
        <span
          aria-hidden="true"
          className="wfx block"
          style={{ ...fx(1), color: "transparent", WebkitTextStroke: "2px rgba(238,242,248,0.9)", filter: "drop-shadow(0 0 18px rgba(242,196,107,0.35))" }}
        >
          vyššie
        </span>
        <span className="sr-only">vyššie</span>
        <span className="wfx block" style={fx(2)}>
          <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, textTransform: "none", letterSpacing: 0, color: GOLD }}>
            dnes v noci.
          </em>
        </span>
      </h1>
    </div>
  )
}

export function ObservatoriumHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`ob-hero relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: portal ? SPACE : "transparent", color: PAPER }}
    >
      {portal ? (
        /* the homepage act carries a pre-rendered still — no canvas in the portal */
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/demos/observatorium/saturn-hero.jpg)" }}
        />
      ) : null}

      <header className={`relative z-10 flex items-center justify-between ${PAD} pt-7 pb-3`}>
        <span style={{ ...BRIC, fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.08em" }}>OBSERVATÓRIUM</span>
        <span className="hidden text-[0.62rem] tracking-[0.22em] opacity-60 md:block" style={MONO}>
          MESTSKÁ HVIEZDÁREŇ — KUPOLA 12 M
        </span>
        {portal ? (
          <span className="rounded-full border border-[#EEF2F8]/30 px-5 py-2.5 text-[0.62rem] tracking-[0.2em]" style={MONO}>
            PROGRAM
          </span>
        ) : (
          <a
            href="#program"
            className="pointer-events-auto rounded-full border border-[#EEF2F8]/30 px-5 py-2.5 text-[0.62rem] tracking-[0.2em] transition-colors hover:border-[#EEF2F8]"
            style={MONO}
          >
            PROGRAM
          </a>
        )}
      </header>

      <HeroStack portal={portal} />

      <div className="relative z-10 mt-auto flex flex-col items-center gap-6 pb-[6svh]">
        <p className="wfx max-w-[34rem] px-6 text-center text-[1.08rem] leading-[1.55] text-[#EEF2F8]/80" style={fx(3)}>
          Saturn je práve nad kupolou. Scrolluj — kamera ťa vezme až medzi
          kamienky jeho prstencov.
        </p>
        {portal ? (
          <span className="wfx rounded-full px-8 py-4 text-[0.85rem] font-bold tracking-[0.12em]" style={{ ...fx(4), background: PAPER, color: SPACE }}>
            POZRI PROGRAM ↓
          </span>
        ) : (
          <a
            href="#program"
            className="wfx pointer-events-auto rounded-full px-8 py-4 text-[0.85rem] font-bold tracking-[0.12em] transition-transform hover:-translate-y-0.5"
            style={{ ...fx(4), background: PAPER, color: SPACE }}
          >
            POZRI PROGRAM ↓
          </a>
        )}
      </div>
    </Shell>
  )
}

export default function ObservatoriumSite() {
  const [seats, setSeats] = useState<number[]>(PROGRAM.map(([, , , s]) => s))
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    let ctx: { revert: () => void } | undefined
    let alive = true
    ;(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])
      if (!alive) {
        return
      }
      gsap.registerPlugin(ScrollTrigger)
      ctx = gsap.context(() => {
        /* the flight: one progress value, the scene does the rest */
        ScrollTrigger.create({
          trigger: ".ob-journey",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            journeyState.p = self.progress
          },
        })
        /* the copy rides the same scrub: hero out, chapters in and out, the progress line */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".ob-journey", start: "top top", end: "bottom bottom", scrub: true },
        })
        tl.to(".ob-heroFix", { opacity: 0, duration: 0.08, ease: "none" }, 0.02)
        tl.fromTo(".ob-prog", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "none" }, 0)
        tl.to(".ob-progWrap", { opacity: 0, duration: 0.04, ease: "none" }, 0.96)
        gsap.utils.toArray<HTMLElement>(".ob-chap").forEach((el) => {
          const [a, b, c, d] = (el.dataset.k ?? "").split(",").map(Number)
          const dir = el.dataset.side === "right" ? 30 : el.dataset.side === "left" ? -30 : 0
          const dy = el.dataset.side === "low" ? 24 : 0
          tl.fromTo(el, { opacity: 0, x: dir, y: dy }, { opacity: 1, x: 0, y: 0, duration: b - a, ease: "power2.out" }, a)
          tl.to(el, { opacity: 0, duration: d - c, ease: "power1.in" }, c)
        })
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
      journeyState.p = 0
    }
  }, [])

  return (
    <main
      ref={rootRef}
      style={{ background: SPACE, color: PAPER }}
      onPointerMove={(e) => {
        journeyState.px = e.clientX / window.innerWidth - 0.5
        journeyState.py = e.clientY / window.innerHeight - 0.5
      }}
      onPointerLeave={() => {
        journeyState.px = 0
        journeyState.py = 0
      }}
    >
      {/* one fixed scene; the page flies over it */}
      <div aria-hidden="true" className="fixed inset-0 z-0">
        <SaturnCanvas />
      </div>
      {/* a quiet vignette so copy always sits on something calm */}
      <div aria-hidden="true" className="ob-veil fixed inset-0 z-[1]" />

      {/* ---- the flight ---- */}
      <div className="ob-journey relative z-10 h-[900vh]">
        <div className="ob-heroFix pointer-events-none fixed inset-0">
          <ObservatoriumHero />
        </div>
        {CHAPTERS.map((c) => (
          <div
            key={c.tag}
            className={`ob-chap ob-chap-${c.side} pointer-events-none fixed z-10 rounded-2xl px-7 py-6`}
            data-k={c.k.join(",")}
            data-side={c.side}
          >
            <p className="mb-4 text-[0.62rem] tracking-[0.28em]" style={{ ...MONO, color: c.color }}>
              {c.tag}
            </p>
            <p style={{ ...FR, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.9rem,3.8vw,3.4rem)", lineHeight: 1.18 }}>{c.line}</p>
          </div>
        ))}
        <div aria-hidden="true" className="ob-progWrap fixed bottom-[4.5vh] left-1/2 z-10 h-[2px] w-[180px] -translate-x-1/2 bg-[#EEF2F8]/18">
          <div className="ob-prog h-full w-full origin-left" style={{ background: GOLD }} />
        </div>
      </div>

      {/* ---- the evening programme: bookings that genuinely count ---- */}
      <Shell id="program" className={`relative z-10 ${PAD} py-[14svh]`}>
        <h2 className="wfx text-[0.72rem] tracking-[0.3em] text-[#EEF2F8]/50" style={{ ...MONO, ...fx(0) }}>
          PROGRAM — POZOROVACIE VEČERY
        </h2>
        <div className="mt-10 flex max-w-[72rem] flex-col gap-3.5">
          {PROGRAM.map(([d, name, desc], i) => (
            <div
              key={d}
              className="wfx grid items-center gap-x-7 gap-y-3 rounded-2xl border border-[#EEF2F8]/12 px-7 py-6 backdrop-blur-[8px] md:grid-cols-[7.5rem_1fr_auto_auto]"
              style={{ ...fx(i + 1), background: "rgba(8,10,22,0.8)" }}
            >
              <span className="text-[0.72rem] tracking-[0.18em]" style={{ ...MONO, color: CYAN }}>
                {d}
              </span>
              <div>
                <p style={{ ...BRIC, fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.15 }}>{name}</p>
                <p className="mt-1.5 text-[0.9rem] leading-[1.5] text-[#EEF2F8]/60">{desc}</p>
              </div>
              <span className="tnum min-w-[6rem] text-[0.66rem] tracking-[0.16em] text-[#EEF2F8]/60 md:text-right" style={MONO}>
                {seats[i] === 0 ? "PLNÉ" : `${seats[i]} ${seats[i] === 1 ? "MIESTO" : seats[i] < 5 ? "MIESTA" : "MIEST"}`}
              </span>
              <button
                type="button"
                disabled={seats[i] === 0}
                onClick={() => setSeats((all) => all.map((n, j) => (j === i ? Math.max(0, n - 1) : n)))}
                className="rounded-full px-6 py-3.5 text-[0.72rem] font-bold tracking-[0.14em] transition-transform enabled:hover:-translate-y-0.5 enabled:active:scale-95 disabled:opacity-45"
                style={{ background: seats[i] === 0 ? "rgba(238,242,248,0.18)" : PAPER, color: seats[i] === 0 ? PAPER : SPACE }}
              >
                {seats[i] === 0 ? "OBSADENÉ" : "REZERVOVAŤ"}
              </button>
            </div>
          ))}
        </div>
      </Shell>

      {/* ---- the dome, in records ---- */}
      <Shell className="relative z-10 grid gap-px bg-[#EEF2F8]/10 sm:grid-cols-3">
        {[
          ["12 m", "PRIEMER KUPOLY"],
          ["400 mm", "PRIEMER ZRKADLA"],
          ["96 %", "VIDITEĽNOSŤ DNES"],
        ].map(([v, l], i) => (
          <div key={l} className={`wfx ${PAD} py-10`} style={{ background: "rgba(4,5,12,0.82)", ...fx(i) }}>
            <p className="tnum" style={{ ...BRIC, fontWeight: 800, fontSize: "3rem", lineHeight: 1 }}>
              {v}
            </p>
            <p className="mt-2 text-[0.6rem] tracking-[0.2em] text-[#EEF2F8]/55" style={MONO}>
              {l}
            </p>
          </div>
        ))}
      </Shell>

      {/* ---- close ---- */}
      <Shell className={`ob-close relative z-10 ${PAD} py-[16svh]`}>
        <h2
          className="wfx max-w-[64rem]"
          style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.6rem,7vw,6.2rem)", lineHeight: 1.04, letterSpacing: "-0.01em", textTransform: "uppercase", ...fx(0) }}
        >
          <span style={{ color: "rgba(238,242,248,0.55)" }}>Vesmír sa nedá stiahnuť.</span>
          <br />
          Dá sa{" "}
          <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, textTransform: "none", color: PINK }}>zažiť.</em>
        </h2>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-9">
          <p className="wfx max-w-[27rem] text-[0.95rem] leading-[1.6] text-[#EEF2F8]/60" style={fx(1)}>
            Jedna kupola, jeden ďalekohľad a obloha, ktorá sa nikdy neopakuje.
            Planéta nad tebou je živý render — v kupole ťa čaká naozajstná.
          </p>
          <a
            href="#program"
            className="wfx rounded-full px-8 py-4 text-[0.85rem] font-bold tracking-[0.12em] transition-transform hover:-translate-y-0.5"
            style={{ ...fx(2), background: PAPER, color: SPACE }}
          >
            REZERVOVAŤ VEČER
          </a>
        </div>
      </Shell>

      <footer
        className={`relative z-10 flex flex-wrap items-baseline justify-between gap-3 border-t border-[#EEF2F8]/12 ${PAD} py-5 text-[0.56rem] tracking-[0.14em] text-[#EEF2F8]/55`}
        style={MONO}
      >
        <span>OBSERVATÓRIUM · VEČERNÉ PROGRAMY ZA JASNÉHO NEBA</span>
        <span>TEXTÚRY: GENEROVANÉ PRE TENTO KONCEPT (HIGGSFIELD)</span>
        <KonceptLine />
      </footer>
    </main>
  )
}
