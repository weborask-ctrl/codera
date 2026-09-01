"use client"

/**
 * ŠTATÚT — the law practice concept as a full site (AD v3 amendment 2).
 *
 * Contemporary institutional, browsable: masthead hero, the full practice
 * index as the document it should be, the numbers band, publications, the
 * consultation close. Instrument Serif voice, stone/ink/oxblood climate.
 * Motion is restrained BY CONTRACT — staggered reveals, the slow scanning
 * hairline, nothing else; its stillness against the other two concepts is
 * the proof of range. The mechanic is ENQUIRE.
 */

import { fx, INST, MONO, Shell } from "./shell"

const STONE = "#EDEDEA"
const INK = "#14161A"
const OX = "#6E1F26"

const PRACTICE = [
  ["01", "Obchodné právo", "zmluvy · korporátne štruktúry · M&A", "Od zakladateľskej zmluvy po predaj firmy. Vedieme transakcie tak, aby ste podpisovali s pokojom."],
  ["02", "Nehnuteľnosti", "prevody · vecné bremená · development", "Kúpa, predaj a výstavba bez skrytých vád — právnych aj tých v katastri."],
  ["03", "Pracovné právo", "ukončenia · spory · interné predpisy", "Poriadok vo vzťahoch so zamestnancami skôr, než ho bude vymáhať súd."],
  ["04", "Súdne spory", "zastupovanie · rozhodcovské konania", "Keď rokovanie skončilo. Pripravení, vecní, bez divadla."],
  ["05", "Insolvencia", "reštrukturalizácia · konkurz", "Aj koniec sa dá urobiť poriadne — pre veriteľov aj pre dlžníka."],
] as const

export function StatutHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: STONE, color: INK }}
    >
      <div aria-hidden="true" className="wscan" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 40%, rgba(20,22,26,0.06) 100%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: "linear-gradient(to right, rgba(20,22,26,0.07) 1px, transparent 1px)", backgroundSize: "12.5% 100%" }}
      />
      <span
        aria-hidden="true"
        className="wpar pointer-events-none absolute bottom-[-0.12em] left-[-0.02em] select-none"
        style={{ ...INST, fontSize: "clamp(11rem,30vh,24rem)", lineHeight: 0.8, color: "rgba(20,22,26,0.045)", ["--depth" as string]: "22" }}
      >
        §
      </span>

      <header className={`relative z-10 mx-[clamp(1.25rem,4vw,4rem)] border-b border-[#14161A]/30 ${portal ? "pt-6" : "pt-14"} pb-4`}>
        <div className="flex items-baseline justify-between">
          <span style={{ ...INST, fontSize: "1.5rem" }}>
            Kancelária<span style={{ color: OX }}>.</span>
          </span>
          <nav className="hidden gap-6 text-[0.58rem] tracking-[0.18em] text-[#14161A]/60 md:flex" style={MONO}>
            <span>PRAX</span>
            <span>TÍM</span>
            <span>PUBLIKÁCIE</span>
            <span>KONTAKT</span>
          </nav>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-[clamp(1.25rem,4vw,4rem)] py-10">
        <p className="wfx text-[0.6rem] tracking-[0.26em] text-[#14161A]/55" style={{ ...MONO, ...fx(0) }}>
          ADVOKÁTSKA KANCELÁRIA · OD ROKU 1998
        </p>
        <h1 className="wfx mt-4 max-w-[11em]" style={{ ...INST, fontSize: "clamp(2.6rem,6.6vw,6rem)", lineHeight: 1.02, letterSpacing: "-0.01em", ...fx(1) }}>
          Právo je nástroj. Používame ho presne.
        </h1>
        <p className="wfx mt-6 max-w-[30rem] text-[0.95rem] leading-[1.7] text-[#14161A]/70" style={fx(2)}>
          Kancelária pre obchodné a majetkové vzťahy. Zastupujeme spoločnosti
          pri transakciách, sporoch a každodennej prevádzke — čísla, termíny a
          záznamy namiesto prívlastkov.
        </p>
        <div className="wfx mt-8 flex flex-wrap items-center gap-5" style={fx(3)}>
          <span className="px-6 py-3 text-[0.66rem] tracking-[0.1em]" style={{ ...MONO, background: INK, color: STONE }}>
            NEZÁVÄZNÁ KONZULTÁCIA
          </span>
          <span className="text-[0.64rem] text-[#14161A]/60" style={MONO}>
            +421 · po–pi 9:00–17:00
          </span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-px border-t border-[#14161A]/25 bg-[#14161A]/15 text-[0.56rem]" style={MONO}>
        {[
          ["1998", "ZALOŽENÁ"],
          ["14", "ADVOKÁTOV"],
          ["SK · CZ", "JURISDIKCIE"],
        ].map(([v, l], i) => (
          <div key={l} className="wfx px-5 py-4" style={{ background: STONE, ...fx(i + 3) }}>
            <p className="tnum text-[1.2rem] tracking-normal">{v}</p>
            <p className="mt-0.5 tracking-[0.16em] text-[#14161A]/50">{l}</p>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export default function StatutSite() {
  return (
    <main style={{ background: STONE, color: INK }}>
      <StatutHero />

      {/* ---- the practice index, as a document ---- */}
      <Shell className="px-[clamp(1.25rem,4vw,4rem)] py-[10svh]">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <p className="wfx text-[0.6rem] tracking-[0.26em] text-[#14161A]/55" style={{ ...MONO, ...fx(0) }}>
            OBLASTI PRAXE
          </p>
          <ol className="max-w-[52rem] border-t border-[#14161A]/25">
            {PRACTICE.map(([n, title, tags, body], i) => (
              <li key={n} className="wfx grid gap-x-6 border-b border-[#14161A]/15 py-7 md:grid-cols-[3rem_16rem_1fr]" style={fx(i + 1)}>
                <span className="tnum text-[0.7rem] text-[#6E1F26]" style={MONO}>
                  {n}
                </span>
                <div>
                  <p style={{ ...INST, fontSize: "1.5rem", lineHeight: 1.1 }}>{title}</p>
                  <p className="mt-1 text-[0.6rem] tracking-[0.06em] text-[#14161A]/50" style={MONO}>
                    {tags}
                  </p>
                </div>
                <p className="mt-3 max-w-[30rem] text-[0.88rem] leading-[1.65] text-[#14161A]/70 md:mt-0">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Shell>

      {/* ---- publications ---- */}
      <Shell className="border-y border-[#14161A]/20 px-[clamp(1.25rem,4vw,4rem)] py-[9svh]" style={{ background: "#E4E4E0" }}>
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <p className="wfx text-[0.6rem] tracking-[0.26em] text-[#14161A]/55" style={{ ...MONO, ...fx(0) }}>
            Z PUBLIKÁCIÍ
          </p>
          <div className="grid max-w-[52rem] gap-px bg-[#14161A]/15 sm:grid-cols-3">
            {[
              ["2026", "Zodpovednosť konateľa po novele Obchodného zákonníka"],
              ["2025", "Vecné bremená v developerskej praxi — dvanásť rozhodnutí"],
              ["2025", "Rozhodcovské doložky, ktoré obstoja"],
            ].map(([y, t], i) => (
              <article key={t} className="wfx px-5 py-5" style={{ background: "#E4E4E0", ...fx(i + 1) }}>
                <p className="tnum text-[0.62rem] text-[#6E1F26]" style={MONO}>
                  {y}
                </p>
                <p className="mt-2 text-[0.95rem] leading-[1.45]" style={INST}>
                  {t}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Shell>

      {/* ---- close ---- */}
      <Shell className="px-[clamp(1.25rem,4vw,4rem)] py-[11svh]">
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 className="wfx" style={{ ...INST, fontSize: "clamp(1.9rem,4.2vw,3.6rem)", lineHeight: 1.05, ...fx(0) }}>
            Prvá konzultácia je o vašom probléme, nie o našom cenníku.
          </h2>
          <div className="wfx mt-8 flex flex-wrap items-center justify-center gap-5" style={fx(1)}>
            <span className="px-7 py-3.5 text-[0.66rem] tracking-[0.1em]" style={{ ...MONO, background: INK, color: STONE }}>
              DOHODNÚŤ TERMÍN
            </span>
            <span className="text-[0.64rem] text-[#14161A]/60" style={MONO}>
              ODPOVEDÁME DO 24 HODÍN
            </span>
          </div>
        </div>
      </Shell>

      <footer className="border-t border-[#14161A]/25 px-[clamp(1.25rem,4vw,4rem)] py-5 text-[0.54rem] tracking-[0.14em] text-[#14161A]/55" style={MONO}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span>SLOVENSKÁ ADVOKÁTSKA KOMORA · ZAPÍSANÁ</span>
          <span>BRATISLAVA · KOŠICE</span>
        </div>
      </footer>
    </main>
  )
}
