"use client"

/**
 * Art Direction v2 — /02 PREMENA as a full-viewport transformation.
 *
 * The ENTIRE viewport is the company's digital presence: the believable
 * average site on the left is wiped away by the metal seam, revealing a
 * genuinely premium after-state (Superhuman's parchment + glass cards,
 * Wealthsimple's serif moments). No browser chrome floating in a void —
 * the environment itself transforms (VISIONNAIRE's hard split, Martin
 * Laxenaire's collision). Below lg it becomes a tap-switched trailer.
 */

import { useState } from "react"

const MONO = { fontFamily: "var(--font-geist-mono)" }
const SERIF = { fontFamily: "var(--font-fraunces), Georgia, serif" }

/* ------------------------------------------------- BEFORE (believable) --- */

export function BilancBefore() {
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "#eef1f5", color: "#334155" }}>
      <div className="flex items-center justify-between border-b border-[#dbe2ea] bg-white px-[clamp(1rem,3vw,2.6rem)] py-4">
        <p className="text-[0.95rem] font-bold text-[#1e4ed8]">
          BILANC <span className="text-[0.7rem] font-normal text-[#64748b]">účtovníctvo s.r.o.</span>
        </p>
        <div className="hidden gap-5 text-[0.68rem] text-[#475569] md:flex">
          <span>Domov</span>
          <span>Služby</span>
          <span>Cenník</span>
          <span>O nás</span>
          <span>Kontakt</span>
        </div>
        <span className="rounded-[6px] bg-[#2563eb] px-4 py-2 text-[0.68rem] font-medium text-white">
          Cenová ponuka
        </span>
      </div>

      <div className="flex flex-1 items-center gap-8 px-[clamp(1rem,3vw,2.6rem)]">
        <div className="max-w-[30em] flex-1">
          <p className="text-[clamp(1.3rem,2.4vw,2.1rem)] leading-snug font-bold text-[#0f172a]">
            Spoľahlivé účtovníctvo pre firmy a živnostníkov
          </p>
          <p className="mt-3 text-[0.78rem] leading-relaxed text-[#64748b]">
            Poskytujeme komplexné účtovné služby, spracovanie miezd a daňové
            priznania. Pôsobíme na trhu už od roku 2009 a staráme sa o viac
            ako 120 klientov.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="rounded-[6px] bg-[#2563eb] px-5 py-2.5 text-[0.72rem] font-medium text-white">
              Získať ponuku
            </span>
            <span className="rounded-[6px] border border-[#cbd5e1] bg-white px-5 py-2.5 text-[0.72rem] text-[#475569]">
              Viac o nás
            </span>
          </div>
        </div>
        <div className="hidden w-[34%] md:block">
          <div
            className="flex aspect-[4/3] items-center justify-center rounded-[8px]"
            style={{ background: "linear-gradient(140deg,#cfd8e3 0%,#aebccd 100%)" }}
          >
            <svg viewBox="0 0 48 48" className="h-12 w-12 opacity-40" aria-hidden="true">
              <rect x="6" y="10" width="36" height="28" rx="2" fill="none" stroke="#334155" strokeWidth="2" />
              <circle cx="16" cy="20" r="3" fill="#334155" />
              <path d="M6 34 L20 24 L28 30 L42 18" stroke="#334155" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-[clamp(1rem,3vw,2.6rem)] pb-6">
        {[
          ["Podvojné účtovníctvo", "Kompletné vedenie účtovníctva"],
          ["Mzdy a personalistika", "Spracovanie miezd na kľúč"],
          ["Daňové priznania", "DPH, DzP a ročné zúčtovania"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-[8px] border border-[#e2e8f0] bg-white p-4">
            <div className="mb-2 h-6 w-6 rounded-full bg-[#dbeafe]" />
            <p className="text-[0.7rem] font-semibold text-[#0f172a]">{t}</p>
            <p className="mt-1 text-[0.6rem] leading-snug text-[#64748b]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------- AFTER (Codera úroveň) --- */

export function BilancAfter() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ background: "#f3efe6", color: "#20312a" }}>
      {/* window-light field (Superhuman's golden-hour substitute) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-[52%]"
        style={{
          background:
            "radial-gradient(75% 60% at 70% 30%, rgba(214,192,142,0.55) 0%, transparent 62%), radial-gradient(60% 70% at 85% 75%, rgba(30,61,47,0.16) 0%, transparent 60%), linear-gradient(115deg, transparent 0%, rgba(255,252,244,0.65) 55%)",
        }}
      />
      {/* window-frame shadows raking across the room — the light has a
          SOURCE now (Superhuman's photographic golden hour, drawn) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(104deg, transparent 0%, transparent 55%, rgba(32,49,42,0.055) 55.5%, rgba(32,49,42,0.055) 60%, transparent 60.5%, transparent 68%, rgba(32,49,42,0.05) 68.5%, rgba(32,49,42,0.05) 74%, transparent 74.5%, transparent 84%, rgba(32,49,42,0.045) 84.5%, rgba(32,49,42,0.045) 91%, transparent 91.5%)",
        }}
      />
      {/* paper grain — kills the 'flat vector' feel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-[clamp(1rem,3vw,2.6rem)] pt-6">
        <span className="text-[1rem] font-semibold tracking-[0.3em]">BILANC</span>
        <div className="hidden gap-7 text-[0.58rem] tracking-[0.22em] text-[#20312a]/55 md:flex" style={MONO}>
          <span>SLUŽBY</span>
          <span>CENNÍK</span>
          <span>KONTAKT</span>
        </div>
        <span className="rounded-full bg-[#20312a] px-4.5 py-2 text-[0.62rem] font-medium text-[#f3efe6]">
          Konzultácia
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center px-[clamp(1rem,3vw,2.6rem)]">
        <div className="max-w-[30em] flex-1">
          <p className="mb-3 text-[0.58rem] tracking-[0.3em] text-[#b08d4a]" style={MONO}>
            ÚČTOVNÍCTVO · MZDY · DANE — OD ROKU 2009
          </p>
          <p style={{ ...SERIF, fontSize: "clamp(1.7rem,3.1vw,3.2rem)", lineHeight: 1.04, letterSpacing: "-0.015em" }}>
            Čísla, na ktoré sa dá
            <br />
            postaviť <em className="text-[#b08d4a]">rozhodnutie.</em>
          </p>
          <p className="mt-4 max-w-[26em] text-[0.72rem] leading-relaxed text-[#20312a]/70">
            Podvojné účtovníctvo, mzdy a daňové priznania pre malé a stredné
            firmy — s termínmi, ktoré platia.
          </p>
          <div className="mt-6 flex items-center gap-5">
            <span className="rounded-full bg-[#20312a] px-6 py-2.5 text-[0.66rem] font-medium text-[#f3efe6]">
              Nezáväzná konzultácia
            </span>
            <span className="text-[0.66rem] text-[#20312a]/60 underline underline-offset-4">Cenník</span>
          </div>
        </div>

        {/* glass ledger cards floating in the light */}
        <div className="relative hidden w-[40%] self-stretch md:block">
          <div
            className="absolute top-[16%] right-0 w-[78%] rounded-[10px] border border-white/80 p-5"
            style={{ background: "rgba(255,253,247,0.7)", backdropFilter: "blur(12px)", boxShadow: "0 26px 60px rgba(32,49,42,0.14)" }}
          >
            <p className="text-[0.54rem] tracking-[0.24em] text-[#20312a]/50" style={MONO}>
              PREHĽAD KLIENTA — SEPTEMBER
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[1.5rem] font-semibold tracking-[-0.02em]">12 480 €</span>
              <span className="rounded-full bg-[#2e7d54]/12 px-2.5 py-1 text-[0.54rem] font-medium text-[#2e7d54]">
                DPH podané ✓
              </span>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-[#20312a]/10 pt-3 text-[0.6rem] text-[#20312a]/70">
              <div className="flex justify-between"><span>Mzdy — 8 zamestnancov</span><span>spracované</span></div>
              <div className="flex justify-between"><span>Daňový kalendár</span><span>3 termíny</span></div>
            </div>
          </div>
          <div
            className="absolute bottom-[10%] left-[4%] rounded-[10px] border border-white/80 px-4 py-3 text-[0.6rem]"
            style={{ background: "rgba(255,253,247,0.85)", backdropFilter: "blur(10px)", boxShadow: "0 16px 40px rgba(32,49,42,0.16)" }}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#2e7d54] align-middle" />
            Odpoveď účtovníčky do 48 h
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-[#20312a]/12">
        <div className="grid grid-cols-3 gap-px bg-[#20312a]/12 md:ml-[38%]">
          {[
            ["120+", "firiem v starostlivosti"],
            ["17", "rokov praxe"],
            ["48 h", "reakcia na dopyt"],
          ].map(([n, l]) => (
            <div key={l} className="bg-[#f3efe6] px-4 py-3">
              <p className="text-[1rem] font-semibold">{n}</p>
              <p className="mt-0.5 text-[0.52rem] tracking-[0.1em] text-[#20312a]/55" style={MONO}>
                {l.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- the act --- */

export function ActPremena() {
  const [mobileState, setMobileState] = useState<"pred" | "po">("po")
  return (
    <section data-zone="premena" data-zone-sticky id="premena" className="relative lg:h-[220svh]">
      {/* lg+: the full-viewport wipe. Each layer is isolated so the
          after-state's internal z-10 content cannot escape above the
          before layer (stacking-context leak). */}
      <div className="sticky top-0 hidden h-svh overflow-hidden lg:block">
        <div className="absolute inset-0 isolate z-0">
          <BilancAfter />
        </div>
        <div
          className="absolute inset-0 isolate z-10"
          style={{ clipPath: "polygon(0 0, calc(112% * (1 - var(--fold, 0)) - 6%) 0, calc(100% * (1 - var(--fold, 0)) - 6%) 100%, 0 100%)" }}
        >
          <BilancBefore />
        </div>
        {/* the metal seam sweeping the whole viewport */}
        <div
          className="absolute inset-y-0 z-20 w-full"
          style={{
            clipPath:
              "polygon(calc(112% * (1 - var(--fold, 0)) - 6.45%) 0, calc(112% * (1 - var(--fold, 0)) - 5.55%) 0, calc(100% * (1 - var(--fold, 0)) - 5.55%) 100%, calc(100% * (1 - var(--fold, 0)) - 6.45%) 100%)",
            background: "linear-gradient(180deg,#f2f4f6 0%,#c4c9d1 40%,#6e7480 100%)",
            boxShadow: "0 0 40px rgba(20,20,24,0.35)",
          }}
        />

        {/* act signage */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-20 mix-blend-difference" style={{ color: "#f2f4f6" }}>
          <p className="text-[0.62rem] tracking-[0.3em]" style={MONO}>
            02 — PREMENA VNÍMANIA
          </p>
          <p className="text-[0.62rem] tracking-[0.14em] opacity-80" style={MONO}>
            TÁ ISTÁ FIRMA · TEN ISTÝ OBSAH
          </p>
        </div>

        {/* exhibition rail (ORYZO) */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 z-30 hidden -translate-y-1/2 text-[0.54rem] tracking-[0.34em] mix-blend-difference lg:block"
          style={{ writingMode: "vertical-rl", color: "rgba(244,241,234,0.4)", ...MONO }}
        >
          /02 — PREMENA
        </p>

        {/* the statement enters once the wipe has completed */}
        <div className="wipe-statement pointer-events-none absolute bottom-[6svh] left-[clamp(1.25rem,4vw,3.5rem)] z-30">
          <p
            className="max-w-[9em] font-semibold text-[#20312a]"
            style={{ fontSize: "clamp(2rem,4.4vw,4.4rem)", lineHeight: 0.98, letterSpacing: "-0.035em" }}
          >
            Rovnaká firma.{" "}
            <br />
            Úplne iný dojem.
          </p>
          <p className="mt-2 text-[0.6rem] tracking-[0.18em] text-[#20312a]/70" style={MONO}>
            BILANC — FIKTÍVNY KLIENT NA UKÁŽKU PREMENY
          </p>
        </div>
      </div>

      {/* below lg: cinematic tap-switch trailer */}
      <div className="lg:hidden" style={{ background: "#EDF0F3" }}>
        <div className="flex items-baseline justify-between px-[clamp(1.1rem,4vw,2rem)] pt-20 pb-3 text-[#17181d]">
          <p className="text-[0.62rem] tracking-[0.28em]" style={MONO}>
            02 — PREMENA VNÍMANIA
          </p>
        </div>
        <h2
          className="px-[clamp(1.1rem,4vw,2rem)] pb-4 font-semibold text-[#17181d]"
          style={{ fontSize: "clamp(1.7rem,7vw,2.6rem)", lineHeight: 0.98, letterSpacing: "-0.03em" }}
        >
          Rovnaká firma.{" "}
          <br />
          Úplne iný dojem.
        </h2>
        <div className="px-[clamp(1.1rem,4vw,2rem)] pb-2">
          <div className="inline-flex rounded-full border border-black/20 bg-white/60 p-1 text-[0.62rem]" style={MONO}>
            <button
              type="button"
              onClick={() => setMobileState("pred")}
              className={`rounded-full px-4 py-1.5 tracking-[0.14em] ${mobileState === "pred" ? "bg-[#17181d] text-[#EDF0F3]" : "text-[#17181d]/60"}`}
            >
              PREDTÝM
            </button>
            <button
              type="button"
              onClick={() => setMobileState("po")}
              className={`rounded-full px-4 py-1.5 tracking-[0.14em] ${mobileState === "po" ? "bg-[#17181d] text-[#EDF0F3]" : "text-[#17181d]/60"}`}
            >
              POTOM
            </button>
          </div>
        </div>
        <div className="relative mx-[clamp(1.1rem,4vw,2rem)] mb-6 h-[62svh] overflow-hidden rounded-[10px] shadow-[0_24px_60px_rgba(20,20,25,0.2)]">
          <div className="absolute inset-0 isolate z-0 transition-opacity duration-500" style={{ opacity: mobileState === "po" ? 1 : 0 }}>
            <BilancAfter />
          </div>
          <div className="absolute inset-0 isolate z-10 transition-opacity duration-500" style={{ opacity: mobileState === "pred" ? 1 : 0 }}>
            <BilancBefore />
          </div>
        </div>
        <p className="px-[clamp(1.1rem,4vw,2rem)] pb-8 text-[0.56rem] tracking-[0.16em] text-[#17181d]/50" style={MONO}>
          BILANC — FIKTÍVNY KLIENT NA UKÁŽKU PREMENY
        </p>
      </div>
    </section>
  )
}
