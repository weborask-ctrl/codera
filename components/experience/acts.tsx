"use client"

/**
 * Art Direction v2 — the DOM acts (/01–/05).
 *
 * Every act sits on a MATERIAL canvas (molten media, painted concrete,
 * sage dawn, candlelit olive, warm paper band) — never on emptiness.
 * Native scroll, zero pins; sticky regions choreograph /02 and /03.
 * Reasoning and reference map: CODERA_ART_DIRECTION_V2.md.
 */

import { useEffect, useRef } from "react"
import { openEnquiry } from "./enquiry-bus"
import { ActPremena } from "./premena"
import { bindStage, stage } from "./stage"
import { FormaWorld, KonstruktWorld, VitalisWorld } from "./worlds"

const MONO = { fontFamily: "var(--font-geist-mono)" }

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
      /* /02 wipe: completes at 62% of the region, then HOLDS readable */
      const fold = Math.min(1, stage.p.premena / 0.62)
      root.style.setProperty("--fold", fold.toFixed(4))
      if (fold >= 0.97 && !root.hasAttribute("data-wipe-done")) {
        root.setAttribute("data-wipe-done", "")
      }
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

/* ---------------------------------------------------------- /01 ENTRY --- */

function ActHero({ world }: { world: boolean }) {
  return (
    <section
      data-zone="hero"
      className={`relative flex h-svh flex-col overflow-hidden text-[#f4f1ea] ${world ? "" : "molten-field"}`}
    >
      {/* poster-scale wordmark living BEHIND the object (North Kingdom) */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[31svh] left-1/2 w-full -translate-x-1/2 text-center text-[clamp(2.9rem,15vw,19rem)] font-semibold whitespace-nowrap text-[#f4f1ea]/[0.07] select-none lg:text-[clamp(6rem,19vw,19rem)]"
        style={{ lineHeight: 1, letterSpacing: "0.06em", fontStretch: "112%" }}
      >
        CODERA
      </p>

      {!world ? (
        <>
          {/* flat mode: the C over the molten field with a floor glow */}
          {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
          <img
            src="/brand/codera-mark.svg"
            alt=""
            fetchPriority="high"
            className="pointer-events-none absolute top-[14svh] right-[-10vmin] w-[62vmin] max-w-none opacity-95 lg:top-[46%] lg:right-[-8vmin] lg:w-[74vmin] lg:-translate-y-1/2"
            style={{ filter: "drop-shadow(0 46px 90px rgba(0,0,0,0.6))" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[52svh] right-[-6vmin] h-[10vmin] w-[60vmin] rounded-[50%] opacity-50 lg:top-[78%] lg:right-[-4vmin]"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(232,201,154,0.5) 0%, transparent 70%)" }}
          />
        </>
      ) : null}

      {/* rotating scroll badge (monopo) */}
      <a
        href="#premena"
        aria-label="Posunúť na premenu"
        className="absolute right-[clamp(1.25rem,4vw,3.5rem)] bottom-[7svh] hidden h-[92px] w-[92px] lg:block"
      >
        <svg viewBox="0 0 100 100" className="scroll-badge h-full w-full opacity-70" role="img" aria-label="Skrolujte">
          <defs>
            <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text fill="#f4f1ea" fontSize="10" letterSpacing="2.6" style={MONO}>
            <textPath href="#badge-circle">SCROLL · POZRIEŤ PRÁCU ·</textPath>
          </text>
          <path d="M50 42 L50 58 M44 52 L50 58 L56 52" stroke="#f4f1ea" strokeWidth="1.6" fill="none" />
        </svg>
      </a>

      <div data-enter className="enter relative z-10 mt-auto mb-[8svh] px-[clamp(1.25rem,4vw,3.5rem)]">
        <p className="mb-5 text-[0.6rem] tracking-[0.2em] text-[#e8c99a]/85 lg:text-[0.68rem] lg:tracking-[0.32em]" style={MONO}>
          KREATÍVNE WEBOVÉ ŠTÚDIO — BRATISLAVA
        </p>
        <h1
          data-hero-line
          className="max-w-[10.5em] text-[clamp(1.6rem,8.4vw,4.4rem)] font-semibold lg:text-[clamp(2.2rem,6.6vw,6.9rem)]"
          style={{
            lineHeight: 0.96,
            letterSpacing: "-0.035em",
            /* the headline crosses the white C — a dark halo keeps it legible */
            textShadow: "0 1px 2px rgba(12,12,16,0.5), 0 14px 44px rgba(12,12,16,0.55)",
          }}
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

/* ----------------------------------------------------------- /03 WORK --- */

const WORLDS = [
  { id: "konstrukt", World: KonstruktWorld },
  { id: "vitalis", World: VitalisWorld },
  { id: "forma", World: FormaWorld },
] as const

function ActWork() {
  return (
    <section data-zone="work" data-zone-sticky id="praca" className="relative lg:h-[420svh]">
      {/* lg+: full-bleed paint worlds covering each other. The spacers give
          every world a HOLD — a stretch of travel where it owns the frame
          alone — instead of being perpetually mid-slide. */}
      <div className="hidden lg:block">
        {WORLDS.map(({ id, World }, i) => (
          <div key={id} className="contents">
          <div className="sticky top-0 h-svh overflow-hidden" style={{ zIndex: i + 1 }}>
            <div
              className="h-full"
              style={
                i < 2
                  ? {
                      transform: `translateY(calc(var(--recede-${i === 0 ? "a" : "b"}, 0) * -5svh)) scale(calc(1 - var(--recede-${i === 0 ? "a" : "b"}, 0) * 0.03))`,
                      filter: `brightness(calc(1 - var(--recede-${i === 0 ? "a" : "b"}, 0) * 0.18))`,
                    }
                  : undefined
              }
            >
              <World />
            </div>
          </div>
          {/* the hold: 40svh of travel where the world above stays alone */}
          <div aria-hidden="true" className="h-[40svh]" />
          </div>
        ))}
      </div>

      {/* below lg: full-width swipe deck of the same worlds */}
      <div className="py-12 lg:hidden" style={{ background: "#1b1c1f" }}>
        <div>
          <header className="mb-4 flex items-baseline justify-between px-[clamp(1.1rem,4vw,2rem)] text-[#f4f1ea]">
            <p className="text-[0.66rem] tracking-[0.28em]" style={MONO}>
              03 — VYBRANÁ PRÁCA
            </p>
            <p className="text-[0.58rem] tracking-[0.12em] opacity-60" style={MONO}>
              POTIAHNITE ←
            </p>
          </header>
          <div
            data-work-deck
            className="scrollbar-none flex snap-x snap-proximity gap-4 overflow-x-auto px-[clamp(1.1rem,4vw,2rem)] pb-4"
          >
            {WORLDS.map(({ id, World }) => (
              <article key={id} data-deck-card className="w-[88vw] max-w-[30rem] shrink-0 snap-center">
                <div className="h-[68svh] overflow-hidden rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                  <World compact />
                </div>
              </article>
            ))}
          </div>
        </div>
        {/* lg+ gets no extra strip — the worlds ARE the section; this dark
            band exists only as the deck's stage below lg */}
        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- /04 OFFER --- */

function ActOffer({ world }: { world: boolean }) {
  return (
    <section
      data-zone="offer"
      id="sluzby"
      className="act-rule relative text-[#1b1c20]"
      style={world ? undefined : { background: "#f0ebe0" }}
    >
      <div className="flex flex-col gap-10 px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh] lg:flex-row lg:gap-16">
        {/* sticky act title (Navigate band structure) */}
        <div className="lg:w-[34%]">
          <div className="lg:sticky lg:top-28">
            <p className="text-[0.66rem] tracking-[0.3em] text-black/45" style={MONO}>
              04 — REMESLO
            </p>
            <h2
              className="mt-4 font-semibold"
              style={{ fontSize: "clamp(1.9rem,3.4vw,3.4rem)", lineHeight: 0.98, letterSpacing: "-0.03em" }}
            >
              Čo pre vás
              <br />
              urobíme.
            </h2>
            <p className="mt-4 max-w-[22em] text-[0.85rem] leading-relaxed text-black/60">
              Jedna stuha, tri disciplíny — od pochopenia firmy až po web
              pripravený na produkciu.
            </p>
            {/* strand hairlines drawing toward the rows */}
            <svg aria-hidden="true" viewBox="0 0 220 60" className="mt-6 hidden w-[220px] lg:block">
              <path d="M0 8 H150 M0 30 H190 M0 52 H120" stroke="#1b1c20" strokeOpacity="0.35" strokeWidth="1.2" />
              <circle cx="150" cy="8" r="2.4" fill="#a4520f" />
              <circle cx="190" cy="30" r="2.4" fill="#1d5f5a" />
              <circle cx="120" cy="52" r="2.4" fill="#9c3b22" />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          {[
            ["01", "STRATÉGIA", "Najprv pochopíme vašu firmu, zákazníkov a to, čo má web reálne priniesť.", "audit · pozicionovanie · obsah"],
            ["02", "DIZAJN", "Z pochopenia vznikne vizuálny systém, ktorý firmu odlíši a pôsobí dôveryhodne.", "art direction · UI · prototyp"],
            ["03", "VÝVOJ", "Rýchly, responzívny web pripravený na produkciu — bez kompromisov v detailoch.", "Next.js · výkon · nasadenie"],
          ].map(([n, t, d, tags]) => (
            <div
              key={n}
              data-enter
              data-offer-row
              className="enter offer-row grid grid-cols-[3.4rem_1fr] items-baseline gap-x-6 border-t border-black/15 py-[3.4svh]"
            >
              <span
                className="font-semibold text-black/20"
                style={{ fontSize: "clamp(1.6rem,2.6vw,2.6rem)", fontStretch: "118%" }}
              >
                {n}
              </span>
              <div>
                <span
                  className="offer-title font-semibold"
                  style={{ fontSize: "clamp(1.6rem,3vw,3rem)", letterSpacing: "-0.02em", fontStretch: "112%" }}
                >
                  {t}
                </span>
                <p className="mt-2 max-w-[32em] text-[0.85rem] leading-relaxed text-black/70">{d}</p>
                <p className="mt-2 text-[0.56rem] tracking-[0.2em] text-black/40" style={MONO}>
                  {tags.toUpperCase()}
                </p>
              </div>
            </div>
          ))}

          {/* conversational close (The1's question + pill) */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-6">
            <p className="text-[0.9rem] text-black/70">
              Webové projekty od <span className="font-semibold text-black/90">699 €</span> — presnú
              cenu poviete po konzultácii.
            </p>
            <span className="flex items-center gap-3 text-[0.8rem] text-black/70">
              Koľko by stál ten váš?
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="rounded-full bg-[#1b1c20] px-5 py-2.5 text-[0.75rem] font-medium text-[#f4f1ea]"
              >
                Zistiť cenu
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------- /05 RESOLUTION --- */

function ActResolution({ world }: { world: boolean }) {
  return (
    <section
      data-zone="resolution"
      id="kontakt"
      className={`relative flex min-h-svh flex-col overflow-hidden text-[#f4f1ea] ${world ? "" : "molten-field"}`}
    >
      {!world ? (
        // biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here.
        <img
          src="/brand/codera-mark.svg"
          alt=""
          className="pointer-events-none absolute top-1/2 left-1/2 w-[44vmin] -translate-x-1/2 -translate-y-[64%] opacity-80"
          style={{ filter: "drop-shadow(0 30px 70px rgba(0,0,0,0.5))" }}
        />
      ) : null}

      <div
        data-enter
        className="enter relative z-10 flex flex-1 flex-col items-center justify-end px-[clamp(1.25rem,4vw,3.5rem)] pt-[34svh] pb-[10svh] text-center lg:justify-center lg:pt-[46svh]"
      >
        <h2
          className="text-[clamp(1.5rem,7.4vw,4.6rem)] font-semibold lg:text-[clamp(1.9rem,4.6vw,4.6rem)]"
          style={{
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            /* the closing line crosses the bright C — same halo as the hero */
            textShadow: "0 1px 2px rgba(12,12,16,0.5), 0 14px 44px rgba(12,12,16,0.55)",
          }}
        >
          Váš ďalší web nemusí
          <br />
          vyzerať ako všetky ostatné.
        </h2>
        <p className="mt-5 text-[0.95rem] text-white/65">Vytvorme taký, ktorý si ľudia zapamätajú.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-6" id="dopyt">
          <span className="hidden text-[0.85rem] text-white/60 md:block">Máte projekt v hlave?</span>
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="rounded-full bg-[#f4f1ea] px-7 py-3.5 text-[0.9rem] font-medium text-[#16171b]"
          >
            Začať projekt
          </button>
          <a href="mailto:coderaslovakia@gmail.com" className="text-[0.8rem] text-white/60 underline underline-offset-4">
            coderaslovakia@gmail.com
          </a>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/15 px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-[0.62rem] text-white/50">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="flex items-center gap-2">
            {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
            <img src="/brand/codera-mark-mono.svg" alt="" className="h-3.5 w-3.5 opacity-70" />
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
      <ActPremena />
      <ActWork />
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
