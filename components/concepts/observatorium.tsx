"use client"

/**
 * OBSERVATÓRIUM — the Animácie & 3D concept as a full site (Ukážka 3D
 * session, 2026-09-02; Ondrej's picks N1 + N2, realistic planets only).
 *
 * Real NASA photography (public domain) + a REAL WebGL Earth: the hero is
 * the free-flight astronaut over the blue horizon [N1], the heart of the
 * page is the Blue Marble globe [N2] — NASA texture, fresnel atmosphere,
 * spinning with the scroll and leaning to the pointer. Fraunces light
 * serif, ink-blue climate, mono flight data. Motion is scroll-scrubbed;
 * native scroll only; reduced motion reads a composed still. The
 * mechanic is BOOK-an-evening (seats genuinely count down).
 */

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { globeState } from "./observatorium-globe"
import { FR, fx, MONO, Shell } from "./shell"

const GlobeCanvas = dynamic(() => import("./observatorium-globe"), { ssr: false })

const SPACE = "#050608"
const PAPER = "#EAF0F6"
const BLUE = "#9DBBE6"

const IMG = "/demos/observatorium"

const PROGRAM = [
  ["20:00", "Otvorenie kupoly", "západ slnka z terasy, úvod do večernej oblohy"],
  ["20:30", "Ďalekohľad naživo", "Saturn, Jupiter a Mesiac — každý na vlastné oči"],
  ["21:30", "Nočná obloha voľným okom", "súhvezdia, ISS a padajúce hviezdy z leňošiek"],
] as const

export function ObservatoriumHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`ob-hero relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: SPACE, color: PAPER }}
    >
      {/* N1: the free-flight astronaut (NASA, STS-41-B, public domain) */}
      <div
        aria-hidden="true"
        className="ob-heroimg absolute inset-0 bg-cover"
        style={{ backgroundImage: `url(${IMG}/astronaut.jpg)`, backgroundPosition: "center 66%" }}
      />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,6,8,0.3) 0%, transparent 45%, rgba(5,6,8,0.55) 100%)" }} />

      <header className="relative z-10 flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-8 pb-4">
        <span style={{ ...FR, fontWeight: 500, fontSize: "1.35rem" }}>Observatórium</span>
        <nav className="hidden gap-7 text-[0.86rem] opacity-90 md:flex">
          {portal ? (
            <>
              <span>Program</span>
              <span>Kupola</span>
              <span>Návšteva</span>
            </>
          ) : (
            <>
              <a href="#zem" className="transition-opacity hover:opacity-100">Zem</a>
              <a href="#program" className="transition-opacity hover:opacity-100">Program</a>
              <a href="#navsteva" className="transition-opacity hover:opacity-100">Návšteva</a>
            </>
          )}
        </nav>
        <span className="rounded-full px-5 py-2.5 text-[0.82rem] font-semibold" style={{ background: PAPER, color: "#0A0D12" }}>
          Rezervovať večer
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-start px-[clamp(1.25rem,4vw,3.5rem)] pt-[6svh]">
        <h1
          className="wfx"
          style={{ ...FR, fontWeight: 380, fontSize: portal ? "4.6rem" : "clamp(3rem,8.8vw,8.2rem)", lineHeight: 1.02, letterSpacing: "-0.012em", ...fx(0) }}
        >
          Človek je malý.
          <br />
          <em style={{ fontStyle: "italic", color: BLUE }}>Výhľad obrovský.</em>
        </h1>
        <p className="wfx mt-6 max-w-[34rem] text-[1.1rem] leading-[1.55] text-[#EAF0F6]/90" style={fx(1)}>
          Scroll je zostup z orbity — od voľného letu cez oblačnosť až pod
          kupolu observatória.
        </p>
        <div className="wfx mt-8 flex flex-wrap items-center gap-4" style={fx(2)}>
          {portal ? (
            <span className="rounded-full px-8 py-4 text-[0.95rem] font-semibold" style={{ background: PAPER, color: "#0A0D12" }}>
              Večerný program
            </span>
          ) : (
            <>
              <a href="#program" className="rounded-full px-8 py-4 text-[0.95rem] font-semibold transition-transform hover:-translate-y-0.5" style={{ background: PAPER, color: "#0A0D12" }}>
                Večerný program
              </a>
              <a href="#navsteva" className="rounded-full border border-[#EAF0F6]/55 px-8 py-4 text-[0.95rem] backdrop-blur-[3px] transition-colors hover:border-[#EAF0F6]">
                Ako prebieha návšteva
              </a>
            </>
          )}
        </div>
      </div>

      <p className="relative z-10 px-[clamp(1.25rem,4vw,3.5rem)] pb-6 text-right text-[0.62rem] leading-[1.9] tracking-[0.12em] text-[#EAF0F6]/70" style={MONO}>
        VÝŠKA 402 KM · RÝCHLOSŤ 7,66 KM/S
        <br />
        FOTOGRAFIA: NASA, STS-41-B
      </p>
    </Shell>
  )
}

export default function ObservatoriumSite() {
  const [seats, setSeats] = useState(24)
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
        gsap.fromTo(
          ".ob-heroimg",
          { scale: 1.12, yPercent: 0 },
          { scale: 1, yPercent: -6, ease: "none", scrollTrigger: { trigger: ".ob-hero", start: "top top", end: "bottom top", scrub: true } }
        )
        /* the globe follows the scroll through its section */
        ScrollTrigger.create({
          trigger: "#zem",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            globeState.p = self.progress
          },
        })
        gsap.fromTo(
          ".ob-skyimg",
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: "#navsteva", start: "top bottom", end: "bottom top", scrub: true } }
        )
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  return (
    <main ref={rootRef} style={{ background: SPACE, color: PAPER }}>
      <ObservatoriumHero />

      {/* ---- N2: the real WebGL Earth ---- */}
      <Shell
        id="zem"
        className="ob-stars relative grid items-center gap-10 overflow-hidden px-[clamp(1.25rem,4vw,3.5rem)] py-[10svh] lg:grid-cols-[1fr_minmax(0,560px)]"
        style={{ background: "radial-gradient(90% 70% at 70% 40%, #0A111E 0%, #050608 65%)" }}
      >
        <div className="relative z-10 max-w-[36rem]">
          <h2 className="wfx" style={{ ...FR, fontWeight: 380, fontSize: "clamp(2.6rem,6vw,5.4rem)", lineHeight: 1.02, ...fx(0) }}>
            Odtiaľto je to <em style={{ fontStyle: "italic", color: BLUE }}>domov</em>.
          </h2>
          <p className="wfx mt-6 max-w-[30rem] text-[1.05rem] leading-[1.65] text-[#EAF0F6]/80" style={fx(1)}>
            Skutočná Zem so skutočnou textúrou NASA — otáča sa so scrollom a
            nakláňa za vaším kurzorom. Presne takto staviame priestor do
            webov: žiadne video, skutočný 3D objekt priamo v stránke.
          </p>
          <p className="wfx mt-6 text-[0.64rem] leading-[1.9] tracking-[0.12em] text-[#EAF0F6]/60" style={{ ...MONO, ...fx(2) }}>
            TEXTÚRA: NASA BLUE MARBLE · WEBGL NAŽIVO
            <br />
            SKÚSTE POHNÚŤ MYŠOU A SCROLLOVAŤ
          </p>
        </div>
        <div
          className="wfx relative z-10 h-[420px] w-full lg:h-[560px]"
          style={fx(1)}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            globeState.px = (e.clientX - r.left) / r.width - 0.5
            globeState.py = (e.clientY - r.top) / r.height - 0.5
          }}
          onPointerLeave={() => {
            globeState.px = 0
            globeState.py = 0
          }}
        >
          <GlobeCanvas />
        </div>
      </Shell>

      {/* ---- the evening programme + booking that counts ---- */}
      <Shell id="program" className="border-y border-[#EAF0F6]/12 px-[clamp(1.25rem,4vw,3.5rem)] py-[10svh]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="wfx" style={{ ...FR, fontWeight: 380, fontSize: "clamp(2.6rem,6vw,5.4rem)", lineHeight: 1, ...fx(0) }}>
            Večerný program
          </h2>
          <p className="wfx text-[0.68rem] tracking-[0.16em] text-[#EAF0F6]/65" style={{ ...MONO, ...fx(1) }}>
            DNES · JASNO · VIDITEĽNOSŤ 96 %
          </p>
        </div>
        <div className="mt-9 max-w-[58rem]">
          {PROGRAM.map(([t, name, desc], i) => (
            <div key={t} className="wfx flex flex-wrap items-baseline gap-5 border-b border-[#EAF0F6]/12 py-6" style={fx(i + 1)}>
              <span className="text-[0.9rem]" style={{ ...MONO, color: BLUE }}>
                {t}
              </span>
              <p className="min-w-[14rem]" style={{ ...FR, fontWeight: 500, fontSize: "1.7rem", lineHeight: 1.1 }}>
                {name}
              </p>
              <p className="flex-1 text-[0.95rem] leading-[1.55] text-[#EAF0F6]/70">{desc}</p>
            </div>
          ))}
        </div>
        <div className="wfx mt-8 flex flex-wrap items-center gap-5" style={fx(5)}>
          <button
            type="button"
            onClick={() => setSeats((s) => Math.max(0, s - 1))}
            disabled={seats === 0}
            className="rounded-full px-9 py-4 text-[0.95rem] font-semibold transition-transform enabled:hover:-translate-y-0.5 enabled:active:scale-95 disabled:opacity-40"
            style={{ background: seats === 0 ? "rgba(234,240,246,0.2)" : PAPER, color: seats === 0 ? PAPER : "#0A0D12" }}
          >
            {seats === 0 ? "Vypredané" : "Rezervovať večer · 12 €"}
          </button>
          <span className="text-[0.9rem] text-[#EAF0F6]/70">
            {seats === 0 ? "dnešný večer je plný — skúste piatok" : `voľných miest dnes: ${seats}`}
          </span>
        </div>
      </Shell>

      {/* ---- the dome, in records ---- */}
      <Shell id="kupola" className="grid gap-px bg-[#EAF0F6]/10 sm:grid-cols-3">
        {[
          ["8 m", "PRIEMER KUPOLY"],
          ["400×", "ZVÄČŠENIE ĎALEKOHĽADU"],
          ["1 250 m", "NADMORSKÁ VÝŠKA"],
        ].map(([v, l], i) => (
          <div key={l} className="wfx px-[clamp(1.25rem,4vw,3.5rem)] py-10" style={{ background: SPACE, ...fx(i) }}>
            <p className="tnum" style={{ ...FR, fontWeight: 380, fontSize: "3.2rem", lineHeight: 1 }}>
              {v}
            </p>
            <p className="mt-2 text-[0.62rem] tracking-[0.2em] text-[#EAF0F6]/55" style={MONO}>
              {l}
            </p>
          </div>
        ))}
      </Shell>

      {/* ---- close under the real sky ---- */}
      <Shell id="navsteva" className="relative overflow-hidden px-[clamp(1.25rem,4vw,3.5rem)] py-[14svh]">
        <div aria-hidden="true" className="ob-skyimg absolute inset-[-10%] bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/obloha.jpg)` }} />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,6,8,0.55) 0%, rgba(5,6,8,0.25) 50%, rgba(5,6,8,0.7) 100%)" }} />
        <div className="relative z-10 mx-auto max-w-[46rem] text-center">
          <h2 className="wfx" style={{ ...FR, fontWeight: 380, fontSize: "clamp(2.6rem,6vw,5.2rem)", lineHeight: 1.04, ...fx(0) }}>
            Nakoniec sa pozriete <em style={{ fontStyle: "italic", color: BLUE }}>vlastnými očami</em>.
          </h2>
          <p className="wfx mt-6 text-[1.05rem] leading-[1.6] text-[#EAF0F6]/85" style={fx(1)}>
            Večer končí na terase — bez skla, bez obrazovky. Len obloha, aká
            naozaj je.
          </p>
          <div className="wfx mt-8" style={fx(2)}>
            <a href="#program" className="rounded-full px-9 py-4 text-[0.95rem] font-semibold transition-transform hover:-translate-y-0.5" style={{ background: PAPER, color: "#0A0D12", display: "inline-block" }}>
              Rezervovať večer
            </a>
          </div>
        </div>
      </Shell>

      <footer className="flex flex-wrap items-baseline justify-between gap-3 border-t border-[#EAF0F6]/12 px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-[0.56rem] tracking-[0.14em] text-[#EAF0F6]/55" style={MONO}>
        <span>OBSERVATÓRIUM · VEČERNÉ PROGRAMY ZA JASNÉHO NEBA</span>
        <span>FOTOGRAFIE: NASA (PUBLIC DOMAIN)</span>
      </footer>
    </main>
  )
}
