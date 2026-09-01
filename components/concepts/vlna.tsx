"use client"

/**
 * VLNA — the wellness studio concept as a full site (AD v3 amendment 2).
 *
 * Mobile-first energy, browsable: loud hero with the day's schedule ON the
 * first screen, the full week timetable, membership tiers, the low-threshold
 * close. Bricolage voice, chalk/teal/citrus climate; the arcs draw, the live
 * capacity pulses, and the whole decision — lekcia, miesto, cena — fits one
 * phone screen. The mechanic is BOOK.
 */

import { BRIC, fx, MONO, Shell } from "./shell"

const CHALK = "#FBFAF7"
const TEAL = "#123B3A"
const CITRUS = "#D8F24B"

const TODAY = [
  ["07:00", "Mobilita", "4 miesta"],
  ["09:30", "Pilates", "2 miesta"],
  ["17:15", "Joga flow", "voľné"],
  ["19:00", "Dych a regenerácia", "1 miesto"],
] as const

const WEEK = [
  ["PO", "Mobilita · Pilates · Joga flow"],
  ["UT", "Sila · Dych · Joga flow"],
  ["ST", "Mobilita · Pilates · Regenerácia"],
  ["ŠT", "Sila · Joga flow · Dych"],
  ["PI", "Mobilita · Pilates · Joga flow"],
  ["SO", "Dlhá prax 90′"],
] as const

function Arcs({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}>
      <g fill="none" stroke={TEAL} strokeOpacity="0.14" strokeWidth="1.2">
        <path className="wdraw" pathLength={1} style={fx(1)} d="M-20 220 C 90 150, 150 250, 260 170 S 400 120, 440 160" />
        <path className="wdraw" pathLength={1} style={fx(3)} d="M-20 250 C 90 180, 150 280, 260 200 S 400 150, 440 190" />
        <path className="wdraw" pathLength={1} style={fx(5)} d="M-20 190 C 90 120, 150 220, 260 140 S 400 90, 440 130" />
      </g>
    </svg>
  )
}

function SlotList({ slots, compactRows = false }: { slots: readonly (readonly [string, string, string])[]; compactRows?: boolean }) {
  return (
    <ul className="grid gap-1.5">
      {slots.map(([time, name, free], i) => (
        <li
          key={time}
          className="wfx flex items-center gap-4 rounded-[8px] border border-[#123B3A]/15 bg-white/75 px-4"
          style={{ ...fx(i + 2), paddingBlock: compactRows ? "0.5rem" : "0.7rem" }}
        >
          <span className="tnum text-[0.85rem] font-semibold" style={MONO}>
            {time}
          </span>
          <span className="min-w-0 flex-1 truncate text-[0.92rem] font-medium">{name}</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.56rem] tracking-[0.1em] ${free === "voľné" ? "wpulse" : ""}`}
            style={
              free === "voľné"
                ? { ...MONO, background: CITRUS, color: TEAL }
                : { ...MONO, background: "rgba(18,59,58,0.08)", color: "rgba(18,59,58,0.7)" }
            }
          >
            {free.toUpperCase()}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function VlnaHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: CHALK, color: TEAL }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(95% 70% at 78% 0%, rgba(216,242,75,0.45) 0%, transparent 60%), radial-gradient(80% 60% at 5% 100%, rgba(18,59,58,0.1) 0%, transparent 62%)",
        }}
      />
      <Arcs className="opacity-[0.55]" />
      <span
        aria-hidden="true"
        className="wpar pointer-events-none absolute right-[-0.05em] bottom-[-0.16em] font-extrabold uppercase select-none"
        style={{ ...BRIC, fontSize: "clamp(11rem,32vh,26rem)", lineHeight: 0.8, color: "rgba(18,59,58,0.05)", ["--depth" as string]: "26" }}
      >
        ŠT
      </span>

      <header className={`relative z-10 flex items-center justify-between px-[clamp(1.25rem,4vw,4rem)] ${portal ? "pt-6" : "pt-14"}`}>
        <span className="font-extrabold" style={{ ...BRIC, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>
          ŠTÚDIO
        </span>
        <nav className="hidden items-center gap-7 text-[0.6rem] tracking-[0.18em] text-[#123B3A]/60 md:flex" style={MONO}>
          <span>ROZVRH</span>
          <span>LEKTORI</span>
          <span>ČLENSTVO</span>
        </nav>
        <span className="rounded-full px-5 py-1.5 text-[0.64rem] font-bold tracking-[0.08em]" style={{ background: CITRUS, color: TEAL }}>
          REZERVOVAŤ
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-10 px-[clamp(1.25rem,4vw,4rem)] py-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="min-w-0 flex-1">
          <p className="wfx text-[0.62rem] tracking-[0.26em] text-[#123B3A]/60" style={{ ...MONO, ...fx(0) }}>
            WELLNESS A POHYB · 9 LEKTOROV
          </p>
          <h1 className="wfx mt-3 font-extrabold uppercase" style={{ ...BRIC, fontSize: "clamp(2.8rem,8vw,7rem)", lineHeight: 0.92, letterSpacing: "-0.03em", ...fx(1) }}>
            Začnite
            <br />
            vo štvrtok.
          </h1>
          <p className="wfx mt-5 max-w-[26rem] text-[0.95rem] leading-[1.6] text-[#123B3A]/70" style={fx(2)}>
            Žiadne PDF, žiadne písanie do správ. Vyberiete lekciu, vidíte voľné
            miesta, zaplatíte — celé to trvá menej než minútu.
          </p>
          <div className="wfx mt-7 flex flex-wrap items-center gap-4" style={fx(3)}>
            <span className="rounded-full px-7 py-3 text-[0.72rem] font-bold tracking-[0.08em]" style={{ background: TEAL, color: CHALK }}>
              PRVÁ LEKCIA ZA 6 €
            </span>
            <span className="text-[0.64rem] tracking-[0.06em] text-[#123B3A]/60" style={MONO}>
              zrušenie zdarma do 12 h
            </span>
          </div>
        </div>

        <div className="w-full max-w-[26rem] shrink-0">
          <div className="wfx mb-3 flex items-baseline justify-between" style={fx(1)}>
            <span className="text-[0.62rem] tracking-[0.22em] text-[#123B3A]/60" style={MONO}>
              DNES · ŠTVRTOK
            </span>
            <span className="text-[0.58rem] tracking-[0.12em] text-[#123B3A]/45" style={MONO}>
              VŠETKY LEKCIE →
            </span>
          </div>
          <SlotList slots={TODAY} compactRows={portal} />
        </div>
      </div>
    </Shell>
  )
}

export default function VlnaSite() {
  return (
    <main style={{ background: CHALK, color: TEAL }}>
      <VlnaHero />

      {/* ---- the week ---- */}
      <Shell className="relative overflow-hidden px-[clamp(1.25rem,4vw,4rem)] py-[10svh]" style={{ background: TEAL, color: CHALK }}>
        <Arcs className="opacity-[0.35] invert" />
        <div className="relative">
          <h2 className="wfx font-extrabold uppercase" style={{ ...BRIC, fontSize: "clamp(1.9rem,4.4vw,3.8rem)", lineHeight: 0.95, ...fx(0) }}>
            Týždeň v štúdiu
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-[10px] bg-white/12 sm:grid-cols-2 lg:grid-cols-3">
            {WEEK.map(([d, list], i) => (
              <div key={d} className="wfx px-5 py-5" style={{ background: "rgba(255,255,255,0.06)", ...fx(i + 1) }}>
                <p className="text-[0.66rem] font-bold tracking-[0.2em]" style={{ ...MONO, color: CITRUS }}>
                  {d}
                </p>
                <p className="mt-2 text-[0.85rem] leading-[1.6] text-white/80">{list}</p>
              </div>
            ))}
          </div>
        </div>
      </Shell>

      {/* ---- membership ---- */}
      <Shell className="px-[clamp(1.25rem,4vw,4rem)] py-[11svh]">
        <h2 className="wfx text-center font-extrabold uppercase" style={{ ...BRIC, fontSize: "clamp(1.9rem,4.4vw,3.8rem)", lineHeight: 0.95, ...fx(0) }}>
          Členstvo bez hviezdičiek
        </h2>
        <div className="mx-auto mt-9 grid max-w-[52rem] gap-[clamp(0.6rem,1.5vw,1.2rem)] sm:grid-cols-3">
          {[
            ["JEDNORAZOVO", "12 €", "za lekciu", false],
            ["8 LEKCIÍ", "79 €", "platnosť 60 dní", false],
            ["NEOBMEDZENE", "119 €", "mesačne · bez viazanosti", true],
          ].map(([tier, price, note, hot], i) => (
            <div
              key={tier as string}
              className="wfx rounded-[12px] px-6 py-7 text-center"
              style={hot ? { background: TEAL, color: CHALK, ...fx(i + 1) } : { border: "1px solid rgba(18,59,58,0.2)", ...fx(i + 1) }}
            >
              <p className="text-[0.56rem] tracking-[0.2em] opacity-70" style={MONO}>
                {tier}
              </p>
              <p className="mt-2 font-extrabold" style={{ ...BRIC, fontSize: "2.2rem" }}>
                {price}
              </p>
              <p className="mt-1 text-[0.62rem] opacity-65" style={MONO}>
                {note}
              </p>
              <span
                className="mt-5 inline-block w-full rounded-full py-2.5 text-[0.62rem] font-bold tracking-[0.1em]"
                style={hot ? { background: CITRUS, color: TEAL } : { background: "rgba(18,59,58,0.08)" }}
              >
                VYBRAŤ
              </span>
            </div>
          ))}
        </div>
        <p className="wfx mt-8 text-center text-[0.62rem] tracking-[0.14em] text-[#123B3A]/55" style={{ ...MONO, ...fx(4) }}>
          ZRUŠENIE ZDARMA DO 12 H PRED LEKCIOU · PRVÁ LEKCIA ZA 6 €
        </p>
      </Shell>

      <footer className="border-t border-[#123B3A]/15 px-[clamp(1.25rem,4vw,4rem)] py-6 text-[0.58rem] tracking-[0.14em] text-[#123B3A]/55" style={MONO}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="font-extrabold text-[#123B3A]" style={{ ...BRIC, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
            ŠTÚDIO
          </span>
          <span>PRVÁ LEKCIA ZA 6 €</span>
        </div>
      </footer>
    </main>
  )
}
