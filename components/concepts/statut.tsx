"use client"

/**
 * ŠTATÚT — the law practice concept as a full site (AD v3 amendment 2;
 * redesigned in the Ukážka 01 session, 2026-09-02, R4 direction).
 *
 * Type-as-hero over duotone photography [pangram R4-left, Ondrej's pick]:
 * the masthead word IS the hero, set over an ink+oxblood duotone of a law
 * library, with a bronze § as the page's one ornament. Sections follow as
 * documents: the practice register with photo previews [obys work index],
 * the roster, publications, the consultation close. Instrument Serif voice,
 * ink/stone/oxblood/bronze climate. Motion is scroll-scrubbed and restrained
 * — parallax, reveals, count-ups; native scroll, nothing synthetic; reduced
 * motion reads a composed still. The mechanic is ENQUIRE.
 *
 * Photos: Unsplash licence, stored locally under /demos/kancelaria/.
 */

import { useEffect, useRef, useState } from "react"
import { fx, INST, MONO, Shell } from "./shell"

const STONE = "#EDEDEA"
const INK = "#101115"
const OX = "#6E1F26"
const OXL = "#C9646C"

const IMG = "/demos/kancelaria"

const PRACTICE = [
  ["01", "Obchodné právo", "Od zakladateľskej zmluvy po predaj firmy. Vedieme transakcie tak, aby ste podpisovali s pokojom.", `${IMG}/podpis.jpg`],
  ["02", "Nehnuteľnosti", "Kúpa, predaj a výstavba bez skrytých vád — právnych aj tých v katastri.", `${IMG}/mesto.jpg`],
  ["03", "Pracovné právo", "Poriadok vo vzťahoch so zamestnancami skôr, než ho bude vymáhať súd.", `${IMG}/kniznica.jpg`],
  ["04", "Súdne spory", "Keď rokovanie skončilo. Pripravení, vecní, bez divadla.", `${IMG}/stlpy.jpg`],
  ["05", "Insolvencia", "Aj koniec sa dá urobiť poriadne — pre veriteľov aj pre dlžníka.", `${IMG}/hero.jpg`],
] as const

const TEAM = [
  ["JUDr. M. H.", "Partner", "obchodné právo · M&A"],
  ["JUDr. K. B.", "Partnerka", "nehnuteľnosti · development"],
  ["JUDr. P. S.", "Advokát", "súdne spory · arbitráž"],
  ["Mgr. A. V.", "Advokátka", "pracovné právo"],
] as const

/* the bronze § — the page's one ornament; gradient-clipped serif glyph */
function Paragraph({ className, size }: { className?: string; size: string }) {
  return (
    <span
      aria-hidden="true"
      className={`kx-para pointer-events-none select-none ${className ?? ""}`}
      style={{
        ...INST,
        fontSize: size,
        lineHeight: 1,
        display: "block",
        background: "linear-gradient(160deg,#f3e9d8 0%,#c98f5f 38%,#6E1F26 75%,#3a1215 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 24px 50px rgba(0,0,0,0.55)) drop-shadow(0 2px 0 rgba(255,240,220,0.3))",
        transform: "rotate(9deg)",
      }}
    >
      §
    </span>
  )
}

export function StatutHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`kx-hero relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: INK, color: STONE }}
    >
      {/* the duotone stage: photo → ink/oxblood multiply → warm bronze → vignette */}
      <div
        aria-hidden="true"
        className="kx-heroimg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${IMG}/hero.jpg)`, filter: "grayscale(1) contrast(1.12) brightness(0.6)" }}
      />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(16,17,21,0.82) 0%, rgba(42,20,24,0.72) 55%, rgba(110,31,38,0.55) 100%)", mixBlendMode: "multiply" }} />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(70% 55% at 78% 82%, rgba(196,120,70,0.38) 0%, transparent 60%)" }} />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(8,8,11,0.75) 100%)" }} />

      <div aria-hidden="true" className={`kx-para-wrap absolute z-[6] ${portal ? "top-[4%] right-[6%]" : "top-[10%] right-[7%]"} hidden sm:block`}>
        <Paragraph size={portal ? "10rem" : "clamp(11rem,30vh,19rem)"} />
      </div>

      <header className={`relative z-10 flex items-baseline justify-between border-b border-[#EDEDEA]/25 px-[clamp(1.25rem,4vw,4rem)] ${portal ? "pt-6" : "pt-10"} pb-4`}>
        <span style={{ ...INST, fontSize: "1.5rem" }}>
          Kancelária<span style={{ color: OXL }}>.</span>
        </span>
        <nav className="hidden gap-7 text-[0.6rem] tracking-[0.18em] text-[#EDEDEA]/70 md:flex" style={MONO}>
          {portal ? (
            <>
              <span>PRAX</span>
              <span>TÍM</span>
              <span>PUBLIKÁCIE</span>
              <span>KONTAKT</span>
            </>
          ) : (
            <>
              <a href="#prax" className="transition-colors hover:text-[#EDEDEA]">PRAX</a>
              <a href="#tim" className="transition-colors hover:text-[#EDEDEA]">TÍM</a>
              <a href="#publikacie" className="transition-colors hover:text-[#EDEDEA]">PUBLIKÁCIE</a>
              <a href="#kontakt" className="transition-colors hover:text-[#EDEDEA]">KONTAKT</a>
            </>
          )}
        </nav>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-[clamp(1.25rem,4vw,4rem)] py-10 text-center">
        {/* type as hero (R4): the word owns the frame — no trailing dot */}
        <h1
          className="kx-word wfx"
          style={{ ...INST, fontSize: portal ? "7rem" : "clamp(3.4rem,15.4vw,14.5rem)", lineHeight: 0.98, letterSpacing: "-0.02em", textShadow: "0 30px 80px rgba(0,0,0,0.55)", ...fx(0) }}
        >
          Kancelária
        </h1>
        <p className="wfx mt-6 max-w-[40rem] text-[1.08rem] leading-[1.65] text-[#EDEDEA]/90" style={fx(1)}>
          Právo je nástroj. Používame ho presne — obchodné a majetkové vzťahy
          od roku 1998.
        </p>
        <div className="wfx mt-8 flex flex-wrap items-center justify-center gap-4" style={fx(2)}>
          <span className="cursor-pointer px-7 py-3.5 text-[0.66rem] tracking-[0.12em] transition-transform hover:-translate-y-0.5" style={{ ...MONO, background: STONE, color: "#14161A" }}>
            NEZÁVÄZNÁ KONZULTÁCIA
          </span>
          {portal ? null : (
            <a href="#prax" className="border border-[#EDEDEA]/55 px-7 py-3.5 text-[0.66rem] tracking-[0.12em] text-[#EDEDEA]/90 backdrop-blur-[3px] transition-colors hover:border-[#EDEDEA]" style={{ ...MONO, background: "rgba(16,17,21,0.3)" }}>
              OBLASTI PRAXE ↓
            </a>
          )}
        </div>
      </div>

      {/* the record band — an institution proves itself with records */}
      <div className="relative z-10 grid grid-cols-3 border-t border-[#EDEDEA]/30 text-[0.56rem] backdrop-blur-[6px]" style={{ ...MONO, background: "rgba(10,11,14,0.45)" }}>
        {[
          ["1998", "1900", "ZALOŽENÁ"],
          ["14", "0", "ADVOKÁTOV"],
          ["SK · CZ", "", "JURISDIKCIE"],
        ].map(([v, from, l], i) => (
          <div key={l} className="wfx border-r border-[#EDEDEA]/15 px-[clamp(1rem,4vw,4rem)] py-5 last:border-r-0" style={fx(i + 2)}>
            <p className="tnum text-[2.3rem] tracking-normal" style={INST}>
              {from ? (
                <span data-count={v} data-from={from}>
                  {v}
                </span>
              ) : (
                v
              )}
            </p>
            <p className="mt-1 tracking-[0.2em] text-[#EDEDEA]/60">{l}</p>
          </div>
        ))}
      </div>
    </Shell>
  )
}

export default function StatutSite() {
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLElement>(null)

  /* scroll choreography: scrubbed parallax + count-ups. Native scroll only
     (non-negotiable #1) — the smoothness lives in what the page does with
     the scroll, never in intercepting it. Reduced motion: composed still. */
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
        /* the hero photo settles as you leave — a slow, professional drift */
        gsap.fromTo(
          ".kx-heroimg",
          { scale: 1.12, yPercent: 0 },
          { scale: 1, yPercent: -6, ease: "none", scrollTrigger: { trigger: ".kx-hero", start: "top top", end: "bottom top", scrub: true } }
        )
        /* the bronze § sinks and turns with the scroll */
        gsap.to(".kx-para-wrap", {
          yPercent: 85,
          rotation: 14,
          ease: "none",
          scrollTrigger: { trigger: ".kx-hero", start: "top top", end: "bottom top", scrub: true },
        })
        /* the word rides slightly slower than the page — depth without drama */
        gsap.to(".kx-word", {
          yPercent: 24,
          ease: "none",
          scrollTrigger: { trigger: ".kx-hero", start: "top top", end: "bottom top", scrub: true },
        })
        /* records count up once, when the band enters */
        for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-count]"))) {
          const to = Number(el.dataset.count)
          const from = Number(el.dataset.from ?? 0)
          const state = { v: from }
          gsap.to(state, {
            v: to,
            duration: 1.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(state.v))
            },
          })
        }
        /* the closing photo breathes through the section */
        gsap.fromTo(
          ".kx-closeimg",
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: "#kontakt", start: "top bottom", end: "bottom top", scrub: true } }
        )
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  return (
    <main ref={rootRef} style={{ background: STONE, color: "#14161A" }}>
      <StatutHero />

      {/* ---- the practice register, with photo previews [obys] ---- */}
      <Shell id="prax" className="px-[clamp(1.25rem,4vw,4rem)] py-[11svh]">
        <h2 className="wfx" style={{ ...INST, fontSize: "clamp(2.9rem,6.2vw,5.6rem)", lineHeight: 1, ...fx(0) }}>
          Oblasti praxe
        </h2>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_26rem]">
          <ol className="border-t border-[#14161A]/30">
            {PRACTICE.map(([n, title, body], i) => (
              <li key={n} className="wfx" style={fx(i + 1)}>
                {/* biome-ignore lint/a11y/noStaticElementInteractions: hover preview is decorative; the row itself is the content. */}
                <div
                  className="group grid cursor-default grid-cols-[3rem_1fr_2rem] items-baseline gap-5 border-b border-[#14161A]/15 py-7 transition-colors duration-300"
                  style={active === i ? { background: "rgba(110,31,38,0.05)" } : undefined}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="tnum text-[0.72rem]" style={{ ...MONO, color: OX }}>
                    {n}
                  </span>
                  <div>
                    <p
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                      style={{ ...INST, fontSize: "clamp(2.2rem,3.9vw,3.6rem)", lineHeight: 1.05, fontStyle: active === i ? "italic" : "normal" }}
                    >
                      {title}
                    </p>
                    <p className="mt-2.5 max-w-[32rem] text-[0.98rem] leading-[1.6] text-[#14161A]/80">{body}</p>
                  </div>
                  <span className="text-right text-[1.3rem] transition-colors duration-300" style={{ color: active === i ? OX : "rgba(20,22,26,0.35)" }}>
                    →
                  </span>
                </div>
              </li>
            ))}
          </ol>

          {/* the preview easel: duotone photo per row, crossfaded */}
          <div className="wfx relative hidden h-[460px] overflow-hidden border border-[#14161A]/20 lg:sticky lg:top-[10vh] lg:block" style={fx(2)}>
            {PRACTICE.map(([n, title, , img], i) => (
              <div key={n} aria-hidden={active !== i} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: active === i ? 1 : 0 }}>
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})`, filter: "grayscale(1) contrast(1.1) brightness(0.85)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(150deg, rgba(110,31,38,0.45), rgba(237,237,234,0.06))", mixBlendMode: "multiply" }} />
                <p className="absolute bottom-4 left-5 text-[0.62rem] tracking-[0.2em] text-[#EDEDEA]" style={MONO}>
                  {n} — {title.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Shell>

      {/* ---- the roster — records, not stock suits ---- */}
      <Shell id="tim" className="relative overflow-hidden px-[clamp(1.25rem,4vw,4rem)] py-[11svh]" style={{ background: INK, color: STONE }}>
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[44%] lg:block">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/stlpy.jpg)`, filter: "grayscale(1) contrast(1.1) brightness(0.5)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #101115 0%, rgba(16,17,21,0.4) 55%, rgba(110,31,38,0.35) 100%)" }} />
        </div>
        <div className="relative z-10 max-w-[44rem]">
          <h2 className="wfx" style={{ ...INST, fontSize: "clamp(2.9rem,6.2vw,5.6rem)", lineHeight: 1, ...fx(0) }}>
            Tím
          </h2>
          <ol className="mt-10 border-t border-[#EDEDEA]/25">
            {TEAM.map(([name, role, focus], i) => (
              <li key={name} className="wfx grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-[#EDEDEA]/15 py-6" style={fx(i + 1)}>
                <div>
                  <p style={{ ...INST, fontSize: "2.1rem", lineHeight: 1.1 }}>{name}</p>
                  <p className="mt-1 text-[0.6rem] tracking-[0.14em] text-[#EDEDEA]/60" style={MONO}>
                    {focus.toUpperCase()}
                  </p>
                </div>
                <p className="text-[0.66rem] tracking-[0.16em]" style={{ ...MONO, color: OXL }}>
                  {role.toUpperCase()}
                </p>
              </li>
            ))}
          </ol>
          <p className="wfx mt-6 text-[0.9rem] leading-[1.6] text-[#EDEDEA]/70" style={fx(5)}>
            … a ďalších desať advokátov a koncipientov. Každý mandát vedie
            partner osobne.
          </p>
        </div>
      </Shell>

      {/* ---- publications ---- */}
      <Shell id="publikacie" className="border-y border-[#14161A]/20 px-[clamp(1.25rem,4vw,4rem)] py-[10svh]" style={{ background: "#E4E4E0" }}>
        <h2 className="wfx" style={{ ...INST, fontSize: "clamp(2.9rem,6.2vw,5.6rem)", lineHeight: 1, ...fx(0) }}>
          Z publikácií
        </h2>
        <div className="mt-10 grid gap-px bg-[#14161A]/15 sm:grid-cols-3">
          {[
            ["2026", "Zodpovednosť konateľa po novele Obchodného zákonníka"],
            ["2025", "Vecné bremená v developerskej praxi — dvanásť rozhodnutí"],
            ["2025", "Rozhodcovské doložky, ktoré obstoja"],
          ].map(([y, t], i) => (
            <article key={t} className="wfx group cursor-pointer px-6 py-7 transition-transform duration-300 hover:-translate-y-1" style={{ background: "#E4E4E0", ...fx(i + 1) }}>
              <p className="tnum" style={{ ...INST, fontSize: "2.3rem", color: OX }}>
                {y}
              </p>
              <p className="mt-3 text-[1.18rem] leading-[1.45]" style={INST}>
                {t}
              </p>
              <p className="mt-4 text-[0.7rem] opacity-0 transition-opacity duration-300 group-hover:opacity-60" style={MONO}>
                ČÍTAŤ →
              </p>
            </article>
          ))}
        </div>
      </Shell>

      {/* ---- close ---- */}
      <Shell id="kontakt" className="relative overflow-hidden px-[clamp(1.25rem,4vw,4rem)] py-[13svh]" style={{ background: INK, color: STONE }}>
        <div aria-hidden="true" className="kx-closeimg absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/podpis.jpg)`, filter: "grayscale(1) contrast(1.1) brightness(0.45)", transform: "scale(1.15)" }} />
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(16,17,21,0.85) 0%, rgba(42,20,24,0.7) 60%, rgba(110,31,38,0.5) 100%)", mixBlendMode: "multiply" }} />
        <div className="relative z-10 mx-auto max-w-[50rem] text-center">
          <h2 className="wfx" style={{ ...INST, fontSize: "clamp(2.7rem,5.8vw,5.4rem)", lineHeight: 1.05, ...fx(0) }}>
            Prvá konzultácia je o vašom probléme, nie o našom cenníku.
          </h2>
          <div className="wfx mt-9 flex flex-wrap items-center justify-center gap-5" style={fx(1)}>
            <span className="cursor-pointer px-8 py-4 text-[0.68rem] tracking-[0.12em] transition-transform hover:-translate-y-0.5" style={{ ...MONO, background: STONE, color: "#14161A" }}>
              DOHODNÚŤ TERMÍN
            </span>
            <span className="text-[0.64rem] tracking-[0.1em] text-[#EDEDEA]/70" style={MONO}>
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
