"use client"

/**
 * OBSERVATÓRIUM — the Animácie & 3D concept as a full site (Iterácia 0.7,
 * Ondrej's brief 2026-09-02: the beautiful planet view, Saturn turns with
 * the scroll, the rings carry the copy in, then the planet retreats into
 * the background under a real page).
 *
 * References: zentry.com (a living 3D world between huge type),
 * kprverse.com (type layered before/behind the central figure — here the
 * VYŠŠIE line reads as sitting behind the planet), noomoagency.com (the
 * object woven through the headline). A REAL WebGL Saturn — Solar System
 * Scope textures (CC BY 4.0, from NASA/JPL Cassini data) — scrubbed by
 * ScrollTrigger through `saturnState`; R3F only renders. Native scroll,
 * no smoothing layer; reduced motion is a composed stacked layout. The
 * mechanic is BOOK-an-evening (each row's seats genuinely count down).
 */

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { saturnState } from "./observatorium-globe"
import { BRIC, FR, fx, KonceptLine, MONO, Shell } from "./shell"

const SaturnCanvas = dynamic(() => import("./observatorium-globe"), { ssr: false })

const SPACE = "#05070D"
const PAPER = "#EEF2F8"
const GOLD = "#D9B57C"
const COOL = "#8FC3FF"

const PAD = "px-[clamp(1.25rem,4vw,3.5rem)]"

const RING_LINES = [
  ["PRSTENCE — ĽAD A PRACH", "Šírka 282 000 km, hrúbka len pár metrov. Dnes ich máš v okulári."],
  ["SATURN V OPOZÍCII", "Najbližšie k Zemi za celý rok — 1,20 mld. km. Vidno aj Cassiniho delenie."],
  ["SOBOTA 21:30", "Kupola sa otvára o deviatej. Ďalekohľad 400 mm čaká na teba."],
] as const

const PROGRAM = [
  ["PIA · 21:00", "Saturn a jeho mesiace", "Titan a Rhea v okulári, prstence vo veľkom rozlíšení.", 6],
  ["SOB · 21:30", "Noc prstencov", "Saturn v opozícii — najlepší pohľad roka, komentuje astronóm.", 3],
  ["NED · 20:45", "Mesiac a planéty pre rodiny", "Krátery zblízka, Saturn na záver. Pre deti od 6 rokov.", 12],
] as const

function HeroStack({ portal }: { portal: boolean }) {
  const size = portal ? "6.2rem" : "clamp(4rem,11vw,10.2rem)"
  return (
    <div className="pointer-events-none relative z-10 pt-[10svh] text-center">
      <h1 style={{ ...BRIC, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.015em", textTransform: "uppercase" }}>
        <span className="wfx block" style={fx(0)}>
          Pozri sa
        </span>
        <span
          aria-hidden="true"
          className="wfx block"
          style={{ ...fx(1), color: "transparent", WebkitTextStroke: "1.5px rgba(238,242,248,0.75)" }}
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
            className="rounded-full border border-[#EEF2F8]/30 px-5 py-2.5 text-[0.62rem] tracking-[0.2em] transition-colors hover:border-[#EEF2F8]"
            style={MONO}
          >
            PROGRAM
          </a>
        )}
      </header>

      <HeroStack portal={portal} />

      <div className="relative z-10 mt-auto flex flex-col items-center gap-6 pb-[5svh]">
        <p className="wfx max-w-[34rem] px-6 text-center text-[1.08rem] leading-[1.55] text-[#EEF2F8]/80" style={fx(3)}>
          Saturn je práve nad kupolou. Scrolluj — planéta sa otočí a prstence
          ti prinesú program noci.
        </p>
        {portal ? (
          <span className="wfx rounded-full px-8 py-4 text-[0.85rem] font-bold tracking-[0.12em]" style={{ ...fx(4), background: PAPER, color: SPACE }}>
            POZRI PROGRAM ↓
          </span>
        ) : (
          <a
            href="#program"
            className="wfx rounded-full px-8 py-4 text-[0.85rem] font-bold tracking-[0.12em] transition-transform hover:-translate-y-0.5"
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
        /* phase A: the hero exit turns the planet */
        ScrollTrigger.create({
          trigger: ".ob-hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            saturnState.a = self.progress
          },
        })
        /* phase B: the sticky ring passage */
        ScrollTrigger.create({
          trigger: "#prstence",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            saturnState.b = self.progress
          },
        })
        /* phase C: the planet retreats under the programme */
        ScrollTrigger.create({
          trigger: "#program",
          start: "top bottom",
          end: "top 15%",
          scrub: true,
          onUpdate: (self) => {
            saturnState.c = self.progress
          },
        })
        /* the rings carry the copy in — one scrubbed timeline, line by line */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "#prstence", start: "top top", end: "bottom bottom", scrub: true },
        })
        gsap.utils.toArray<HTMLElement>(".ob-line").forEach((el, i, all) => {
          const dir = i % 2 ? -1 : 1
          tl.fromTo(
            el,
            { xPercent: -50, x: () => dir * window.innerWidth * 0.55, rotation: dir * 9, opacity: 0 },
            { xPercent: -50, x: 0, rotation: 0, opacity: 1, duration: 0.24, ease: "power2.out" },
            i * 0.36
          )
          if (i < all.length - 1) {
            tl.to(
              el,
              { x: () => -dir * window.innerWidth * 0.18, rotation: dir * -4, opacity: 0, duration: 0.1, ease: "power1.in" },
              i * 0.36 + 0.28
            )
          }
        })
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
      saturnState.a = 0
      saturnState.b = 0
      saturnState.c = 0
    }
  }, [])

  return (
    <main
      ref={rootRef}
      style={{ background: SPACE, color: PAPER }}
      onPointerMove={(e) => {
        saturnState.px = e.clientX / window.innerWidth - 0.5
        saturnState.py = e.clientY / window.innerHeight - 0.5
      }}
      onPointerLeave={() => {
        saturnState.px = 0
        saturnState.py = 0
      }}
    >
      {/* the sky is one fixed scene; the page scrolls over it */}
      <div aria-hidden="true" className="fixed inset-0 z-0">
        <SaturnCanvas />
      </div>

      <ObservatoriumHero />

      {/* ---- the rings bring the copy in ---- */}
      <section id="prstence" className="ob-ringsec relative z-10 h-[260vh]">
        <div className="ob-ringhold sticky top-0 h-svh overflow-hidden">
          {RING_LINES.map(([tag, line]) => (
            <div key={tag} className="ob-line absolute top-[33vh] left-1/2 w-[min(760px,90vw)] text-center">
              <p className="mb-3 text-[0.6rem] tracking-[0.26em]" style={{ ...MONO, color: GOLD }}>
                {tag}
              </p>
              <p style={{ ...FR, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.7rem,3.4vw,3.1rem)", lineHeight: 1.22 }}>
                {line}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- the evening programme: bookings that genuinely count ---- */}
      <Shell id="program" className={`relative z-10 ${PAD} py-[14svh]`}>
        <h2 className="wfx text-[0.72rem] tracking-[0.3em] text-[#EEF2F8]/50" style={{ ...MONO, ...fx(0) }}>
          PROGRAM — POZOROVACIE VEČERY
        </h2>
        <div className="mt-10 flex max-w-[72rem] flex-col gap-3.5">
          {PROGRAM.map(([d, name, desc], i) => (
            <div
              key={d}
              className="wfx grid items-center gap-x-7 gap-y-3 rounded-2xl border border-[#EEF2F8]/12 px-7 py-6 backdrop-blur-[6px] md:grid-cols-[7.5rem_1fr_auto_auto]"
              style={{ ...fx(i + 1), background: "rgba(11,16,29,0.82)" }}
            >
              <span className="text-[0.72rem] tracking-[0.18em]" style={{ ...MONO, color: COOL }}>
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
          <div key={l} className={`wfx ${PAD} py-10`} style={{ background: SPACE, ...fx(i) }}>
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
      <Shell className={`relative z-10 ${PAD} py-[16svh]`}>
        <h2
          className="wfx max-w-[64rem]"
          style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.6rem,7vw,6.2rem)", lineHeight: 1.04, letterSpacing: "-0.01em", textTransform: "uppercase", ...fx(0) }}
        >
          <span style={{ color: "rgba(238,242,248,0.25)" }}>Vesmír sa nedá stiahnuť.</span>
          <br />
          Dá sa{" "}
          <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, textTransform: "none", color: GOLD }}>zažiť.</em>
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
        <span>TEXTÚRY: SOLAR SYSTEM SCOPE (CC BY 4.0), NASA/JPL DATA</span><KonceptLine />
      </footer>
    </main>
  )
}
