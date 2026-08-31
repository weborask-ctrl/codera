"use client"

/**
 * Step 7 phase A — three candidate art directions as static boards.
 *
 * Dev-only route, not linked from the site. `?d=atrament | signal | polnoc`
 * (default atrament). Each board is ONE static hero frame plus the five-act
 * tonal script as a strip — the static-frame test applied to a direction
 * before a single production file changes.
 *
 * The three are deliberately distant answers to the same four complaints
 * (little wow · wrong colours · wrong typography · five moods, no world):
 *
 *   ATRAMENT  ink on bone — a bright gallery; wow from scale and whitespace
 *   SIGNÁL    cobalt poster — one loud colour owns everything; wow from nerve
 *   POLNOC    electric dusk — light as material; wow from atmosphere
 *
 * Copy comes verbatim from CODERA_STEP6_CONTENT.md §3. No motion here at all:
 * a direction that only works moving is exactly the failure Step 4 §4 names.
 */

import { useEffect, useState } from "react"

const MONO = { fontFamily: "var(--font-geist-mono)" }
const SERIF = { fontFamily: "var(--font-fraunces), Georgia, serif" }

/* ------------------------------------------------------------- shared --- */

const COPY = {
  eyebrow: "Webové štúdio · Slovensko",
  a1: "Vaša firma je lepšia,",
  a2: "než ukazuje váš web.",
  support:
    "Navrhujeme a staviame firemné weby, ktoré pôsobia tak dôveryhodne, ako naozaj pracujete.",
  cta: "Začať projekt",
  secondary: "Pozrieť prácu",
  facts: "Prvý návrh do 72 hodín · Dizajn aj vývoj pod jednou strechou",
}

/** The open-C mark as a bare arc — same geometry as components/site/arc. */
function Arc({ stroke, width = 1.6, className }: { stroke: string; width?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M 18.36 5.64 A 9 9 0 1 0 18.36 18.36"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
      />
    </svg>
  )
}

function TonalStrip({
  tones,
  ink,
  bg,
}: {
  tones: { c: string; l: string }[]
  ink: string
  bg: string
}) {
  return (
    <div className="flex h-[11svh] items-stretch" style={{ background: bg }}>
      {tones.map((t) => (
        <div key={t.l} className="relative flex-1 border-r" style={{ background: t.c, borderColor: `${ink}22` }}>
          <span
            className="absolute bottom-1.5 left-2 text-[0.5rem] tracking-[0.18em]"
            style={{ ...MONO, color: ink, opacity: 0.55, mixBlendMode: "normal" }}
          >
            {t.l}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------- ATRAMENT --- *
   Ink on bone. A bright gallery where the site itself hangs as the work.
   One ground for the whole journey; the ONLY dark moment is the final act,
   inverted — the exact opposite of v2's dark opening. Fraunces at display
   optical size carries the voice; vermilion appears once per frame at most. */

function Atrament() {
  const INK = "#16150F"
  const BONE = "#F7F5F0"
  const VERMILION = "#E8502A"
  return (
    <div className="flex h-svh flex-col" style={{ background: BONE, color: INK }}>
      <header className="flex items-center justify-between px-[clamp(1.5rem,4vw,4rem)] pt-7">
        <div className="flex items-center gap-3">
          <Arc stroke={INK} width={2.2} className="h-7 w-7" />
          <span className="text-[0.95rem] tracking-[0.32em]" style={MONO}>
            CODERA
          </span>
        </div>
        <nav className="flex items-center gap-8 text-[0.66rem] tracking-[0.22em]" style={MONO}>
          <span>PRÁCA</span>
          <span>SLUŽBY</span>
          <span>KONTAKT</span>
          <span
            className="border px-5 py-2"
            style={{ borderColor: INK }}
          >
            ZAČAŤ PROJEKT
          </span>
        </nav>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col justify-center px-[clamp(1.5rem,4vw,4rem)]">
        {/* the mark as an OBJECT in bright air — thin ink line, long soft shadow */}
        <div aria-hidden="true" className="absolute top-1/2 right-[6vw] hidden -translate-y-[54%] lg:block">
          <Arc stroke={INK} width={0.8} className="h-[52svh] w-[52svh]" />
          <div
            className="mx-auto mt-[-4svh] h-[3svh] w-[36svh] rounded-[50%]"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(22,21,15,0.16), transparent 70%)" }}
          />
        </div>

        <p className="text-[0.66rem] tracking-[0.3em]" style={{ ...MONO, color: VERMILION }}>
          {COPY.eyebrow.toUpperCase()}
        </p>
        <h1
          className="mt-6"
          style={{
            ...SERIF,
            fontSize: "clamp(3.2rem,7.4vw,7.6rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.022em",
            fontWeight: 380,
            fontVariationSettings: "'opsz' 144",
            maxWidth: "11em",
          }}
        >
          {COPY.a1}
          <br />
          <em style={{ fontStyle: "italic" }}>{COPY.a2}</em>
        </h1>
        <p className="mt-7 max-w-[34rem] text-[1.02rem] leading-[1.65]" style={{ color: `${INK}B3` }}>
          {COPY.support}
        </p>
        <div className="mt-9 flex items-center gap-7">
          <span
            className="px-8 py-3.5 text-[0.72rem] tracking-[0.18em]"
            style={{ ...MONO, background: INK, color: BONE }}
          >
            ZAČAŤ PROJEKT
          </span>
          <span className="text-[0.72rem] tracking-[0.14em] underline underline-offset-8" style={MONO}>
            POZRIEŤ PRÁCU
          </span>
        </div>
      </div>

      <div
        className="flex items-center justify-between border-t px-[clamp(1.5rem,4vw,4rem)] py-3 text-[0.58rem] tracking-[0.18em]"
        style={{ ...MONO, borderColor: `${INK}26`, color: `${INK}8C` }}
      >
        <span>{COPY.facts.toUpperCase()}</span>
        <span>01 / 05</span>
      </div>

      <TonalStrip
        ink={INK}
        bg={BONE}
        tones={[
          { c: "#F7F5F0", l: "01 KOSŤ" },
          { c: "#FFFFFF", l: "02 BIELA" },
          { c: "#F1EEE6", l: "03 SVETY" },
          { c: "#F7F5F0", l: "04 KOSŤ" },
          { c: "#16150F", l: "05 ATRAMENT" },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------- SIGNÁL --- *
   One colour owns everything: cobalt. Poster grammar — the statement IS the
   composition, set edge to edge in the widest Archivo, cropped with intent.
   Light acts are white pages with cobalt ink; the world never leaves the two
   colours plus one black chip. Wow from nerve, coherence from monochromy. */

function Signal() {
  const COBALT = "#1F2BD4"
  const PAPER = "#FFFFFF"
  return (
    <div className="flex h-svh flex-col" style={{ background: COBALT, color: PAPER }}>
      <header className="flex items-center justify-between px-[clamp(1.25rem,3vw,3rem)] pt-6">
        <div className="flex items-center gap-3">
          <Arc stroke={PAPER} width={2.6} className="h-8 w-8" />
          <span className="text-[1.05rem] font-bold tracking-[0.08em]" style={{ fontStretch: "125%" }}>
            CODERA
          </span>
        </div>
        <nav className="flex items-center gap-6 text-[0.68rem] font-bold tracking-[0.1em]">
          <span>PRÁCA</span>
          <span>SLUŽBY</span>
          <span>KONTAKT</span>
          <span className="bg-white px-5 py-2.5" style={{ color: COBALT }}>
            ZAČAŤ PROJEKT
          </span>
        </nav>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden pb-[4svh]">
        {/* poster type, deliberately cropped by the frame edge */}
        <p
          className="px-[clamp(1.25rem,3vw,3rem)] text-[0.7rem] font-bold tracking-[0.26em]"
          style={MONO}
        >
          {COPY.eyebrow.toUpperCase()}
        </p>
        <h1
          className="mt-3 font-extrabold uppercase"
          style={{
            fontSize: "clamp(4rem,10.6vw,11rem)",
            lineHeight: 0.86,
            letterSpacing: "-0.035em",
            fontStretch: "125%",
            marginLeft: "-0.04em",
            paddingInline: "clamp(1.25rem,3vw,3rem)",
            whiteSpace: "nowrap",
          }}
        >
          Vaša firma
          <br />
          <span style={{ color: "#0D1240" }}>je lepšia,</span>
          <br />
          než váš web.
        </h1>

        <div className="mt-7 flex items-end justify-between px-[clamp(1.25rem,3vw,3rem)]">
          <p className="max-w-[30rem] text-[0.98rem] leading-[1.55] opacity-90">{COPY.support}</p>
          <div className="hidden items-center gap-4 lg:flex">
            <span className="bg-white px-7 py-3.5 text-[0.72rem] font-bold tracking-[0.1em]" style={{ color: COBALT }}>
              ZAČAŤ PROJEKT
            </span>
            <span className="border border-white/70 px-7 py-3.5 text-[0.72rem] font-bold tracking-[0.1em]">
              POZRIEŤ PRÁCU
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between border-t border-white/30 px-[clamp(1.25rem,3vw,3rem)] py-3 text-[0.58rem] font-bold tracking-[0.16em]"
        style={MONO}
      >
        <span>{COPY.facts.toUpperCase()}</span>
        <span>01 / 05</span>
      </div>

      <TonalStrip
        ink="#0D1240"
        bg={COBALT}
        tones={[
          { c: "#1F2BD4", l: "01 KOBALT" },
          { c: "#FFFFFF", l: "02 PAPIER" },
          { c: "#EFF1FF", l: "03 SVETY" },
          { c: "#FFFFFF", l: "04 PAPIER" },
          { c: "#0D1240", l: "05 NOC" },
        ]}
      />
    </div>
  )
}

/* ------------------------------------------------------------- POLNOC --- *
   Electric dusk. Dark reinterpreted with colour: indigo air, aurora light,
   type that glows instead of sits. Light is the material — the journey runs
   dusk → pale dawn → white noon → dusk, so the dark/light dramaturgy is the
   day itself, one world by construction. Fraunces italic carries the voice. */

function Polnoc() {
  const INKLIGHT = "#F2EFFC"
  return (
    <div
      className="flex h-svh flex-col"
      style={{
        background:
          "radial-gradient(120% 90% at 78% -10%, #35266B 0%, transparent 55%), radial-gradient(90% 70% at 8% 108%, #0E4D4A 0%, transparent 52%), radial-gradient(70% 45% at 55% 118%, #B4562E 0%, transparent 58%), #0D0E22",
        color: INKLIGHT,
      }}
    >
      <header className="flex items-center justify-between px-[clamp(1.5rem,4vw,4rem)] pt-7">
        <div className="flex items-center gap-3">
          <Arc stroke={INKLIGHT} width={2} className="h-7 w-7" />
          <span className="text-[0.9rem] tracking-[0.3em]" style={MONO}>
            CODERA
          </span>
        </div>
        <nav className="flex items-center gap-8 text-[0.64rem] tracking-[0.2em] text-[#B9B3D6]" style={MONO}>
          <span>PRÁCA</span>
          <span>SLUŽBY</span>
          <span>KONTAKT</span>
          <span
            className="rounded-full px-5 py-2 text-[#0D0E22]"
            style={{ background: INKLIGHT }}
          >
            ZAČAŤ PROJEKT
          </span>
        </nav>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col justify-center px-[clamp(1.5rem,4vw,4rem)]">
        {/* the mark as pure light — a luminous arc with a soft halo */}
        <div aria-hidden="true" className="absolute top-1/2 right-[5vw] hidden -translate-y-1/2 lg:block">
          <div className="relative">
            <div
              className="absolute inset-[-18%] rounded-full"
              style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(140,110,255,0.25), transparent 70%)" }}
            />
            <Arc stroke="url(#none)" className="hidden" />
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[46svh] w-[46svh]">
              <defs>
                <linearGradient id="aur" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#9D7BFF" />
                  <stop offset="55%" stopColor="#5EEAD4" />
                  <stop offset="100%" stopColor="#FF8A5B" />
                </linearGradient>
              </defs>
              <path
                d="M 18.36 5.64 A 9 9 0 1 0 18.36 18.36"
                stroke="url(#aur)"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(157,123,255,0.65))" }}
              />
            </svg>
          </div>
        </div>

        <p className="text-[0.64rem] tracking-[0.3em] text-[#9D7BFF]" style={MONO}>
          {COPY.eyebrow.toUpperCase()}
        </p>
        <h1
          className="mt-6"
          style={{
            ...SERIF,
            fontSize: "clamp(3rem,7vw,7.2rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.018em",
            fontWeight: 340,
            fontVariationSettings: "'opsz' 144",
            maxWidth: "11em",
            textShadow: "0 0 42px rgba(157,123,255,0.28)",
          }}
        >
          {COPY.a1}
          <br />
          <em>{COPY.a2}</em>
        </h1>
        <p className="mt-7 max-w-[33rem] text-[1rem] leading-[1.65] text-[#C9C3E4]">{COPY.support}</p>
        <div className="mt-9 flex items-center gap-7">
          <span
            className="rounded-full px-8 py-3.5 text-[0.72rem] tracking-[0.16em] text-[#0D0E22]"
            style={{ ...MONO, background: INKLIGHT }}
          >
            ZAČAŤ PROJEKT
          </span>
          <span className="text-[0.72rem] tracking-[0.14em] text-[#B9B3D6] underline underline-offset-8" style={MONO}>
            POZRIEŤ PRÁCU
          </span>
        </div>
      </div>

      <div
        className="flex items-center justify-between border-t border-white/15 px-[clamp(1.5rem,4vw,4rem)] py-3 text-[0.56rem] tracking-[0.18em] text-[#8D87AD]"
        style={MONO}
      >
        <span>{COPY.facts.toUpperCase()}</span>
        <span>01 / 05</span>
      </div>

      <TonalStrip
        ink="#F2EFFC"
        bg="#0D0E22"
        tones={[
          { c: "#0D0E22", l: "01 SÚMRAK" },
          { c: "#EEEAFB", l: "02 ÚSVIT" },
          { c: "#FBFAFF", l: "03 SVETY" },
          { c: "#F3F0FA", l: "04 DEŇ" },
          { c: "#171438", l: "05 NOC" },
        ]}
      />
    </div>
  )
}

/* -------------------------------------------------------------- route --- */

const BOARDS = {
  atrament: Atrament,
  signal: Signal,
  polnoc: Polnoc,
} as const

type Dir = keyof typeof BOARDS

export default function Directions() {
  const [dir, setDir] = useState<Dir>("atrament")
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d")
    if (d && d in BOARDS) {
      setDir(d as Dir)
    }
  }, [])
  const Board = BOARDS[dir]
  return <Board />
}
