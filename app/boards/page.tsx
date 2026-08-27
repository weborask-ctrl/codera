"use client"

/**
 * Step 5 Phase B — static composition boards for /01–/05.
 *
 * Dev-only route (not linked from the site). Each board is a full-viewport
 * STATIC composition — the "static frame test" artifact for the intended
 * reading moment of its narrative state. No motion, no WebGL: the ribbon
 * appears as the approved 2D metal mark standing in for the held 3D frame.
 *
 * ?s=01 | 02 | 03a | 03b | 03c | 04 | 05   (default 01)
 *
 * Device variants come from the viewport itself (capture at 1440/768/390);
 * compositions re-author below the lg/md breakpoints rather than shrink.
 * Design reasoning: CODERA_STEP5_DESIGN_BRIEF.md.
 */

import { useEffect, useState } from "react"

const INK_DARK = "#16171b"
const PAPER = "#f2f0ea"

function useParam(name: string, fallback: string) {
  const [v, setV] = useState(fallback)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get(name)
    const t = setTimeout(() => {
      if (p) {
        setV(p)
      }
    }, 0)
    return () => clearTimeout(t)
  }, [name])
  return v
}

/* ---------------------------------------------------------------- /01 --- */

function Board01() {
  return (
    <section
      className="relative flex h-svh flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 18% 8%, oklch(0.30 0.012 85) 0%, oklch(0.185 0.005 250) 34%, oklch(0.148 0.0035 250) 68%)",
        color: "#f4f1ea",
      }}
    >
      {/* Nav strip */}
      <header className="flex items-center justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-6">
        <div className="flex items-center gap-3">
          <img src="/brand/codera-mark.svg" alt="" className="h-6 w-6" />
          <span className="text-[0.8rem] font-semibold tracking-[0.34em]">CODERA</span>
        </div>
        <nav className="hidden items-center gap-8 text-[0.72rem] tracking-[0.22em] text-white/60 md:flex">
          <span>01 PRÁCA</span>
          <span>02 SLUŽBY</span>
          <span>03 KONTAKT</span>
        </nav>
        <span className="rounded-full bg-[#f4f1ea] px-4 py-2 text-[0.72rem] font-medium tracking-[0.08em] text-[#16171b]">
          Začať projekt
        </span>
      </header>

      {/* The C — held frame of the 3D reveal, cropped by the right edge */}
      <img
        src="/brand/codera-mark.svg"
        alt=""
        className="pointer-events-none absolute top-1/2 right-[-14vmin] w-[74vmin] max-w-none -translate-y-1/2 opacity-95 md:right-[-10vmin] md:w-[78vmin]"
        style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.55))" }}
      />

      {/* Statement — overlaps the ribbon: type in front of the world */}
      <div className="relative z-10 mt-auto mb-[9svh] px-[clamp(1.25rem,4vw,3.5rem)]">
        <p className="mb-5 text-[0.72rem] tracking-[0.3em] text-white/55">
          KREATÍVNE WEBOVÉ ŠTÚDIO
        </p>
        <h1
          className="max-w-[11em] font-semibold"
          style={{
            fontSize: "clamp(2.4rem, 6.6vw, 6.9rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
          }}
        >
          Vaša firma je lepšia,
          <br />
          než ukazuje váš web.
        </h1>
        <div className="mt-7 flex flex-wrap items-center gap-6">
          <span className="rounded-full bg-[#f4f1ea] px-6 py-3 text-[0.85rem] font-medium text-[#16171b]">
            Začať projekt
          </span>
          <span className="border-b border-white/35 pb-0.5 text-[0.85rem] text-white/80">
            Pozrieť prácu ↓
          </span>
          <span className="ml-auto hidden text-[0.72rem] text-white/40 lg:block">
            Webové projekty od 699 €
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- /02 --- */

function BilancBefore() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#ffffff] text-[#333]">
      <div className="w-full max-w-[26rem]">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
          <p className="text-[0.72rem] font-bold text-[#1f2937]">
            BILANC <span className="font-normal text-[#6b7280]">účtovníctvo</span>
          </p>
          <div className="flex gap-3 text-[0.55rem] text-[#4b5563]">
            <span>Služby</span>
            <span>Cenník</span>
            <span>O nás</span>
            <span>Kontakt</span>
          </div>
        </div>
        <div className="px-4 py-6 text-center">
          <p className="mb-2 text-[0.92rem] font-bold text-[#111827]">
            Účtovníctvo pre firmy a živnostníkov
          </p>
          <p className="mx-auto mb-4 max-w-[20rem] text-[0.58rem] leading-relaxed text-[#6b7280]">
            Poskytujeme komplexné účtovné služby, mzdy a daňové priznania.
            Spoľahlivo, presne a za férové ceny.
          </p>
          <span className="inline-block rounded-[6px] bg-[#3b82f6] px-4 py-2 text-[0.6rem] font-medium text-white">
            Získať cenovú ponuku
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 pb-5">
          {["Podvojné účtovníctvo", "Mzdy a personalistika", "Daňové priznania"].map((s) => (
            <div key={s} className="rounded-[6px] border border-[#e5e7eb] p-2 text-center">
              <div className="mx-auto mb-1.5 h-4 w-4 rounded-full bg-[#dbeafe]" />
              <p className="text-[0.5rem] leading-snug text-[#374151]">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BilancAfter() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f5f3ee] text-[#1c1d21]">
      <div className="flex items-center justify-between px-7 pt-6">
        <span className="text-[0.9rem] font-semibold tracking-[0.26em]">BILANC</span>
        <div className="hidden gap-5 text-[0.55rem] tracking-[0.2em] text-[#1c1d21]/55 md:flex">
          <span>SLUŽBY</span>
          <span>CENNÍK</span>
          <span>KONTAKT</span>
        </div>
        <span className="rounded-full bg-[#1c1d21] px-3.5 py-1.5 text-[0.55rem] font-medium text-[#f5f3ee]">
          Konzultácia
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center px-7 md:pl-[42%]">
        <p className="mb-3 text-[0.55rem] tracking-[0.3em] text-[#8a6a3a]">
          ÚČTOVNÍCTVO · MZDY · DANE — OD ROKU 2009
        </p>
        <p
          className="font-semibold"
          style={{ fontSize: "clamp(1.4rem,2.6vw,2.6rem)", lineHeight: 1.02, letterSpacing: "-0.03em" }}
        >
          Čísla, na ktoré sa dá
          <br />
          postaviť rozhodnutie.
        </p>
        <p className="mt-3 max-w-[26em] text-[0.66rem] leading-relaxed text-[#1c1d21]/65">
          Podvojné účtovníctvo, mzdy a daňové priznania pre malé a stredné
          firmy — s termínmi, ktoré platia.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <span className="rounded-full bg-[#1c1d21] px-4 py-2 text-[0.6rem] font-medium text-[#f5f3ee]">
            Nezáväzná konzultácia
          </span>
          <span className="text-[0.6rem] text-[#1c1d21]/60 underline underline-offset-4">Cenník</span>
        </div>
      </div>
      <div className="border-t border-[#1c1d21]/12">
        <div className="grid grid-cols-3 gap-px bg-[#1c1d21]/12 md:ml-[42%]">
          {[
            ["120+", "firiem v starostlivosti"],
            ["17", "rokov praxe"],
            ["48 h", "reakcia na dopyt"],
          ].map(([n, l]) => (
            <div key={l} className="bg-[#f5f3ee] px-4 py-3">
              <p className="text-[0.95rem] font-semibold">{n}</p>
              <p className="text-[0.5rem] tracking-[0.06em] text-[#1c1d21]/55">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Board02() {
  return (
    <section
      className="relative flex h-svh flex-col overflow-hidden"
      style={{ background: PAPER, color: INK_DARK }}
    >
      <header className="flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-8">
        <p className="text-[0.72rem] tracking-[0.3em] text-black/45">02 — PREMENA VNÍMANIA</p>
        <p className="hidden text-[0.72rem] text-black/40 md:block">tá istá firma · ten istý obsah</p>
      </header>

      <div className="relative z-10 px-[clamp(1.25rem,4vw,3.5rem)] pt-[4svh] pb-[3svh]">
        <h2
          className="font-semibold"
          style={{ fontSize: "clamp(2rem,4.6vw,4.4rem)", lineHeight: 0.98, letterSpacing: "-0.035em" }}
        >
          Rovnaká firma.
          <br />
          Úplne iný dojem.
        </h2>
      </div>

      {/* One full-bleed digital surface, folded by the ribbon's crease:
          the before-sliver is being swept away by the after-state.
          Below md the fold becomes a stacked before-chip + after surface. */}
      <div className="relative mx-[clamp(1.25rem,4vw,3.5rem)] mb-[6svh] flex flex-1 flex-col gap-3 md:block">
        <div className="relative h-[24svh] shrink-0 overflow-hidden rounded-[10px] border border-black/10 opacity-90 grayscale-[0.2] md:hidden">
          <BilancBefore />
          <p className="absolute right-2 bottom-2 rounded-full bg-white/85 px-2 py-0.5 text-[0.5rem] tracking-[0.12em] text-[#555]">
            PREDTÝM
          </p>
        </div>
        <div className="relative flex-1 overflow-hidden rounded-[10px] shadow-[0_30px_80px_rgba(20,20,25,0.18)] md:absolute md:inset-0">
          <div className="absolute inset-0">
            <BilancAfter />
          </div>
          {/* before-state remnant, clipped by the diagonal fold (md+) */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{ clipPath: "polygon(0 0, 34% 0, 22% 100%, 0 100%)" }}
          >
            <BilancBefore />
          </div>
          {/* the fold itself — the ribbon's crease as a metal seam */}
          <div
            className="absolute inset-y-0 hidden md:block"
            style={{
              left: "0",
              width: "100%",
              clipPath: "polygon(33.4% 0, 34.6% 0, 22.6% 100%, 21.4% 100%)",
              background: "linear-gradient(180deg,#e8e5de 0%,#b9b5ac 45%,#8f8b82 100%)",
            }}
          />
          <p className="absolute bottom-3 left-4 hidden text-[0.55rem] tracking-[0.18em] text-[#1c1d21]/45 md:block">
            BILANC — fiktívny klient na ukážku premeny
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- /03a --- */

function Board03a() {
  return (
    <section
      className="relative flex h-svh flex-col overflow-hidden"
      style={{ background: "#d9d8d3", color: "#1d1e20" }}
    >
      {/* blueprint grid of the industrial world */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(29,30,32,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,30,32,0.07) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <header className="relative z-10 flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-8">
        <p className="text-[0.72rem] tracking-[0.3em] text-black/50">
          03 — VYBRANÁ PRÁCA · 01 / KONŠTRUKT
        </p>
        <p className="text-[0.62rem] tracking-[0.14em] text-black/45">
          STAVEBNÍCTVO · UKÁŽKOVÝ KONCEPT
        </p>
      </header>

      {/* The project stage IS the project's hero screen, near-full-bleed */}
      <div className="relative z-10 mx-[clamp(1.25rem,4vw,3.5rem)] mt-[3svh] mb-[7svh] flex flex-1 flex-col overflow-hidden rounded-[10px] border border-black/12 bg-[#e3e2dd]">
        <div className="flex items-center justify-between border-b border-black/10 px-7 py-4">
          <span
            className="text-[1rem] font-semibold tracking-[0.02em]"
            style={{ fontStretch: "125%" }}
          >
            KONŠTRUKT
          </span>
          <div className="hidden gap-6 text-[0.58rem] tracking-[0.22em] text-black/50 md:flex">
            <span>REALIZÁCIE</span>
            <span>TECHNOLÓGIE</span>
            <span>KARIÉRA</span>
          </div>
          <span className="border border-black/60 px-3.5 py-1.5 text-[0.58rem] tracking-[0.14em]">
            DOPYT
          </span>
        </div>

        <div className="relative flex flex-1">
          <div className="flex flex-1 flex-col justify-center px-7">
            <p className="mb-4 text-[0.58rem] tracking-[0.3em] text-[#a4520f]">
              GENERÁLNY DODÁVATEĽ · PRIEMYSELNÉ STAVBY
            </p>
            <p
              className="font-semibold uppercase"
              style={{
                fontSize: "clamp(1.9rem,4.4vw,4.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.01em",
                fontStretch: "125%",
              }}
            >
              Postavené
              <br />
              presne.
            </p>
            <p className="mt-4 max-w-[24em] text-[0.68rem] leading-relaxed text-black/60">
              Haly, výrobné objekty a rekonštrukcie — od projekcie po
              kolaudáciu, s termínmi ako z výkresu.
            </p>
            <div className="mt-6 flex items-center gap-5">
              <span className="bg-[#1d1e20] px-5 py-2.5 text-[0.62rem] tracking-[0.1em] text-[#e3e2dd]">
                VYŽIADAŤ PONUKU
              </span>
              <span className="text-[0.62rem] tracking-[0.08em] text-black/55 underline underline-offset-4">
                Realizácie →
              </span>
            </div>
          </div>

          {/* structural graphic: axonometric hall in linework + material bands */}
          <div className="relative hidden w-[42%] border-l border-black/10 md:block">
            <svg viewBox="0 0 400 460" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <g stroke="#1d1e20" strokeWidth="1.4" fill="none" opacity="0.75">
                <path d="M60 320 L200 250 L340 320 L200 390 Z" />
                <path d="M60 320 L60 210 L200 140 L340 210 L340 320" />
                <path d="M200 250 L200 140" />
                <path d="M60 210 L200 280 L340 210" />
                <path d="M96 192 L96 302" strokeDasharray="4 5" />
                <path d="M304 192 L304 302" strokeDasharray="4 5" />
                <path d="M140 166 L140 276" strokeDasharray="4 5" />
                <path d="M260 166 L260 276" strokeDasharray="4 5" />
              </g>
              <g fill="#a4520f">
                <rect x="188" y="128" width="24" height="6" />
              </g>
              <g fill="#1d1e20" opacity="0.55" fontSize="11" fontFamily="var(--font-geist-mono)">
                <text x="60" y="425">HALA A — 4 200 m²</text>
                <text x="60" y="443">OCEĽ / BETÓN C30/37</text>
              </g>
            </svg>
            <div className="absolute top-6 right-6 flex gap-3 font-mono text-[0.5rem] text-black/50">
              <span className="flex flex-col gap-1">
                <span
                  className="h-12 w-10"
                  style={{ background: "linear-gradient(135deg,#cfcec8,#a7a5a0)" }}
                />
                BETÓN
              </span>
              <span className="flex flex-col gap-1">
                <span
                  className="h-12 w-24"
                  style={{ background: "linear-gradient(135deg,#b8b6ae,#8e8c85 55%,#6f6e68)" }}
                />
                OCEĽ S355
              </span>
            </div>
          </div>
        </div>

        <div className="hidden grid-cols-3 gap-px border-t border-black/10 bg-black/10 text-[0.55rem] md:grid">
          {[
            ["01", "PRIEMYSEL — haly a výrobné objekty"],
            ["02", "OBČIANSKE — administratíva a školstvo"],
            ["03", "REKONŠTRUKCIE — zásahy do prevádzky"],
          ].map(([n, l]) => (
            <div key={n} className="flex items-baseline gap-2 bg-[#e3e2dd] px-5 py-3">
              <span className="font-mono text-[#a4520f]">{n}</span>
              <span className="tracking-[0.05em] text-black/60">{l}</span>
            </div>
          ))}
        </div>
      </div>
      <footer className="absolute bottom-4 left-[clamp(1.25rem,4vw,3.5rem)] z-10 text-[0.56rem] tracking-[0.1em] text-black/40">
        Ukážkový koncept — nejde o realizáciu pre klienta.
      </footer>
    </section>
  )
}

/* --------------------------------------------------------------- /03b --- */

function Board03b() {
  return (
    <section
      className="relative flex h-svh flex-col overflow-hidden"
      style={{ background: "#f2ece2", color: "#22312e" }}
    >
      <header className="relative z-10 flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-8">
        <p className="text-[0.72rem] tracking-[0.3em] text-[#22312e]/55">
          03 — VYBRANÁ PRÁCA · 02 / VITALIS
        </p>
        <p className="text-[0.62rem] tracking-[0.14em] text-[#22312e]/50">
          ZDRAVOTNÍCTVO · UKÁŽKOVÝ KONCEPT
        </p>
      </header>

      <div className="relative z-10 mx-[clamp(1.25rem,4vw,3.5rem)] mt-[3svh] mb-[7svh] flex flex-1 flex-col overflow-hidden rounded-[10px] bg-[#faf7f1] shadow-[0_24px_60px_rgba(34,49,46,0.10)]">
        <div className="flex items-center justify-between px-7 py-4">
          <span className="text-[0.95rem] font-semibold tracking-[0.3em]">VITALIS</span>
          <div className="hidden gap-6 text-[0.58rem] tracking-[0.18em] text-[#22312e]/55 md:flex">
            <span>Služby</span>
            <span>Náš tím</span>
            <span>Cenník</span>
          </div>
          <span className="rounded-full bg-[#1d5f5a] px-4 py-1.5 text-[0.58rem] font-medium text-[#faf7f1]">
            Objednať sa
          </span>
        </div>

        <div className="flex flex-1 items-center gap-8 px-7">
          <div className="max-w-[30em] flex-1">
            <p className="mb-3 text-[0.58rem] tracking-[0.3em] text-[#1d5f5a]">
              SÚKROMNÁ KLINIKA · BRATISLAVA
            </p>
            <p
              className="font-semibold"
              style={{ fontSize: "clamp(1.8rem,3.8vw,3.6rem)", lineHeight: 1.02, letterSpacing: "-0.028em" }}
            >
              Termín do 48 hodín.
              <br />
              Bez čakania v rade.
            </p>
            <p className="mt-4 max-w-[24em] text-[0.68rem] leading-relaxed text-[#22312e]/65">
              Objednajte sa online, vyberte si čas a príďte presne na svoju
              hodinu. Potvrdenie príde e-mailom aj SMS.
            </p>
            <div className="mt-6 flex items-center gap-5">
              <span className="rounded-full bg-[#1d5f5a] px-5 py-2.5 text-[0.62rem] font-medium text-[#faf7f1]">
                Objednať termín
              </span>
              <span className="text-[0.62rem] text-[#22312e]/55 underline underline-offset-4">
                Preventívne prehliadky
              </span>
            </div>
          </div>

          {/* calm booking panel — the product moment */}
          <div className="hidden w-[36%] rounded-[10px] border border-[#22312e]/10 bg-white p-5 md:block">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[0.66rem] font-semibold">Utorok 24. 9.</p>
              <p className="text-[0.52rem] text-[#22312e]/50">MUDr. Halásová</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["8:30", "9:15", "11:00", "13:45"].map((t, i) => (
                <span
                  key={t}
                  className={
                    i === 1
                      ? "rounded-[6px] bg-[#1d5f5a] px-2 py-2 text-center text-[0.56rem] font-medium text-white"
                      : "rounded-[6px] border border-[#22312e]/15 px-2 py-2 text-center text-[0.56rem] text-[#22312e]/70"
                  }
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-[#22312e]/10 pt-3">
              {[
                ["Všeobecná ambulancia", "bez čakania na termín"],
                ["Laboratórna diagnostika", "výsledky online do 24 h"],
              ].map(([a, b]) => (
                <div key={a} className="flex items-baseline justify-between">
                  <span className="text-[0.56rem] font-medium">{a}</span>
                  <span className="text-[0.5rem] text-[#22312e]/50">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t border-[#22312e]/10 px-7 py-3 text-[0.54rem] text-[#22312e]/55">
          <span>✓ zmluvné poisťovne</span>
          <span>✓ parkovanie pre pacientov</span>
          <span>✓ výsledky v mobile</span>
        </div>
      </div>
      <footer className="absolute bottom-4 left-[clamp(1.25rem,4vw,3.5rem)] z-10 text-[0.56rem] tracking-[0.1em] text-[#22312e]/45">
        Ukážkový koncept — nejde o realizáciu pre klienta.
      </footer>
    </section>
  )
}

/* --------------------------------------------------------------- /03c --- */

function Board03c() {
  return (
    <section
      className="relative flex h-svh flex-col overflow-hidden"
      style={{ background: "#ece5d8", color: "#211d17" }}
    >
      <header className="relative z-10 flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-8">
        <p className="text-[0.72rem] tracking-[0.3em] text-[#211d17]/55">
          03 — VYBRANÁ PRÁCA · 03 / FORMA
        </p>
        <p className="text-[0.62rem] tracking-[0.14em] text-[#211d17]/50">
          INTERIÉROVÝ ATELIÉR · UKÁŽKOVÝ KONCEPT
        </p>
      </header>

      <div className="relative z-10 mx-[clamp(1.25rem,4vw,3.5rem)] mt-[3svh] mb-[7svh] flex flex-1 flex-col overflow-hidden rounded-[10px] bg-[#f2ecdf]">
        <div className="flex items-center justify-between px-7 py-4">
          <span className="font-serif text-[1.05rem] italic">Forma</span>
          <div className="hidden gap-6 text-[0.56rem] tracking-[0.22em] text-[#211d17]/55 md:flex">
            <span>PROJEKTY</span>
            <span>PRÍSTUP</span>
            <span>KONTAKT</span>
          </div>
          <span className="text-[0.58rem] tracking-[0.12em] text-[#9c3b22] underline underline-offset-4">
            Konzultácia
          </span>
        </div>

        <div className="relative flex flex-1 px-7 pt-[6svh]">
          <div className="flex flex-1 flex-col justify-start pt-[6svh]">
            <p
              className="font-serif"
              style={{ fontSize: "clamp(2rem,4.6vw,4.6rem)", lineHeight: 1.0, letterSpacing: "-0.02em" }}
            >
              Interiéry, ktoré
              <br />
              vydržia <em className="text-[#9c3b22]">dekádu.</em>
            </p>
            <p className="mt-4 max-w-[26em] text-[0.68rem] leading-relaxed text-[#211d17]/65">
              Navrhujeme priestory pre ľudí, ktorí ich budú roky používať —
              nie pre fotografiu do katalógu.
            </p>
            <p className="mt-6 text-[0.6rem] tracking-[0.14em] text-[#9c3b22]">
              AKO PRACUJEME →
            </p>
          </div>

          {/* editorial index + oxide colour plates as the art direction */}
          <div className="hidden w-[40%] flex-col justify-start gap-3 pt-[4svh] pl-8 md:flex">
            <div className="mb-2 flex gap-2">
              <div className="h-20 flex-1" style={{ background: "#9c3b22" }} />
              <div className="h-20 w-14" style={{ background: "#3f4a3a" }} />
              <div className="h-20 w-8" style={{ background: "#c9a35d" }} />
            </div>
            {[
              ["01", "Byt na Palisádach", "2024"],
              ["02", "Ordinácia Ružinov", "2024"],
              ["03", "Penzión Terchová", "2023"],
            ].map(([n, t, y]) => (
              <div
                key={n}
                className="flex items-baseline justify-between border-t border-[#211d17]/15 pt-2"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[0.55rem] text-[#9c3b22]">{n}</span>
                  <span className="text-[0.72rem]">{t}</span>
                </span>
                <span className="text-[0.55rem] text-[#211d17]/50">{y}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between border-t border-[#211d17]/12 px-7 py-3 text-[0.55rem] text-[#211d17]/55">
          <span className="tracking-[0.1em]">ATELIÉR BRATISLAVA</span>
          <span>Konzultácia v priestore zdarma</span>
        </div>
      </div>
      <footer className="absolute bottom-4 left-[clamp(1.25rem,4vw,3.5rem)] z-10 text-[0.56rem] tracking-[0.1em] text-[#211d17]/45">
        Ukážkový koncept — nejde o realizáciu pre klienta.
      </footer>
    </section>
  )
}

/* ---------------------------------------------------------------- /04 --- */

function Board04() {
  return (
    <section
      className="relative flex h-svh flex-col overflow-hidden"
      style={{ background: "#f4f1ea", color: "#1b1c20" }}
    >
      <header className="flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-8">
        <p className="text-[0.72rem] tracking-[0.3em] text-black/45">04 — ČO PRE VÁS UROBÍME</p>
        <p className="hidden text-[0.72rem] text-black/40 md:block">jedna stuha · tri disciplíny</p>
      </header>

      <div className="mx-[clamp(1.25rem,4vw,3.5rem)] mt-[2svh] flex flex-1 flex-col justify-center">
        {[
          [
            "01",
            "STRATÉGIA",
            "Najprv pochopíme vašu firmu, zákazníkov a to, čo má web reálne priniesť.",
          ],
          [
            "02",
            "DIZAJN",
            "Z pochopenia vznikne vizuálny systém, ktorý firmu odlíši a pôsobí dôveryhodne.",
          ],
          [
            "03",
            "VÝVOJ",
            "Rýchly, responzívny web pripravený na produkciu — bez kompromisov v detailoch.",
          ],
        ].map(([n, t, d]) => (
          <div
            key={n}
            className="grid grid-cols-[3rem_1fr] items-baseline gap-x-6 border-t border-black/12 py-[3.2svh] md:grid-cols-[4rem_minmax(12rem,22rem)_1fr]"
          >
            <span className="font-mono text-[0.7rem] text-black/40">{n}</span>
            <span
              className="font-semibold"
              style={{ fontSize: "clamp(1.5rem,3vw,2.8rem)", letterSpacing: "-0.02em" }}
            >
              {t}
            </span>
            <p className="col-start-2 mt-2 max-w-[34em] text-[0.85rem] leading-relaxed text-black/60 md:col-start-3 md:mt-0">
              {d}
            </p>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-black/12 py-5">
          <p className="text-[0.85rem] text-black/60">
            Webové projekty od <span className="font-semibold text-black/85">699 €</span> — presnú
            cenu poviete po konzultácii.
          </p>
          <p className="hidden text-[0.7rem] text-black/40 md:block">prvý návrh do 72 h</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- /05 --- */

function Board05() {
  return (
    <section
      className="relative flex h-svh flex-col overflow-hidden"
      style={{ background: "#f4f1ea", color: "#1b1c20" }}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-[clamp(1.25rem,4vw,3.5rem)] text-center">
        <img src="/brand/codera-mark.svg" alt="Codera" className="mb-8 h-[16vmin] w-[16vmin]" />
        <h2
          className="font-semibold"
          style={{ fontSize: "clamp(2rem,4.6vw,4.6rem)", lineHeight: 1.0, letterSpacing: "-0.035em" }}
        >
          Váš ďalší web nemusí
          <br />
          vyzerať ako všetky ostatné.
        </h2>
        <p className="mt-5 text-[0.95rem] text-black/55">
          Vytvorme taký, ktorý si ľudia zapamätajú.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <span className="rounded-full bg-[#1b1c20] px-7 py-3.5 text-[0.9rem] font-medium text-[#f4f1ea]">
            Začať projekt
          </span>
          <span className="text-[0.8rem] text-black/55 underline underline-offset-4">
            coderaslovakia@gmail.com
          </span>
        </div>
      </div>

      <footer className="flex flex-wrap items-baseline justify-between gap-3 border-t border-black/12 px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-[0.62rem] text-black/45">
        <span className="flex items-center gap-2">
          <img src="/brand/codera-mark-mono.svg" alt="" className="h-3.5 w-3.5 opacity-60" />
          <span className="tracking-[0.26em]">CODERA</span>
        </span>
        <span>+421 949 753 556 · coderaslovakia@gmail.com</span>
        <span>Práca · Služby · Kontakt</span>
        <span>© 2026 Codera</span>
      </footer>
    </section>
  )
}

/* ---------------------------------------------------------------------- */

const BOARDS: Record<string, () => React.ReactElement> = {
  "01": Board01,
  "02": Board02,
  "03a": Board03a,
  "03b": Board03b,
  "03c": Board03c,
  "04": Board04,
  "05": Board05,
}

export default function Boards() {
  const s = useParam("s", "01")
  const Board = BOARDS[s] ?? Board01
  return (
    <main className="font-sans" data-board={s}>
      <Board />
    </main>
  )
}
