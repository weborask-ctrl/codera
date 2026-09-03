"use client"

/**
 * VLNA — the movement studio as a full site (AD v3 amendment 2; redesigned
 * in the Ukážka 03 session, 2026-09-02).
 *
 * Black-and-white energy with neon booking [y7 R3 + othership R1, Ondrej's
 * combo]: b&w movement photography under a huge Bricolage headline with a
 * hand-drawn citrus scribble BEHIND the key word, lime/pink pill CTAs, and
 * the schedule as the hero graphic — with WORKING reservations: every
 * lesson row books, capacity counts down, full is full. Motion is
 * scroll-scrubbed Ken Burns plus the self-drawing scribble; native scroll
 * only; reduced motion reads a composed still. The mechanic is BOOK.
 *
 * Photos: Unsplash licence, stored locally under /demos/studio/.
 */

import { useEffect, useRef, useState } from "react"
import { BRIC, fx, KonceptLine, MONO, Shell } from "./shell"

const BLACK = "#0E0F10"
const PAPER = "#F4F6F2"
const LIME = "#D8F34E"
const PINK = "#FF7AB6"

const IMG = "/demos/studio"

interface Lesson {
  time: string
  name: string
  coach: string
  spots: number
}

const WEEK: Record<string, Lesson[]> = {
  "DNES · ŠTVRTOK": [
    { time: "07:00", name: "Mobilita", coach: "Marek", spots: 4 },
    { time: "09:30", name: "Pilates", coach: "Nina", spots: 2 },
    { time: "17:15", name: "Joga flow", coach: "Alica", spots: 8 },
    { time: "19:00", name: "Dych a regenerácia", coach: "Ema", spots: 1 },
  ],
  PIATOK: [
    { time: "07:00", name: "Sila v pomalosti", coach: "Tomáš", spots: 6 },
    { time: "12:00", name: "Obedová mobilita", coach: "Marek", spots: 5 },
    { time: "17:15", name: "Pilates", coach: "Nina", spots: 0 },
    { time: "18:45", name: "Joga flow", coach: "Zoja", spots: 3 },
  ],
  SOBOTA: [
    { time: "09:00", name: "Dlhý flow", coach: "Alica", spots: 7 },
    { time: "11:00", name: "Dych a ľad", coach: "Jakub", spots: 2 },
  ],
} as const

/* portraits: studio renders supplied by Ondrej (2026-09-03) — fictional
   people for a fictional studio, in the demo's b&w climate */
const COACHES = [
  ["Alica", "joga · flow", "alica"],
  ["Marek", "mobilita", "marek"],
  ["Nina", "pilates", "nina"],
  ["Ema", "dych · regenerácia", "ema"],
  ["Tomáš", "sila", "tomas"],
  ["Zoja", "flow", "zoja"],
  ["Jakub", "dych · ľad", "jakub"],
  ["Lea", "balans", "lea"],
  ["Peter", "mobilita", "peter"],
] as const

/* the capacity pill: honest occupancy, colour-coded */
function SpotPill({ spots }: { spots: number }) {
  if (spots === 0) {
    return (
      <span className="rounded-full px-3 py-1.5 text-[0.66rem] font-bold" style={{ background: "rgba(244,246,242,0.16)", color: "rgba(244,246,242,0.6)" }}>
        OBSADENÉ
      </span>
    )
  }
  if (spots >= 5) {
    return (
      <span className="rounded-full border border-[#F4F6F2]/50 px-3 py-1.5 text-[0.66rem] font-bold">
        VOĽNÉ
      </span>
    )
  }
  return (
    <span className="rounded-full px-3 py-1.5 text-[0.66rem] font-bold" style={{ background: spots >= 3 ? LIME : PINK, color: BLACK }}>
      {spots} {spots === 1 ? "MIESTO" : "MIESTA"}
    </span>
  )
}

/* the hand-drawn citrus scribble — BEHIND the word (Ondrej), drawing
   itself on load via dash-offset (see .st-scribble in globals) */
function Scribble({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <svg aria-hidden="true" viewBox="0 0 120 60" fill="none" preserveAspectRatio="none" className="pointer-events-none absolute top-[-12%] left-[-4%] z-0 h-[124%] w-[108%]">
        <path
          className="st-scribble"
          d="M8 32 C 20 8, 100 4, 112 24 C 118 38, 84 56, 40 52 C 16 50, 4 44, 8 32 Z"
          stroke={LIME}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
        />
      </svg>
      <span className="relative z-[1]">{children}</span>
    </span>
  )
}

export function VlnaHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`st-hero relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: BLACK, color: PAPER }}
    >
      <div
        aria-hidden="true"
        className="st-heroimg absolute inset-0 bg-cover bg-[center_30%]"
        style={{ backgroundImage: `url(${IMG}/hero.jpg)`, filter: "grayscale(1) contrast(1.15) brightness(0.55)" }}
      />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,11,12,0.55) 0%, rgba(10,11,12,0.15) 45%, rgba(10,11,12,0.7) 100%)" }} />

      <header className="relative z-10 flex items-center justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-6 pb-4">
        <span style={{ ...BRIC, fontWeight: 800, fontSize: "1.65rem", letterSpacing: "0.02em" }}>ŠTÚDIO</span>
        <nav className="hidden gap-6 text-[0.95rem] font-bold md:flex">
          {portal ? <span>Rozvrh</span> : <a href="#rozvrh" className="border-b-2 border-transparent pb-0.5 transition-colors hover:border-current">Rozvrh</a>}
          {portal ? <span>Lektori</span> : <a href="#lektori" className="border-b-2 border-transparent pb-0.5 transition-colors hover:border-current">Lektori</a>}
          {portal ? <span>Členstvo</span> : <a href="#clenstvo" className="border-b-2 border-transparent pb-0.5 transition-colors hover:border-current">Členstvo</a>}
        </nav>
        <span className="rounded-full px-6 py-3 text-[0.92rem] font-bold" style={{ background: LIME, color: BLACK }}>
          REZERVOVAŤ
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-end gap-8 px-[clamp(1.25rem,4vw,3.5rem)] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[46rem]">
          <h1
            className="wfx uppercase"
            style={{ ...BRIC, fontWeight: 800, fontSize: portal ? "4rem" : "clamp(3.2rem,9.6vw,9.2rem)", lineHeight: 0.92, letterSpacing: "-0.025em", ...fx(0) }}
          >
            Začnite
            <br />
            <span style={{ whiteSpace: "nowrap" }}>
              vo <Scribble>štvrtok</Scribble>.
            </span>
          </h1>
          <p className="wfx mt-6 max-w-[40rem] text-[1.28rem] leading-[1.5] text-[#F4F6F2]/90" style={fx(1)}>
            Žiadne PDF, žiadne písanie do správ. Vyberiete lekciu, vidíte
            voľné miesta, zaplatíte — celé to trvá menej než minútu.
          </p>
          <div className="wfx mt-7 flex flex-wrap items-center gap-3.5" style={fx(2)}>
            {portal ? (
              <span className="rounded-full px-8 py-4 text-[1rem] font-bold" style={{ background: LIME, color: BLACK }}>
                Rezervovať lekciu
              </span>
            ) : (
              <>
                <a href="#rozvrh" className="rounded-full px-10 py-5 text-[1.15rem] font-bold transition-transform hover:-translate-y-0.5" style={{ background: LIME, color: BLACK }}>
                  Rezervovať lekciu
                </a>
                <a href="#clenstvo" className="rounded-full px-10 py-5 text-[1.15rem] font-bold transition-transform hover:-translate-y-0.5" style={{ background: PINK, color: BLACK }}>
                  Prvá lekcia 6 €
                </a>
              </>
            )}
          </div>
        </div>

        {/* today, right on the first screen — the schedule IS the hero */}
        <div className="wfx w-full max-w-[470px] rounded-[18px] border border-[#F4F6F2]/18 p-6 backdrop-blur-[10px]" style={{ background: "rgba(14,15,16,0.72)", ...fx(2) }}>
          <p className="text-[1.05rem] font-bold" style={{ ...BRIC, color: LIME }}>
            Dnes · štvrtok
          </p>
          <div>
            {WEEK["DNES · ŠTVRTOK"].map((l) => (
              <div key={l.time} className="flex items-center justify-between gap-3 border-b border-[#F4F6F2]/12 py-3.5 last:border-b-0">
                <span className="text-[0.95rem]" style={{ ...MONO, color: LIME }}>
                  {l.time}
                </span>
                <span className="flex-1 text-[1.1rem] font-semibold">{l.name}</span>
                <SpotPill spots={l.spots} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}

export default function VlnaSite() {
  const [day, setDay] = useState<keyof typeof WEEK>("DNES · ŠTVRTOK")
  const [booked, setBooked] = useState<Record<string, number>>({})
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
          ".st-heroimg",
          { scale: 1.14, yPercent: 0 },
          { scale: 1, yPercent: -5, ease: "none", scrollTrigger: { trigger: ".st-hero", start: "top top", end: "bottom top", scrub: true } }
        )
        gsap.fromTo(
          ".st-closeimg",
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: "#st-zaver", start: "top bottom", end: "bottom top", scrub: true } }
        )
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  const book = (dayKey: string, l: Lesson) => {
    const key = `${dayKey}-${l.time}`
    setBooked((b) => {
      const used = b[key] ?? 0
      if (l.spots - used <= 0) {
        return b
      }
      return { ...b, [key]: used + 1 }
    })
  }

  return (
    <main ref={rootRef} style={{ background: BLACK, color: PAPER }}>
      <VlnaHero />

      {/* ---- the full week — every row books, capacity counts down ---- */}
      <Shell id="rozvrh" className="px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh]">
        <h2 className="wfx uppercase" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,5.6vw,4.8rem)", letterSpacing: "-0.02em", ...fx(0) }}>
          Rozvrh
        </h2>
        <div className="wfx mt-7 flex flex-wrap gap-2.5" style={fx(1)}>
          {(Object.keys(WEEK) as (keyof typeof WEEK)[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className="rounded-full px-5 py-2.5 text-[0.8rem] font-bold transition-colors"
              style={day === d ? { background: LIME, color: BLACK } : { background: "rgba(244,246,242,0.1)", color: PAPER }}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-6 max-w-[56rem]">
          {WEEK[day].map((l, i) => {
            const left = l.spots - (booked[`${day}-${l.time}`] ?? 0)
            return (
              <div key={`${day}-${l.time}`} className="wfx flex flex-wrap items-center justify-between gap-4 border-b border-[#F4F6F2]/12 py-5" style={fx(i + 2)}>
                <span className="text-[0.9rem]" style={{ ...MONO, color: LIME }}>
                  {l.time}
                </span>
                <div className="min-w-[12rem] flex-1">
                  <p className="text-[1.3rem] font-bold" style={BRIC}>
                    {l.name}
                  </p>
                  <p className="text-[0.8rem] text-[#F4F6F2]/60">{l.coach}</p>
                </div>
                <SpotPill spots={left} />
                <button
                  type="button"
                  onClick={() => book(day, l)}
                  disabled={left === 0}
                  className="rounded-full px-6 py-3 text-[0.85rem] font-bold transition-transform enabled:hover:-translate-y-0.5 enabled:active:scale-95 disabled:opacity-40"
                  style={{ background: left === 0 ? "rgba(244,246,242,0.15)" : PAPER, color: left === 0 ? PAPER : BLACK }}
                >
                  {left === 0 ? "Plné" : "Rezervovať"}
                </button>
              </div>
            )
          })}
        </div>
        <p className="wfx mt-4 text-[0.8rem] text-[#F4F6F2]/55" style={fx(6)}>
          Rezervácia v deme reálne uberá miesta — vyskúšajte si to. Zrušenie
          zdarma do 12 h pred lekciou.
        </p>
      </Shell>

      {/* ---- coaches ---- */}
      <Shell id="lektori" className="border-y border-[#F4F6F2]/12 px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh]" style={{ background: "#131415" }}>
        <h2 className="wfx uppercase" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,5.6vw,4.8rem)", letterSpacing: "-0.02em", ...fx(0) }}>
          9 lektorov
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {COACHES.map(([name, focus, img], i) => (
            <div
              key={name}
              className="wfx group overflow-hidden rounded-2xl border border-[#F4F6F2]/15 transition-colors hover:border-[#D8F34E]"
              style={fx((i % 5) + 1)}
            >
              <div className="overflow-hidden">
                {/* biome-ignore lint/performance/noImgElement: demo asset, fixed size, below the fold */}
                <img
                  src={`${IMG}/lektori/${img}.jpg`}
                  alt={`${name} — ${focus}`}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-all duration-500 group-hover:scale-[1.04]"
                  style={{ filter: "grayscale(1) contrast(1.08)" }}
                />
              </div>
              <div className="flex items-baseline justify-between gap-2 px-4 py-3.5">
                <span className="text-[1.15rem] font-bold transition-colors group-hover:text-[#D8F34E]" style={BRIC}>
                  {name}
                </span>
                <span className="text-[0.62rem] tracking-[0.08em] text-[#F4F6F2]/55" style={MONO}>
                  {focus.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Shell>

      {/* ---- membership: three tiers, single entry first ---- */}
      <Shell id="clenstvo" className="px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh]">
        <h2 className="wfx uppercase" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,5.6vw,4.8rem)", letterSpacing: "-0.02em", ...fx(0) }}>
          Členstvo
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Jednorazový vstup", "9 €", "prídete, zacvičíte, odídete", false],
            ["10 vstupov", "79 €", "platnosť 3 mesiace · prenosné", true],
            ["Mesiac neobmedzene", "59 €", "všetky lekcie · pauza kedykoľvek", false],
          ].map(([t, p, s, hot], i) => (
            <div
              key={t as string}
              className="wfx rounded-[18px] border p-7 transition-transform hover:-translate-y-1"
              style={{
                borderColor: hot ? LIME : "rgba(244,246,242,0.2)",
                background: hot ? "rgba(216,243,78,0.08)" : "rgba(244,246,242,0.04)",
                ...fx(i + 1),
              }}
            >
              <p className="text-[1.1rem] font-bold" style={BRIC}>
                {t}
              </p>
              <p className="mt-3" style={{ ...BRIC, fontWeight: 800, fontSize: "3rem", lineHeight: 1, color: hot ? LIME : PAPER }}>
                {p}
              </p>
              <p className="mt-3 text-[0.9rem] text-[#F4F6F2]/65">{s}</p>
            </div>
          ))}
        </div>
        <p className="wfx mt-6 inline-block rounded-full px-6 py-3 text-[0.9rem] font-bold" style={{ background: PINK, color: BLACK, ...fx(4) }}>
          Prvá lekcia za 6 € — zrušenie zdarma do 12 h
        </p>
      </Shell>

      {/* ---- close ---- */}
      <Shell id="st-zaver" className="relative overflow-hidden px-[clamp(1.25rem,4vw,3.5rem)] py-[12svh]">
        <div aria-hidden="true" className="st-closeimg absolute inset-[-10%] bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/pohyb.jpg)`, filter: "grayscale(1) contrast(1.1) brightness(0.35)" }} />
        <div className="relative z-10 mx-auto max-w-[52rem] text-center">
          <h2 className="wfx uppercase" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,6vw,5.2rem)", lineHeight: 0.98, letterSpacing: "-0.02em", ...fx(0) }}>
            Telo si pamätá, kedy ste začali.
          </h2>
          <div className="wfx mt-8 flex flex-wrap items-center justify-center gap-4" style={fx(1)}>
            <a href="#rozvrh" className="rounded-full px-9 py-4.5 text-[1.05rem] font-bold transition-transform hover:-translate-y-0.5" style={{ background: LIME, color: BLACK, padding: "18px 36px" }}>
              Rezervovať lekciu
            </a>
            <span className="text-[0.9rem] text-[#F4F6F2]/70">dnes o 17:15 je ešte voľné</span>
          </div>
        </div>
      </Shell>

      <footer className="flex flex-wrap items-baseline justify-between gap-3 border-t border-[#F4F6F2]/12 px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-[0.56rem] tracking-[0.14em] text-[#F4F6F2]/55" style={MONO}>
        <span>ŠTÚDIO · WELLNESS A POHYB · 9 LEKTOROV</span>
        <span>PRVÁ LEKCIA ZA 6 €</span><KonceptLine />
      </footer>
    </main>
  )
}
