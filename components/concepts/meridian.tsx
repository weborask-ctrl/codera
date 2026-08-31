"use client"

/**
 * MERIDIÁN — the roastery concept as a full 5D site (AD v3 amendment 2).
 *
 * A browsable shop, not a backdrop: hero with the drawn bag as protagonist,
 * the four-bag shop grid with prices and carts, the origin band where the
 * latitude line becomes a map, the subscription close. Warm-editorial +
 * retro-craft grammar in Codera's own Meridián identity — Fraunces voice,
 * bone/umber/ember climate. The mechanic is BUY, and the frame never lets
 * you forget it. `MeridianHero` is reused by the /03 portal and the case
 * study, so the demo and the destination cannot drift.
 */

import { FR, fx, MONO, Shell } from "./shell"

const BONE = "#F4EFE6"
const UMBER = "#2A1D14"
const EMBER = "#C4531F"

const BAGS = [
  { origin: "Guji", region: "Etiópia", code: "ET · 06", tone: "#7A3B1E", price: "14,90 €", note: "broskyňa · čierny čaj", lat: "06°12′ N" },
  { origin: "Huila", region: "Kolumbia", code: "CO · 11", tone: "#3F4A2C", price: "13,50 €", note: "karamel · červené jablko", lat: "02°32′ N" },
  { origin: "Chiapas", region: "Mexiko", code: "MX · 04", tone: "#8A5A2B", price: "13,50 €", note: "kakao · pražený oriešok", lat: "16°45′ N" },
  { origin: "Kirinyaga", region: "Keňa", code: "KE · 09", tone: "#5B2733", price: "15,20 €", note: "ríbezľa · grep", lat: "00°30′ J" },
]

function Bag({
  origin,
  code,
  tone,
  className = "",
  style,
}: {
  origin: string
  code: string
  tone: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-[3px] ${className}`}
      style={{ background: tone, color: BONE, aspectRatio: "0.82", ...style }}
    >
      <svg aria-hidden="true" viewBox="0 0 120 90" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-[0.5]">
        <g stroke={BONE} strokeWidth="0.5" opacity="0.55">
          <path d="M0 30 H120" />
          <path d="M0 46 H120" />
          <path d="M0 62 H120" />
        </g>
        <path className="wdraw" pathLength={1} d="M0 46 C30 34, 90 58, 120 46" stroke={BONE} strokeWidth="1.4" fill="none" />
      </svg>
      <div className="relative px-[8%] pt-[8%] text-[0.55rem] tracking-[0.2em]" style={MONO}>
        {code}
      </div>
      <div className="relative px-[8%] pb-[9%]">
        <p style={{ ...FR, fontSize: "clamp(1.1rem,2.2vw,1.9rem)", lineHeight: 0.95 }}>{origin}</p>
      </div>
    </div>
  )
}

/** The hero — also the /03 portal face and the case-study figure. */
export function MeridianHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: BONE, color: UMBER }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 75% at 15% 0%, rgba(255,250,240,0.9) 0%, transparent 58%), radial-gradient(85% 65% at 90% 100%, rgba(196,83,31,0.16) 0%, transparent 62%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{ backgroundImage: "radial-gradient(rgba(42,29,20,0.13) 0.7px, transparent 0.7px)", backgroundSize: "6px 6px" }}
      />
      {/* ghost latitude numeral, deep parallax */}
      <span
        aria-hidden="true"
        className="wpar pointer-events-none absolute right-[-0.04em] bottom-[-0.14em] font-semibold select-none"
        style={{ ...FR, fontSize: "clamp(12rem,30vh,24rem)", lineHeight: 0.8, color: "rgba(42,29,20,0.05)", ["--depth" as string]: "26" }}
      >
        06°
      </span>

      <header className={`relative z-10 flex items-center justify-between px-[clamp(1.25rem,4vw,4rem)] ${portal ? "pt-6" : "pt-14"}`}>
        <span style={{ ...FR, fontSize: "1.4rem" }}>Meridián</span>
        <nav className="hidden items-center gap-7 text-[0.62rem] tracking-[0.2em] text-[#2A1D14]/60 md:flex" style={MONO}>
          <span>KÁVA</span>
          <span>PREDPLATNÉ</span>
          <span>VEĽKOOBCHOD</span>
        </nav>
        <span className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.62rem] tracking-[0.12em]" style={{ ...MONO, background: EMBER, color: BONE }}>
          KOŠÍK <span className="rounded-full bg-white/25 px-1.5">2</span>
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-10 px-[clamp(1.25rem,4vw,4rem)] py-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="wpar wfx w-[46%] max-w-[300px] shrink-0 self-center lg:w-[26%] lg:max-w-none" style={{ ...fx(1), ["--depth" as string]: "-18" }}>
          <Bag origin="Guji" code="ET · 06" tone="#7A3B1E" style={{ boxShadow: "0 40px 80px -30px rgba(42,29,20,0.5)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="wfx text-[0.62rem] tracking-[0.28em] text-[#C4531F]" style={{ ...MONO, ...fx(2) }}>
            ETIÓPIA · PRAŽENÉ V UTOROK
          </p>
          <h1 className="wfx mt-3" style={{ ...FR, fontSize: "clamp(2.6rem,7vw,6.4rem)", lineHeight: 0.96, letterSpacing: "-0.015em", ...fx(3) }}>
            Káva s vlastnou
            <br />
            <em>zemepisnou šírkou.</em>
          </h1>
          <p className="wfx mt-5 max-w-[30rem] text-[0.95rem] leading-[1.65] text-[#2A1D14]/70" style={fx(4)}>
            Guji, 2 050 m n. m. Umytá príprava, jasná kyselina, broskyňa a čierny
            čaj. Pražíme malé dávky a posielame do troch dní.
          </p>
          <div className="wfx mt-7 flex flex-wrap items-center gap-4" style={fx(5)}>
            <span className="rounded-full px-7 py-3 text-[0.72rem] font-medium tracking-[0.08em] whitespace-nowrap" style={{ ...MONO, background: UMBER, color: BONE }}>
              DO KOŠÍKA — 14,90 €
            </span>
            <span className="text-[0.66rem] tracking-[0.06em] text-[#2A1D14]/60" style={MONO}>
              250 g · mletie na výber
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-px border-t border-[#2A1D14]/20 bg-[#2A1D14]/20 text-[0.56rem] md:grid-cols-4" style={MONO}>
        {[
          ["PRAŽÍME", "utorok a piatok"],
          ["ODOSIELAME", "do 24 h od praženia"],
          ["DOPRAVA", "zdarma od 40 €"],
          ["PREDPLATNÉ", "každé 2 alebo 4 týždne"],
        ].map(([n, l], i) => (
          <div key={n} className="wfx flex flex-col gap-0.5 px-4 py-3" style={{ background: BONE, ...fx(i + 5) }}>
            <span className="tracking-[0.14em] text-[#C4531F]">{n}</span>
            <span className="tracking-[0.04em] text-[#2A1D14]/60">{l}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/** The full browsable site. */
export default function MeridianSite() {
  return (
    <main style={{ background: BONE, color: UMBER }}>
      <MeridianHero />

      {/* ---- the shop ---- */}
      <Shell className="relative px-[clamp(1.25rem,4vw,4rem)] py-[10svh]">
        <div className="flex items-baseline justify-between border-b border-[#2A1D14]/20 pb-4">
          <h2 className="wfx" style={{ ...FR, fontSize: "clamp(1.8rem,3.6vw,3.2rem)", lineHeight: 1 }}>
            Aktuálne praženie
          </h2>
          <span className="wfx hidden text-[0.6rem] tracking-[0.2em] text-[#2A1D14]/55 md:block" style={{ ...MONO, ...fx(1) }}>
            04 KÁVY · VŽDY ČERSTVÉ
          </span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-10 lg:grid-cols-4">
          {BAGS.map((b, i) => (
            <article key={b.code} className="wfx group" style={fx(i + 1)}>
              <div className="wpar" style={{ ["--depth" as string]: `${-6 - i * 3}` }}>
                <Bag origin={b.origin} code={b.code} tone={b.tone} className="transition-transform duration-500 group-hover:-translate-y-2" style={{ boxShadow: "0 28px 50px -24px rgba(42,29,20,0.45)" }} />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p style={{ ...FR, fontSize: "1.15rem" }}>{b.origin}</p>
                <p className="tnum text-[0.8rem]" style={MONO}>
                  {b.price}
                </p>
              </div>
              <p className="mt-1 text-[0.62rem] tracking-[0.1em] text-[#2A1D14]/55" style={MONO}>
                {b.region.toUpperCase()} · {b.note}
              </p>
              <button
                type="button"
                className="mt-3 w-full rounded-full border border-[#2A1D14]/30 py-2 text-[0.62rem] tracking-[0.12em] transition-colors group-hover:border-[#2A1D14] hover:bg-[#2A1D14] hover:text-[#F4EFE6]"
                style={MONO}
              >
                DO KOŠÍKA
              </button>
            </article>
          ))}
        </div>
      </Shell>

      {/* ---- origin band: the latitude line becomes a map ---- */}
      <Shell className="relative overflow-hidden px-[clamp(1.25rem,4vw,4rem)] py-[12svh]" style={{ background: UMBER, color: BONE }}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="wfx text-[0.62rem] tracking-[0.28em] text-[#C4531F]" style={{ ...MONO, ...fx(0) }}>
              ODKIAĽ PIJETE
            </p>
            <h2 className="wfx mt-3" style={{ ...FR, fontSize: "clamp(2rem,4.4vw,4rem)", lineHeight: 1.02, ...fx(1) }}>
              Štyri farmy.
              <br />
              <em>Štyri rovnobežky.</em>
            </h2>
            <p className="wfx mt-5 max-w-[26rem] text-[0.92rem] leading-[1.7] text-[#F4EFE6]/70" style={fx(2)}>
              Každé balenie nesie zemepisnú šírku svojej farmy. Nie je to
              dekorácia — je to sľub, že vieme povedať, kto kávu pestoval, kedy
              sa zberala a čo dostal farmár zaplatené.
            </p>
          </div>
          <div className="wfx relative" style={fx(2)}>
            <svg viewBox="0 0 460 240" className="w-full" aria-hidden="true">
              <g stroke={BONE} strokeOpacity="0.18" strokeWidth="1">
                {[40, 80, 120, 160, 200].map((y) => (
                  <path key={y} d={`M0 ${y} H460`} />
                ))}
              </g>
              {BAGS.map((b, i) => {
                const y = 50 + i * 46
                const x = 90 + i * 92
                return (
                  <g key={b.code}>
                    <path className="wdraw" pathLength={1} d={`M0 ${y} H${x}`} stroke={EMBER} strokeWidth="1.5" fill="none" style={fx(i + 2)} />
                    <circle cx={x} cy={y} r="4" fill={EMBER} />
                    <text x={x + 12} y={y + 4} fill={BONE} fontSize="12" style={MONO as React.CSSProperties}>
                      {b.origin} · {b.lat}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </Shell>

      {/* ---- subscription close ---- */}
      <Shell className="relative px-[clamp(1.25rem,4vw,4rem)] py-[12svh] text-center">
        <p className="wfx text-[0.62rem] tracking-[0.28em] text-[#C4531F]" style={{ ...MONO, ...fx(0) }}>
          PREDPLATNÉ
        </p>
        <h2 className="wfx mx-auto mt-3 max-w-[16em]" style={{ ...FR, fontSize: "clamp(2rem,4.6vw,4.2rem)", lineHeight: 1.02, ...fx(1) }}>
          Čerstvá káva každé dva týždne. <em>Bez rozmýšľania.</em>
        </h2>
        <div className="wfx mx-auto mt-8 flex max-w-[30rem] flex-col items-center gap-4 sm:flex-row sm:justify-center" style={fx(2)}>
          <span className="rounded-full px-8 py-3.5 text-[0.72rem] tracking-[0.1em]" style={{ ...MONO, background: EMBER, color: BONE }}>
            ZOSTAVIŤ PREDPLATNÉ
          </span>
          <span className="text-[0.66rem] tracking-[0.08em] text-[#2A1D14]/60" style={MONO}>
            od 12,90 € / dodávka · kedykoľvek zrušíte
          </span>
        </div>
      </Shell>

      <footer className="border-t border-[#2A1D14]/15 px-[clamp(1.25rem,4vw,4rem)] py-6 text-[0.58rem] tracking-[0.14em] text-[#2A1D14]/55" style={MONO}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span style={{ ...FR, fontSize: "1rem", letterSpacing: 0 }}>Meridián</span>
          <span>PRAŽIAREŇ KÁVY · FIKTÍVNY KONCEPT ŠTÚDIA CODERA</span>
          <span>MERIDIAN-KONCEPT.SK</span>
        </div>
      </footer>
    </main>
  )
}
