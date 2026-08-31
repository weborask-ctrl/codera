"use client"

/**
 * Step 6 phase C — the three project PAINT WORLDS.
 *
 * Each world is a full-bleed environment, not a card on a canvas
 * (The1: "the color block IS the card"). Three deliberately different
 * families, each proving a different COMMERCIAL MECHANIC rather than a
 * different palette: a roastery that sells (Meridián), a practice that is
 * consulted (Štatút), a studio that is booked (Vlna).
 *
 * The review test, from CODERA_STEP6_WORLDS.md: if the content of these
 * three could be swapped and nobody noticed, the act has failed — it would
 * prove one taste where it has to prove range.
 *
 * Each is pinned to a climate, a type voice and a density it does not share:
 *
 *   Meridián  warm roasted   editorial serif + mono data   generous, product-led
 *   Štatút    cool stone     institutional serif, tabular  dense, document-like
 *   Vlna      bright chalk   wide grotesque, loud          airy, schedule-led
 *
 * All three are modern and staged in 5D by the world around them (Ondrej,
 * 2026-08-31); the staging is Codera's, the grammar inside each frame is the
 * client's. `compact` trims secondary layers for the mobile deck.
 *
 * Every figure inside these worlds belongs to a FICTIONAL concept client and
 * is labelled UKÁŽKOVÝ KONCEPT. Nothing here is a claim about Codera.
 */

import { useEffect, useRef } from "react"

const MONO = { fontFamily: "var(--font-geist-mono)" }
/* Per-world type (AD v3 amendment): range is typographic too. */
const SERIF = { fontFamily: "var(--font-fraunces), Georgia, serif" } // Meridián
const SERIF_I = { fontFamily: "var(--font-instrument), Georgia, serif" } // Štatút
const GROT_B = { fontFamily: "var(--font-bricolage), var(--font-geist-sans), sans-serif" } // Vlna

/**
 * WorldShell — what turns a backdrop into a live mini-site.
 *
 * Sets --tx/--ty from the pointer (for .wpar parallax layers), and arms the
 * entrance choreography (data-on → .wfx/.wdraw) when the world actually takes
 * the frame, via its own IntersectionObserver. Works identically in the /03
 * stack, the mobile deck and the case-study embeds. Reduced motion is handled
 * entirely in CSS — the shell still arms, the styles refuse to move.
 */
function WorldShell({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-on", "")
            io.disconnect()
          }
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`world-shell ${className}`}
      style={style}
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
      {children}
    </div>
  )
}

/** Staggered entrance helper: nth item enters n×90 ms later. */
function fx(i: number): React.CSSProperties {
  return { ["--fx-delay" as string]: `${(i * 0.09).toFixed(2)}s` }
}

/** The1's building-scale numeral: a poster-cropped ghost index anchoring
    each world's air. Desktop full-bleed worlds only. */
function GhostNumeral({
  n,
  color,
  className,
}: {
  n: string
  color: string
  className: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`wpar pointer-events-none absolute font-semibold select-none ${className}`}
      style={{
        fontSize: "clamp(11rem,26vh,20rem)",
        lineHeight: 0.78,
        letterSpacing: "-0.04em",
        fontStretch: "125%",
        color,
        ["--depth" as string]: "26",
      }}
    >
      {n}
    </span>
  )
}

/* ------------------------------------------------------------ shared --- */

function WorldMeta({
  index,
  name,
  sector,
  ink,
  compact = false,
}: {
  index: string
  name: string
  sector: string
  ink: string
  compact?: boolean
}) {
  /* compact deck cards sit below the page header — no pt-20 clearance,
     and tighter tracking so the signage stays on one line */
  return (
    <div
      className={`flex items-baseline justify-between px-[clamp(1.1rem,3.2vw,3rem)] pb-2 ${
        compact ? "pt-5 text-[0.52rem] tracking-[0.12em]" : "pt-20 text-[0.6rem] tracking-[0.24em]"
      }`}
      style={{ color: ink, ...MONO }}
    >
      <span>
        03·{index} {name} — {sector}
      </span>
      <span className="opacity-70">UKÁŽKOVÝ KONCEPT</span>
    </div>
  )
}

/* ----------------------------------------------------------- MERIDIÁN --- *
   Speciality roastery. The mechanic is BUY, so the frame has to read as a
   shop: a cart with a count, a price, an add button. The packaging is drawn
   as vector — the sector was chosen precisely because it needs no
   photography, and every other coffee site leads with beans and burlap. */

/** One bag, drawn: a solid colour block with the label typeset on it and the
    origin's latitude ruled across, which is where the name comes from. */
function Bag({
  origin,
  code,
  tone,
  ink = "#F4EFE6",
  wide = false,
}: {
  origin: string
  code: string
  tone: string
  ink?: string
  wide?: boolean
}) {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden"
      style={{
        background: tone,
        color: ink,
        aspectRatio: wide ? "1.35" : "0.82",
        borderRadius: "2px",
      }}
    >
      {/* the latitude rule — the label device of the whole brand */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 90"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-[0.5]"
      >
        <g stroke={ink} strokeWidth="0.5" opacity="0.55">
          <path d="M0 30 H120" />
          <path d="M0 46 H120" />
          <path d="M0 62 H120" />
        </g>
        <path
          className="wdraw"
          pathLength={1}
          d="M0 46 C30 34, 90 58, 120 46"
          stroke={ink}
          strokeWidth="1.4"
          fill="none"
        />
      </svg>
      <div className="relative px-[7%] pt-[7%] text-[0.5rem] tracking-[0.2em]" style={MONO}>
        {code}
      </div>
      <div className="relative px-[7%] pb-[8%]">
        <p
          className="leading-[0.95]"
          style={{ ...SERIF, fontSize: wide ? "clamp(1.2rem,2.5vw,2.1rem)" : "clamp(0.85rem,1.5vw,1.3rem)" }}
        >
          {origin}
        </p>
      </div>
    </div>
  )
}

export function MeridianWorld({ compact = false }: { compact?: boolean }) {
  return (
    <WorldShell
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "#F4EFE6", color: "#2A1D14" }}
    >
      {/* toasted ground: never white, warmed from the top-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 75% at 15% 0%, rgba(255,250,240,0.85) 0%, transparent 58%), radial-gradient(85% 65% at 90% 100%, rgba(196,83,31,0.14) 0%, transparent 62%)",
        }}
      />
      {/* paper tooth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(42,29,20,0.13) 0.7px, transparent 0.7px)",
          backgroundSize: "6px 6px",
        }}
      />

      {!compact ? (
        <GhostNumeral n="01" color="rgba(42,29,20,0.05)" className="right-[-0.02em] bottom-[-0.1em]" />
      ) : null}

      <WorldMeta index="01" name="MERIDIÁN" sector="PRAŽIAREŇ KÁVY" ink="#2A1D14" compact={compact} />

      {/* shop chrome — the cart is the proof that this is a shop */}
      <div className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] flex items-center justify-between border-b border-[#2A1D14]/25 pb-3">
        <span style={{ ...SERIF, fontSize: "1.25rem", letterSpacing: "0.01em" }}>Meridián</span>
        {/* the nav is viewport-gated, but a compact world is a ~490px CARD on a
            768px viewport — `md:` would let it in and it collides with the
            wordmark. Compact drops it entirely. */}
        {!compact ? (
          <div
            className="hidden gap-7 text-[0.6rem] tracking-[0.2em] text-[#2A1D14]/60 lg:flex"
            style={MONO}
          >
            <span>KÁVA</span>
            <span>PREDPLATNÉ</span>
            <span>VEĽKOOBCHOD</span>
          </div>
        ) : null}
        <span
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.62rem] tracking-[0.12em]"
          style={{ background: "#C4531F", color: "#F4EFE6" }}
        >
          KOŠÍK
          <span className="rounded-full bg-[#F4EFE6]/25 px-1.5">2</span>
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-[clamp(1.1rem,3.2vw,3rem)] py-[clamp(1rem,2.4vh,2.2rem)]">
        {/* the hero product: bag left, origin data right */}
        <div className={`flex gap-[clamp(1rem,2.6vw,2.6rem)] ${compact ? "items-start" : "items-center"}`}>
          <div className={`wpar wfx ${compact ? "w-[38%] shrink-0" : "w-[26%] shrink-0"}`} style={{ ...fx(1), ["--depth" as string]: "-16" }}>
            <Bag origin="Guji" code="ET · 06" tone="#7A3B1E" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="wfx text-[0.6rem] tracking-[0.26em] text-[#C4531F]" style={{ ...MONO, ...fx(2) }}>
              ETIÓPIA · PRAŽENÉ V UTOROK
            </p>
            {/* one line, always: "Guji, 2 050 m" breaking after the comma left
                a widowed "m" on the deck card, which reads as a typo */}
            <p
              className="wfx mt-2 whitespace-nowrap"
              style={{
                ...SERIF,
                fontSize: compact ? "clamp(1.4rem,5.2vw,2.1rem)" : "clamp(2.2rem,5vw,5.2rem)",
                lineHeight: 0.94,
                letterSpacing: "-0.015em",
                ...fx(3),
              }}
            >
              Guji, 2 050 m
            </p>
            <p className="wfx mt-3 max-w-[26rem] text-[0.8rem] leading-relaxed text-[#2A1D14]/70" style={fx(4)}>
              Umytá príprava, jasná kyselina, broskyňa a čierny čaj. Pražíme malé
              dávky a posielame do troch dní.
            </p>

            {/* origin data in mono — the contrast with the serif IS the brand */}
            {!compact ? (
              <div
                className="wfx mt-5 grid max-w-[30rem] grid-cols-4 gap-px border border-[#2A1D14]/20 bg-[#2A1D14]/20 text-[0.55rem]"
                style={{ ...MONO, ...fx(5) }}
              >
                {[
                  ["06°12′ N", "ŠÍRKA"],
                  ["2 050 m", "NADMORSKÁ"],
                  ["UMYTÁ", "PRÍPRAVA"],
                  ["SVETLÉ", "PRAŽENIE"],
                ].map(([v, l]) => (
                  <div key={l} className="bg-[#F4EFE6] px-3 py-2">
                    <p className="text-[0.78rem] tracking-normal">{v}</p>
                    <p className="mt-0.5 tracking-[0.12em] text-[#2A1D14]/50">{l}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="wfx mt-5 flex flex-wrap items-center gap-4" style={fx(6)}>
              <span
                className={`rounded-full font-medium whitespace-nowrap ${
                  compact ? "px-4 py-2 text-[0.6rem] tracking-[0.06em]" : "px-6 py-2.5 text-[0.68rem] tracking-[0.1em]"
                }`}
                style={{ background: "#2A1D14", color: "#F4EFE6" }}
              >
                DO KOŠÍKA — 14,90 €
              </span>
              <span className="text-[0.66rem] tracking-[0.06em] text-[#2A1D14]/60" style={MONO}>
                250 g · mletie na výber
              </span>
            </div>
          </div>
        </div>

        {/* the grid below: a shop always shows more than one thing. It renders
            in compact too — without it the deck card is a single product and
            two thirds of dead air, which reads as a landing page, not a shop. */}
        <div className="wfx mt-[clamp(1rem,3vh,2.4rem)] grid grid-cols-3 gap-[clamp(0.6rem,1.4vw,1.4rem)]" style={fx(7)}>
          {[
            { origin: "Huila", code: "CO · 11", tone: "#3F4A2C" },
            { origin: "Chiapas", code: "MX · 04", tone: "#8A5A2B" },
            { origin: "Kirinyaga", code: "KE · 09", tone: "#5B2733" },
          ].map((b) => (
            <div
              key={b.code}
              className={compact ? "flex flex-col gap-2" : "flex items-center gap-3"}
            >
              <div className={compact ? "w-full" : "w-[38%] shrink-0"}>
                <Bag {...b} wide />
              </div>
              {/* compact stacks the bag above its caption, so repeating the
                  origin under a bag that already carries it reads as a bug */}
              <div className="min-w-0">
                {!compact ? (
                  <p style={{ ...SERIF, fontSize: "1rem", lineHeight: 1.1 }}>{b.origin}</p>
                ) : null}
                <p className="mt-1 text-[0.56rem] tracking-[0.14em] text-[#2A1D14]/55" style={MONO}>
                  {b.code} · 13,50 €
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* shipping strip — the small print a shop lives on */}
      {!compact ? (
        <div
          className="relative z-10 grid grid-cols-2 gap-px border-t border-[#2A1D14]/20 bg-[#2A1D14]/20 text-[0.56rem] md:grid-cols-4"
          style={MONO}
        >
          {[
            ["PRAŽÍME", "utorok a piatok"],
            ["ODOSIELAME", "do 24 h od praženia"],
            ["DOPRAVA", "zdarma od 40 €"],
            ["PREDPLATNÉ", "každé 2 alebo 4 týždne"],
          ].map(([n, l]) => (
            <div key={n} className="flex flex-col gap-0.5 bg-[#F4EFE6] px-4 py-3">
              <span className="tracking-[0.14em] text-[#C4531F]">{n}</span>
              <span className="tracking-[0.04em] text-[#2A1D14]/60">{l}</span>
            </div>
          ))}
        </div>
      ) : null}
    </WorldShell>
  )
}

/* ------------------------------------------------------------- ŠTATÚT --- *
   Law practice. The mechanic is ENQUIRE, and the trust requirement is the
   highest of the three. Modern here means contemporary INSTITUTIONAL —
   typography, grid discipline and restraint — not cinematic. A practice that
   looks like a product launch loses the client at the first frame. This is
   also the act's still moment: no motion at rest, by design. */

export function StatutWorld({ compact = false }: { compact?: boolean }) {
  return (
    <WorldShell
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "#EDEDEA", color: "#14161A" }}
    >
      {/* the slow scanning hairline: an engineer reading the document */}
      <div aria-hidden="true" className="wscan" />
      {/* flat, even, frontal — deliberately the least lit world of the three */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 40%, rgba(20,22,26,0.05) 100%)",
        }}
      />
      {/* a single hairline column grid — the document's skeleton, visible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(20,22,26,0.07) 1px, transparent 1px)",
          backgroundSize: "12.5% 100%",
        }}
      />

      {!compact ? (
        <GhostNumeral n="02" color="rgba(20,22,26,0.045)" className="bottom-[-0.08em] left-[-0.03em]" />
      ) : null}

      <WorldMeta index="02" name="ŠTATÚT" sector="ADVOKÁTSKA KANCELÁRIA" ink="#14161A" compact={compact} />

      {/* masthead, not a nav bar */}
      <div className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] border-y border-[#14161A]/30 py-3">
        <div className="flex items-baseline justify-between">
          <span style={{ ...SERIF_I, fontSize: "1.3rem", letterSpacing: "0.02em" }}>
            Štatút<span className="text-[#6E1F26]">.</span>
          </span>
          {!compact ? (
            <div
              className="hidden gap-6 text-[0.58rem] tracking-[0.18em] text-[#14161A]/60 lg:flex"
              style={MONO}
            >
              <span>PRAX</span>
              <span>TÍM</span>
              <span>PUBLIKÁCIE</span>
              <span>KONTAKT</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 gap-[clamp(1rem,3vw,3rem)] px-[clamp(1.1rem,3.2vw,3rem)] py-[clamp(0.9rem,2.2vh,2rem)]">
        {/* left: the index. Density IS the competence signal here. */}
        <div className={compact ? "min-w-0 flex-1" : "min-w-0 flex-[1.15]"}>
          <p className="text-[0.56rem] tracking-[0.24em] text-[#14161A]/50" style={MONO}>
            OBLASTI PRAXE
          </p>
          <ul className="mt-3 border-t border-[#14161A]/25">
            {[
              ["01", "Obchodné právo", "zmluvy · korporátne štruktúry · M&A"],
              ["02", "Nehnuteľnosti", "prevody · vecné bremená · development"],
              ["03", "Pracovné právo", "ukončenia · spory · interné predpisy"],
              ["04", "Súdne spory", "zastupovanie · rozhodcovské konania"],
              ["05", "Insolvencia", "reštrukturalizácia · konkurz"],
            ]
              .slice(0, compact ? 3 : 5)
              .map(([n, title, sub], rowI) => (
                <li
                  key={n}
                  className="wfx flex items-baseline gap-4 border-b border-[#14161A]/15 py-[clamp(0.4rem,1.1vh,0.75rem)]"
                  style={fx(rowI + 1)}
                >
                  <span className="tnum text-[0.62rem] text-[#6E1F26]" style={MONO}>
                    {n}
                  </span>
                  <div className="min-w-0">
                    <p style={{ ...SERIF_I, fontSize: "clamp(0.95rem,1.5vw,1.35rem)", lineHeight: 1.15 }}>
                      {title}
                    </p>
                    {!compact ? (
                      <p className="mt-0.5 text-[0.62rem] tracking-[0.02em] text-[#14161A]/55">{sub}</p>
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* right: the statement and the quiet ask */}
        <div className={`wfx ${compact ? "hidden" : "flex min-w-0 flex-1 flex-col justify-between"}`} style={fx(3)}>
          <div>
            <p
              style={{
                ...SERIF_I,
                fontSize: "clamp(1.5rem,3.1vw,3.1rem)",
                lineHeight: 1.06,
                letterSpacing: "-0.01em",
              }}
            >
              Právo je nástroj.
              <br />
              Používame ho presne.
            </p>
            <p className="mt-4 max-w-[24rem] text-[0.8rem] leading-relaxed text-[#14161A]/70">
              Kancelária so zameraním na obchodné a majetkové vzťahy. Zastupujeme
              spoločnosti pri transakciách, sporoch a každodennej prevádzke.
            </p>
          </div>

          {/* tabular figures — the numeric voice of an institution */}
          <div className="mt-5 border-t border-[#14161A]/25 pt-4">
            <div className="grid grid-cols-3 gap-4 text-[0.58rem]" style={MONO}>
              {[
                ["1998", "ZALOŽENÁ"],
                ["14", "ADVOKÁTOV"],
                ["SK · CZ", "JURISDIKCIE"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="tnum text-[1.15rem] tracking-normal">{v}</p>
                  <p className="mt-0.5 tracking-[0.14em] text-[#14161A]/50">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-4">
              <span
                className="px-5 py-2.5 text-[0.64rem] tracking-[0.1em]"
                style={{ background: "#14161A", color: "#EDEDEA" }}
              >
                NEZÁVÄZNÁ KONZULTÁCIA
              </span>
              <span className="text-[0.62rem] text-[#14161A]/60" style={MONO}>
                +421 · po–pi 9:00–17:00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* jurisdiction strip — the institutional footer, set as a record */}
      {!compact ? (
        <div
          className="relative z-10 flex items-center justify-between border-t border-[#14161A]/25 px-[clamp(1.1rem,3.2vw,3rem)] py-2.5 text-[0.54rem] tracking-[0.14em] text-[#14161A]/55"
          style={MONO}
        >
          <span>SLOVENSKÁ ADVOKÁTSKA KOMORA · ZAPÍSANÁ</span>
          <span className="hidden md:inline">MLČANLIVOSŤ · POISTENIE ZODPOVEDNOSTI</span>
          <span>BRATISLAVA · KOŠICE</span>
        </div>
      ) : null}
    </WorldShell>
  )
}

/* --------------------------------------------------------------- VLNA --- *
   Wellness studio. The mechanic is BOOK, and the schedule IS the product, so
   it appears immediately instead of hiding behind a "Rozvrh" link. The only
   world where the accent is allowed to shout, and the brightest surface in
   the whole journey — which is what makes the act resolve upward. */

export function VlnaWorld({ compact = false }: { compact?: boolean }) {
  const slots = [
    ["07:00", "Mobilita", "4 miesta"],
    ["09:30", "Pilates", "2 miesta"],
    ["17:15", "Joga flow", "voľné"],
    ["19:00", "Dych a regenerácia", "1 miesto"],
  ]

  return (
    <WorldShell
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "#FBFAF7", color: "#123B3A" }}
    >
      {/* high, open light — the brightest ground in the journey */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(95% 70% at 78% 0%, rgba(216,242,75,0.4) 0%, transparent 60%), radial-gradient(80% 60% at 5% 100%, rgba(18,59,58,0.09) 0%, transparent 62%)",
        }}
      />
      {/* motion-path arcs: decoration, never content */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]"
      >
        <g fill="none" stroke="#123B3A" strokeOpacity="0.14" strokeWidth="1.2">
          <path className="wdraw" pathLength={1} style={fx(1)} d="M-20 220 C 90 150, 150 250, 260 170 S 400 120, 440 160" />
          <path className="wdraw" pathLength={1} style={fx(3)} d="M-20 250 C 90 180, 150 280, 260 200 S 400 150, 440 190" />
          <path className="wdraw" pathLength={1} style={fx(5)} d="M-20 190 C 90 120, 150 220, 260 140 S 400 90, 440 130" />
        </g>
      </svg>

      {!compact ? (
        <GhostNumeral n="03" color="rgba(18,59,58,0.055)" className="right-[-0.02em] bottom-[-0.1em]" />
      ) : null}

      <WorldMeta index="03" name="VLNA" sector="WELLNESS A POHYB" ink="#123B3A" compact={compact} />

      <div className="relative z-10 mx-[clamp(1.1rem,3.2vw,3rem)] flex items-center justify-between border-b border-[#123B3A]/20 pb-3">
        <span
          className="font-semibold"
          style={{ ...GROT_B, fontSize: "1.15rem", letterSpacing: "-0.01em" }}
        >
          VLNA
        </span>
        {!compact ? (
          <div
            className="hidden gap-7 text-[0.6rem] tracking-[0.18em] text-[#123B3A]/60 lg:flex"
            style={MONO}
          >
            <span>ROZVRH</span>
            <span>LEKTORI</span>
            <span>ČLENSTVO</span>
          </div>
        ) : null}
        <span
          className="rounded-full px-5 py-1.5 text-[0.64rem] font-semibold tracking-[0.08em]"
          style={{ background: "#D8F24B", color: "#123B3A" }}
        >
          REZERVOVAŤ
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-[clamp(1.1rem,3.2vw,3rem)] py-[clamp(0.9rem,2.2vh,2rem)]">
        <p
          className="wfx font-semibold uppercase"
          style={{
            fontSize: compact ? "clamp(2rem,8.5vw,3rem)" : "clamp(2.4rem,6vw,6.4rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            ...GROT_B,
            ...fx(0),
          }}
        >
          Začnite
          <br />
          vo štvrtok.
        </p>

        {/* the timetable — the whole argument of the site */}
        <div className="mt-[clamp(0.8rem,2.4vh,1.6rem)]">
          <div className="wfx flex gap-1.5" style={fx(1)}>
            {["PO", "UT", "ST", "ŠT", "PI", "SO"].map((d, i) => (
              <span
                key={d}
                className="rounded-full px-3 py-1 text-[0.58rem] tracking-[0.12em]"
                style={
                  i === 3
                    ? { background: "#123B3A", color: "#FBFAF7" }
                    : { background: "rgba(18,59,58,0.07)", color: "rgba(18,59,58,0.65)" }
                }
              >
                {d}
              </span>
            ))}
          </div>

          <ul className="mt-3 grid gap-1.5">
            {slots.slice(0, compact ? 3 : 4).map(([time, name, free], slotI) => (
              <li
                key={time}
                className="wfx flex items-center gap-4 rounded-[6px] border border-[#123B3A]/15 bg-white/70 px-4 py-[clamp(0.4rem,1.1vh,0.7rem)]"
                style={fx(slotI + 2)}
              >
                <span className="tnum text-[0.85rem] font-semibold" style={MONO}>
                  {time}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.9rem] font-medium">{name}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.56rem] tracking-[0.1em] ${free === "voľné" ? "wpulse" : ""}`}
                  style={
                    free === "voľné"
                      ? { background: "#D8F24B", color: "#123B3A" }
                      : { background: "rgba(18,59,58,0.08)", color: "rgba(18,59,58,0.7)" }
                  }
                >
                  {free.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* membership tiers — the second mechanic behind the first */}
        {!compact ? (
          <div className="wfx mt-[clamp(0.8rem,2.2vh,1.4rem)] grid grid-cols-3 gap-[clamp(0.5rem,1.2vw,1rem)]" style={fx(6)}>
            {[
              ["JEDNORAZOVO", "12 €", "za lekciu"],
              ["8 LEKCIÍ", "79 €", "platnosť 60 dní"],
              ["NEOBMEDZENE", "119 €", "mesačne"],
            ].map(([tier, price, note], i) => (
              <div
                key={tier}
                className="rounded-[6px] px-4 py-3"
                style={
                  i === 2
                    ? { background: "#123B3A", color: "#FBFAF7" }
                    : { border: "1px solid rgba(18,59,58,0.18)" }
                }
              >
                <p className="text-[0.54rem] tracking-[0.16em] opacity-70" style={MONO}>
                  {tier}
                </p>
                <p className="mt-1 text-[1.3rem] font-semibold" style={GROT_B}>
                  {price}
                </p>
                <p className="text-[0.58rem] opacity-65">{note}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {!compact ? (
        <div
          className="relative z-10 flex items-center justify-between border-t border-[#123B3A]/20 px-[clamp(1.1rem,3.2vw,3rem)] py-2.5 text-[0.54rem] tracking-[0.14em] text-[#123B3A]/60"
          style={MONO}
        >
          <span>ZRUŠENIE ZDARMA DO 12 H PRED LEKCIOU</span>
          <span className="hidden md:inline">PRVÁ LEKCIA ZA 6 €</span>
          <span>ŠTÚDIO · 9 LEKTOROV</span>
        </div>
      ) : null}
    </WorldShell>
  )
}
