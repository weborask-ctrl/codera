"use client"

/**
 * Step 5 experience — the DOM acts (/01–/05).
 *
 * Natural document flow over the fixed world canvas (world mode) or over
 * per-act solid grounds (flat mode: <lg viewports, no WebGL, or reduced
 * motion). Sticky regions do the desktop choreography — /02's fold is a
 * clip-path driven by its region's progress, /03 is a native sticky
 * stack; below lg the work act re-authors as a swipe deck and the fold
 * as a stacked before/after (Step 5 §2.6: different edit, same story).
 *
 * Text choreography: entrances settle once via IntersectionObserver;
 * copy never sits below full legibility during its hold (§2.3).
 */

import { useEffect, useRef } from "react"
import { openEnquiry } from "./enquiry-bus"
import { ACT_TONES, bindStage, stage } from "./stage"

/* ------------------------------------------------------------ binding --- */

function useStage(probe: boolean) {
  const probeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const unbind = bindStage()
    const root = document.querySelector<HTMLElement>("main[data-experience=v3]")
    root?.setAttribute("data-hydrated", "")
    let frame = 0
    let lastScrollTs = 0
    let worst = 0
    const onScroll = () => {
      lastScrollTs = performance.now()
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    const write = () => {
      frame = requestAnimationFrame(write)
      if (!root) {
        return
      }
      const fold = Math.min(1, stage.p.premena / 0.7)
      root.style.setProperty("--fold", fold.toFixed(4))
      root.style.setProperty("--recede-a", Math.min(1, stage.p.vitalis * 2).toFixed(4))
      root.style.setProperty("--recede-b", Math.min(1, stage.p.forma * 2).toFixed(4))

      if (probe && probeRef.current) {
        const now = performance.now()
        const delta = lastScrollTs ? now - lastScrollTs : 0
        if (delta > worst && delta < 250) {
          worst = delta
        }
        probeRef.current.textContent = `act ${stage.act} · input→write ${delta.toFixed(1)} ms (worst ${worst.toFixed(1)}) · fold ${fold.toFixed(2)}`
      }
    }
    frame = requestAnimationFrame(write)

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-entered", "")
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: "-12% 0px" }
    )
    for (const el of document.querySelectorAll("[data-enter]")) {
      io.observe(el)
    }

    /* /04 rows: the row nearest the viewport center is the active one */
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-offer-row]"))
    const rowIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.toggleAttribute("data-active", e.isIntersecting)
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    )
    for (const r of rows) {
      rowIo.observe(r)
    }

    return () => {
      unbind()
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      io.disconnect()
      rowIo.disconnect()
    }
  }, [probe])
  return probeRef
}

/* ----------------------------------------------------------- surfaces --- */

function BilancBefore() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white text-[#333]">
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

function StageKonstrukt() {
  return (
    <div className="flex h-full flex-col" style={{ color: "#1d1e20" }}>
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 md:px-7">
        <span className="text-[1rem] font-semibold" style={{ fontStretch: "125%" }}>
          KONŠTRUKT
        </span>
        <span className="border border-black/60 px-3.5 py-1.5 text-[0.58rem] tracking-[0.14em]">
          DOPYT
        </span>
      </div>
      <div className="flex flex-1">
        <div className="flex flex-1 flex-col justify-center px-5 md:px-7">
          <p className="mb-4 text-[0.58rem] tracking-[0.3em] text-[#a4520f]">
            GENERÁLNY DODÁVATEĽ · PRIEMYSELNÉ STAVBY
          </p>
          <p
            className="font-semibold uppercase"
            style={{ fontSize: "clamp(1.7rem,4vw,4.2rem)", lineHeight: 0.92, fontStretch: "125%" }}
          >
            Postavené
            <br />
            presne.
          </p>
          <p className="mt-4 max-w-[24em] text-[0.68rem] leading-relaxed text-black/60">
            Haly, výrobné objekty a rekonštrukcie — od projekcie po kolaudáciu,
            s termínmi ako z výkresu.
          </p>
          <div className="mt-6">
            <span className="inline-block bg-[#1d1e20] px-5 py-2.5 text-[0.62rem] tracking-[0.1em] text-[#e3e2dd]">
              VYŽIADAŤ PONUKU
            </span>
          </div>
        </div>
        <div className="relative hidden w-[42%] border-l border-black/10 md:block">
          <svg viewBox="0 0 400 460" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <g stroke="#1d1e20" strokeWidth="1.4" fill="none" opacity="0.75">
              <path d="M60 320 L200 250 L340 320 L200 390 Z" />
              <path d="M60 320 L60 210 L200 140 L340 210 L340 320" />
              <path d="M200 250 L200 140" />
              <path d="M60 210 L200 280 L340 210" />
              <path d="M96 192 L96 302" strokeDasharray="4 5" />
              <path d="M304 192 L304 302" strokeDasharray="4 5" />
            </g>
            <rect x="188" y="134" width="24" height="6" fill="#a4520f" />
            <g fill="#1d1e20" opacity="0.55" fontSize="11" fontFamily="var(--font-geist-mono)">
              <text x="60" y="425">HALA A — 4 200 m²</text>
              <text x="60" y="443">OCEĽ / BETÓN C30/37</text>
            </g>
          </svg>
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
  )
}

function StageVitalis() {
  return (
    <div className="flex h-full flex-col" style={{ color: "#22312e" }}>
      <div className="flex items-center justify-between px-5 py-4 md:px-7">
        <span className="text-[0.95rem] font-semibold tracking-[0.3em]">VITALIS</span>
        <span className="rounded-full bg-[#1d5f5a] px-4 py-1.5 text-[0.58rem] font-medium text-[#faf7f1]">
          Objednať sa
        </span>
      </div>
      <div className="flex flex-1 items-center gap-8 px-5 md:px-7">
        <div className="max-w-[30em] flex-1">
          <p className="mb-3 text-[0.58rem] tracking-[0.3em] text-[#1d5f5a]">
            SÚKROMNÁ KLINIKA · BRATISLAVA
          </p>
          <p
            className="font-semibold"
            style={{ fontSize: "clamp(1.6rem,3.4vw,3.2rem)", lineHeight: 1.02, letterSpacing: "-0.028em" }}
          >
            Termín do 48 hodín.
            <br />
            Bez čakania v rade.
          </p>
          <p className="mt-4 max-w-[24em] text-[0.68rem] leading-relaxed text-[#22312e]/65">
            Objednajte sa online, vyberte si čas a príďte presne na svoju
            hodinu. Potvrdenie príde e-mailom aj SMS.
          </p>
          <div className="mt-6">
            <span className="inline-block rounded-full bg-[#1d5f5a] px-5 py-2.5 text-[0.62rem] font-medium text-[#faf7f1]">
              Objednať termín
            </span>
          </div>
        </div>
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
      <div className="flex items-center gap-6 border-t border-[#22312e]/10 px-5 py-3 text-[0.54rem] text-[#22312e]/55 md:px-7">
        <span>✓ zmluvné poisťovne</span>
        <span>✓ parkovanie pre pacientov</span>
        <span className="hidden md:inline">✓ výsledky v mobile</span>
      </div>
    </div>
  )
}

function StageForma() {
  return (
    <div className="flex h-full flex-col" style={{ color: "#211d17" }}>
      <div className="flex items-center justify-between px-5 py-4 md:px-7">
        <span className="font-serif text-[1.05rem] italic">Forma</span>
        <span className="text-[0.58rem] tracking-[0.12em] text-[#9c3b22] underline underline-offset-4">
          Konzultácia
        </span>
      </div>
      <div className="flex flex-1 px-5 pt-[4svh] md:px-7">
        <div className="flex-1">
          <p className="font-serif" style={{ fontSize: "clamp(1.8rem,4.2vw,4.2rem)", lineHeight: 1.0 }}>
            Interiéry, ktoré
            <br />
            vydržia <em className="text-[#9c3b22]">dekádu.</em>
          </p>
          <p className="mt-4 max-w-[26em] text-[0.68rem] leading-relaxed text-[#211d17]/65">
            Navrhujeme priestory pre ľudí, ktorí ich budú roky používať — nie
            pre fotografiu do katalógu.
          </p>
          <p className="mt-6 text-[0.6rem] tracking-[0.14em] text-[#9c3b22]">AKO PRACUJEME →</p>
        </div>
        <div className="hidden w-[40%] flex-col gap-3 pl-8 md:flex">
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
            <div key={n} className="flex items-baseline justify-between border-t border-[#211d17]/15 pt-2">
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-[0.55rem] text-[#9c3b22]">{n}</span>
                <span className="text-[0.72rem]">{t}</span>
              </span>
              <span className="text-[0.55rem] text-[#211d17]/50">{y}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-baseline justify-between border-t border-[#211d17]/12 px-5 py-3 text-[0.55rem] text-[#211d17]/55 md:px-7">
        <span className="tracking-[0.1em]">ATELIÉR BRATISLAVA</span>
        <span className="hidden md:inline">Konzultácia v priestore zdarma</span>
      </div>
    </div>
  )
}

const STAGES = [
  { id: "konstrukt", meta: "01 / KONŠTRUKT — STAVEBNÍCTVO", tone: "#e3e2dd", ink: "#1d1e20", Stage: StageKonstrukt },
  { id: "vitalis", meta: "02 / VITALIS — ZDRAVOTNÍCTVO", tone: "#faf7f1", ink: "#22312e", Stage: StageVitalis },
  { id: "forma", meta: "03 / FORMA — INTERIÉROVÝ ATELIÉR", tone: "#f2ecdf", ink: "#211d17", Stage: StageForma },
] as const

/* ------------------------------------------------------------- acts ----- */

function ActHero({ world }: { world: boolean }) {
  return (
    <section
      data-zone="hero"
      className="relative flex h-svh flex-col overflow-hidden text-[#f4f1ea]"
      style={
        world
          ? undefined
          : {
              background:
                "radial-gradient(120% 90% at 18% 8%, oklch(0.30 0.012 85) 0%, oklch(0.185 0.005 250) 34%, oklch(0.148 0.0035 250) 68%)",
            }
      }
    >
      {!world ? (
        <img
          src="/brand/codera-mark.svg"
          alt=""
          className="pointer-events-none absolute top-[16svh] right-[-14vmin] w-[64vmin] max-w-none opacity-95 lg:top-1/2 lg:right-[-10vmin] lg:w-[78vmin] lg:-translate-y-1/2"
          style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.55))" }}
        />
      ) : null}
      <div data-enter className="enter relative z-10 mt-auto mb-[9svh] px-[clamp(1.25rem,4vw,3.5rem)]">
        <p className="mb-5 text-[0.72rem] tracking-[0.3em] text-white/55">KREATÍVNE WEBOVÉ ŠTÚDIO</p>
        <h1
          data-hero-line
          className="max-w-[11em] font-semibold"
          style={{ fontSize: "clamp(2.2rem,6.6vw,6.9rem)", lineHeight: 0.98, letterSpacing: "-0.035em" }}
        >
          Vaša firma je lepšia,
          <br />
          než ukazuje váš web.
        </h1>
        <div className="mt-7 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="rounded-full bg-[#f4f1ea] px-6 py-3 text-[0.85rem] font-medium text-[#16171b]"
          >
            Začať projekt
          </button>
          <a href="#praca" className="border-b border-white/35 pb-0.5 text-[0.85rem] text-white/80">
            Pozrieť prácu ↓
          </a>
        </div>
      </div>
    </section>
  )
}

function ActPremena({ world }: { world: boolean }) {
  return (
    <section
      data-zone="premena"
      data-zone-sticky
      id="premena"
      className="relative h-[180svh] max-lg:h-auto"
      style={world ? undefined : { background: ACT_TONES.premena }}
    >
      <div className="flex flex-col text-[#16171b] lg:sticky lg:top-0 lg:h-svh max-lg:min-h-svh">
        <header className="flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-20 lg:pt-24">
          <p className="text-[0.72rem] tracking-[0.3em] text-black/45">02 — PREMENA VNÍMANIA</p>
          <p className="hidden text-[0.72rem] text-black/40 md:block">tá istá firma · ten istý obsah</p>
        </header>
        <div data-enter className="enter px-[clamp(1.25rem,4vw,3.5rem)] pt-[3svh] pb-[3svh]">
          <h2
            className="font-semibold"
            style={{ fontSize: "clamp(1.8rem,4vw,3.8rem)", lineHeight: 0.98, letterSpacing: "-0.035em" }}
          >
            Rovnaká firma. Úplne iný dojem.
          </h2>
        </div>

        {/* lg+: one surface, before folded away by --fold. Below lg: a
            stacked before-chip + after surface (touch edit, no scrub). */}
        <div className="relative mx-[clamp(1.25rem,4vw,3.5rem)] mb-[6svh] flex flex-1 flex-col gap-3 lg:block">
          <div className="relative h-[24svh] shrink-0 overflow-hidden rounded-[10px] border border-black/10 opacity-90 grayscale-[0.2] lg:hidden">
            <BilancBefore />
            <p className="absolute right-2 bottom-2 rounded-full bg-white/85 px-2 py-0.5 text-[0.5rem] tracking-[0.12em] text-[#555]">
              PREDTÝM
            </p>
          </div>
          <div className="relative min-h-[52svh] flex-1 overflow-hidden rounded-[10px] shadow-[0_30px_80px_rgba(20,20,25,0.18)] lg:absolute lg:inset-0 lg:min-h-0">
            <div className="absolute inset-0">
              <BilancAfter />
            </div>
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                clipPath:
                  "polygon(0 0, calc(34% * (1 - var(--fold, 0))) 0, calc(22% * (1 - var(--fold, 0))) 100%, 0 100%)",
              }}
            >
              <BilancBefore />
            </div>
            <div
              className="absolute inset-y-0 hidden w-full lg:block"
              style={{
                clipPath:
                  "polygon(calc(34% * (1 - var(--fold, 0)) - 0.6%) 0, calc(34% * (1 - var(--fold, 0)) + 0.6%) 0, calc(22% * (1 - var(--fold, 0)) + 0.6%) 100%, calc(22% * (1 - var(--fold, 0)) - 0.6%) 100%)",
                background: "linear-gradient(180deg,#e8e5de 0%,#b9b5ac 45%,#8f8b82 100%)",
                opacity: "calc(1 - var(--fold, 0) * var(--fold, 0))",
              }}
            />
            <p className="absolute bottom-3 left-4 hidden text-[0.55rem] tracking-[0.18em] text-[#1c1d21]/45 lg:block">
              BILANC — fiktívny klient na ukážku premeny
            </p>
          </div>
          <p className="text-[0.55rem] tracking-[0.14em] text-black/40 lg:hidden">
            BILANC — fiktívny klient na ukážku premeny
          </p>
        </div>
      </div>
    </section>
  )
}

function ActWork({ world }: { world: boolean }) {
  return (
    <section
      data-zone="work"
      data-zone-sticky
      id="praca"
      className="relative lg:h-[300svh]"
      style={world ? undefined : { background: ACT_TONES.work }}
    >
      {/* lg+: native sticky stack */}
      <div className="hidden lg:block">
        {STAGES.map((s, i) => (
          <div key={s.id} className="sticky top-0 h-svh" style={{ zIndex: i + 1 }}>
            <div
              className="flex h-full flex-col px-[clamp(1.25rem,4vw,3.5rem)] pt-20 pb-[4svh]"
              style={
                i < 2
                  ? {
                      transform: `translateY(calc(var(--recede-${i === 0 ? "a" : "b"}, 0) * -6svh)) scale(calc(1 - var(--recede-${i === 0 ? "a" : "b"}, 0) * 0.045))`,
                      filter: `brightness(calc(1 - var(--recede-${i === 0 ? "a" : "b"}, 0) * 0.12))`,
                    }
                  : undefined
              }
            >
              <header className="flex items-baseline justify-between pb-3" style={{ color: s.ink }}>
                <p className="text-[0.72rem] tracking-[0.3em] opacity-60">03 — VYBRANÁ PRÁCA · {s.meta}</p>
                <p className="text-[0.62rem] tracking-[0.14em] opacity-50">UKÁŽKOVÝ KONCEPT</p>
              </header>
              <div
                className="flex-1 overflow-hidden rounded-[10px] shadow-[0_24px_60px_rgba(25,25,28,0.14)]"
                style={{ background: s.tone }}
              >
                <s.Stage />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* below lg: swipe deck — native horizontal snap, no trap */}
      <div className="px-[clamp(1.25rem,4vw,2rem)] py-14 lg:hidden">
        <header className="mb-4 flex items-baseline justify-between text-[#1d1e20]">
          <p className="text-[0.7rem] tracking-[0.28em] opacity-60">03 — VYBRANÁ PRÁCA</p>
          <p className="text-[0.6rem] tracking-[0.12em] opacity-50">POTIAHNITE ←</p>
        </header>
        <div
          data-work-deck
          className="scrollbar-none -mx-[clamp(1.25rem,4vw,2rem)] flex snap-x snap-proximity gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,2rem)] pb-4"
        >
          {STAGES.map((s) => (
            <article
              key={s.id}
              data-deck-card
              className="w-[86vw] max-w-[30rem] shrink-0 snap-center"
            >
              <p className="mb-2 text-[0.6rem] tracking-[0.22em]" style={{ color: s.ink, opacity: 0.6 }}>
                {s.meta} · UKÁŽKOVÝ KONCEPT
              </p>
              <div
                className="h-[62svh] overflow-hidden rounded-[10px] shadow-[0_18px_44px_rgba(25,25,28,0.16)]"
                style={{ background: s.tone }}
              >
                <s.Stage />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ActOffer({ world }: { world: boolean }) {
  return (
    <section
      data-zone="offer"
      id="sluzby"
      className="relative flex min-h-svh flex-col text-[#1b1c20]"
      style={world ? undefined : { background: ACT_TONES.offer }}
    >
      <header className="flex items-baseline justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-16 lg:pt-24">
        <p className="text-[0.72rem] tracking-[0.3em] text-black/45">04 — ČO PRE VÁS UROBÍME</p>
        <p className="hidden text-[0.72rem] text-black/40 md:block">jedna stuha · tri disciplíny</p>
      </header>
      <div className="mx-[clamp(1.25rem,4vw,3.5rem)] mt-[4svh] mb-[6svh] flex flex-1 flex-col justify-center">
        {[
          ["01", "STRATÉGIA", "Najprv pochopíme vašu firmu, zákazníkov a to, čo má web reálne priniesť."],
          ["02", "DIZAJN", "Z pochopenia vznikne vizuálny systém, ktorý firmu odlíši a pôsobí dôveryhodne."],
          ["03", "VÝVOJ", "Rýchly, responzívny web pripravený na produkciu — bez kompromisov v detailoch."],
        ].map(([n, t, d]) => (
          <div
            key={n}
            data-enter
            data-offer-row
            className="enter offer-row grid grid-cols-[3rem_1fr] items-baseline gap-x-6 border-t border-black/12 py-[3.2svh] md:grid-cols-[4rem_minmax(12rem,22rem)_1fr]"
          >
            <span className="font-mono text-[0.7rem] text-black/40">{n}</span>
            <span
              className="offer-title font-semibold"
              style={{ fontSize: "clamp(1.5rem,3vw,2.8rem)", letterSpacing: "-0.02em" }}
            >
              {t}
            </span>
            <p className="col-start-2 mt-2 max-w-[34em] text-[0.85rem] leading-relaxed text-black/70 md:col-start-3 md:mt-0">
              {d}
            </p>
          </div>
        ))}
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-black/12 py-5">
          <p className="text-[0.85rem] text-black/60">
            Webové projekty od <span className="font-semibold text-black/85">699 €</span> — presnú cenu
            poviete po konzultácii.
          </p>
        </div>
      </div>
    </section>
  )
}

function ActResolution({ world }: { world: boolean }) {
  return (
    <section
      data-zone="resolution"
      id="kontakt"
      className="relative flex min-h-svh flex-col text-[#1b1c20]"
      style={world ? undefined : { background: ACT_TONES.resolution }}
    >
      {!world ? (
        <img
          src="/brand/codera-mark.svg"
          alt=""
          className="pointer-events-none absolute top-1/2 left-1/2 w-[46vmin] -translate-x-1/2 -translate-y-[62%] opacity-25"
        />
      ) : null}
      <div
        data-enter
        className="enter relative z-10 flex flex-1 flex-col items-center justify-center px-[clamp(1.25rem,4vw,3.5rem)] pt-[26svh] pb-[8svh] text-center"
      >
        <h2
          className="font-semibold"
          style={{ fontSize: "clamp(1.9rem,4.6vw,4.6rem)", lineHeight: 1.0, letterSpacing: "-0.035em" }}
        >
          Váš ďalší web nemusí
          <br />
          vyzerať ako všetky ostatné.
        </h2>
        <p className="mt-5 text-[0.95rem] text-black/55">Vytvorme taký, ktorý si ľudia zapamätajú.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6" id="dopyt">
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="rounded-full bg-[#1b1c20] px-7 py-3.5 text-[0.9rem] font-medium text-[#f4f1ea]"
          >
            Začať projekt
          </button>
          <a
            href="mailto:coderaslovakia@gmail.com"
            className="text-[0.8rem] text-black/55 underline underline-offset-4"
          >
            coderaslovakia@gmail.com
          </a>
        </div>
      </div>
      <footer className="relative z-10 border-t border-black/12 px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-[0.62rem] text-black/45">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="flex items-center gap-2">
            <img src="/brand/codera-mark-mono.svg" alt="" className="h-3.5 w-3.5 opacity-60" />
            <span className="tracking-[0.26em]">CODERA</span>
          </span>
          <span>
            <a href="tel:+421949753556">+421 949 753 556</a> ·{" "}
            <a href="mailto:coderaslovakia@gmail.com">coderaslovakia@gmail.com</a>
          </span>
          <span>
            <a href="#praca">Práca</a> · <a href="#sluzby">Služby</a> · <a href="#kontakt">Kontakt</a>
          </span>
          <span>© 2026 Codera</span>
        </div>
        <p className="mt-2 opacity-80">
          Konštrukt, Vitalis a Forma sú ukážkové koncepty — nejde o realizácie pre klientov.
        </p>
      </footer>
    </section>
  )
}

/* ------------------------------------------------------------ export ---- */

export function ExperienceActs({ world, probe = false }: { world: boolean; probe?: boolean }) {
  const probeRef = useStage(probe)
  return (
    <main
      id="hlavny-obsah"
      data-experience="v3"
      tabIndex={-1}
      className="relative z-10 outline-none"
      style={{ background: world ? "transparent" : undefined }}
    >
      <ActHero world={world} />
      {world ? <div data-zone="pass" aria-hidden="true" className="h-[60svh]" /> : null}
      <ActPremena world={world} />
      <ActWork world={world} />
      <ActOffer world={world} />
      <ActResolution world={world} />
      {probe ? (
        <div
          ref={probeRef}
          className="fixed right-2 bottom-2 z-50 rounded bg-black/80 px-2 py-1 font-mono text-[11px] text-lime-300"
        />
      ) : null}
    </main>
  )
}
