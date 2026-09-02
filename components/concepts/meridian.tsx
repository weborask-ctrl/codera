"use client"

/**
 * MERIDIÁN — the roastery concept as a full shop (AD v3 amendment 2;
 * redesigned in the Ukážka 02 session, 2026-09-02).
 *
 * Origin-as-film over big colourful photography [onyx R1-left, Ondrej's
 * pick] with the product-commerce grammar of cowboy [R4]: full-bleed green
 * harvest hero, a running data ticker, big serif headlines, colour-first
 * product cards with a WORKING cart count, the deep-green subscription
 * band, the story split. Fraunces voice, kost/umbra warmed by terracotta
 * and leaf green. Motion is scroll-scrubbed (Ken Burns hero, story
 * parallax) plus the ticker; native scroll only; reduced motion reads a
 * composed still. The mechanic is ORDER.
 *
 * Photos: Unsplash licence, stored locally under /demos/praziaren/.
 */

import { useEffect, useRef, useState } from "react"
import { FR, fx, MONO, Shell } from "./shell"

const KOST = "#F4EFE7"
const UMBRA = "#241F18"
const CREAM = "#FFF8EE"
const TERRA = "#E4572E"
const GREEN = "#274D36"
const AMBER = "#FFC49B"

const IMG = "/demos/praziaren"

const BEANS = [
  { name: "Guji", origin: "ETIÓPIA · UMYTÁ", note: "broskyňa · čierny čaj · jasná", price: "14,90 €", img: `${IMG}/zrna.jpg` },
  { name: "Huila", origin: "KOLUMBIA · HONEY", note: "kakao · pomaranč · guľatá", price: "13,50 €", img: `${IMG}/chemex.jpg` },
  { name: "Ranná", origin: "ZMES · ESPRESSO", note: "orech · karamel · hustá crema", price: "12,90 €", img: `${IMG}/espresso.jpg` },
] as const

const TICKER = [
  ["ET·06", "GUJI — BROSKYŇA · ČIERNY ČAJ"],
  ["CO·11", "HUILA — KAKAO · POMARANČ"],
  ["2 050 m", "NADMORSKÁ VÝŠKA ZBERU"],
  ["UT · PIA", "PRAŽÍME DVAKRÁT DO TÝŽDŇA"],
  ["48 h", "OD PRAŽENIA K VÁM"],
  ["100 %", "ARABICA · PRIAMY NÁKUP"],
] as const

export function MeridianHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`pz-hero relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: UMBRA, color: CREAM }}
    >
      {/* the hero still (Ondrej's pick from the mock): dark roasted beans
          in burlap — sharp and moody; the green lives in the subscription
          band and the story imagery */}
      <div
        aria-hidden="true"
        className="pz-heroimg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${IMG}/vrece.jpg)` }}
      />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,24,16,0.5) 0%, rgba(18,24,16,0.12) 42%, rgba(18,24,16,0.62) 100%)" }} />

      <header className="relative z-10 flex items-center justify-between px-[clamp(1.25rem,4vw,3.5rem)] pt-6 pb-4">
        <span style={{ ...FR, fontWeight: 560, fontSize: "1.5rem" }}>Pražiareň</span>
        <nav className="hidden gap-7 text-[0.86rem] font-medium md:flex">
          <span className="cursor-pointer opacity-95 transition-opacity hover:opacity-100">Káva</span>
          <span className="cursor-pointer opacity-95 transition-opacity hover:opacity-100">Predplatné</span>
          <span className="cursor-pointer opacity-95 transition-opacity hover:opacity-100">Veľkoobchod</span>
          <span className="cursor-pointer opacity-95 transition-opacity hover:opacity-100">Príbeh</span>
        </nav>
        <span data-cart className="rounded-full px-4 py-2 text-[0.8rem] font-semibold" style={{ background: CREAM, color: UMBRA }}>
          Košík · 0
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-[clamp(1.25rem,4vw,3.5rem)] pb-8">
        <h1
          className="wfx max-w-[10em]"
          style={{ ...FR, fontWeight: 560, fontSize: portal ? "4.4rem" : "clamp(2.8rem,8.6vw,8rem)", lineHeight: 1, letterSpacing: "-0.02em", textShadow: "0 20px 60px rgba(18,24,16,0.5)", ...fx(0) }}
        >
          Káva s vlastnou zemepisnou šírkou
        </h1>
        <p className="wfx mt-4 max-w-[38rem] text-[1.1rem] leading-[1.55]" style={{ textShadow: "0 2px 20px rgba(18,24,16,0.6)", ...fx(1) }}>
          Guji, 2 050 m n. m. Zbierané v tieni, pražené v utorok, u vás do 48
          hodín.
        </p>
        <div className="wfx mt-7 mb-2 flex flex-wrap items-center gap-4" style={fx(2)}>
          {/* the portal wraps the hero in an <a> — no nested anchors there */}
          {portal ? (
            <span className="rounded-full px-8 py-4 text-[1rem] font-semibold" style={{ background: TERRA, color: CREAM }}>
              Nakupovať kávu
            </span>
          ) : (
            <>
              <a href="#kava" className="rounded-full px-8 py-4 text-[1rem] font-semibold transition-transform hover:-translate-y-0.5" style={{ background: TERRA, color: CREAM }}>
                Nakupovať kávu
              </a>
              <a href="#pribeh" className="rounded-full border-[1.5px] border-[#FFF8EE]/70 px-8 py-4 text-[1rem] font-medium backdrop-blur-[3px] transition-colors hover:border-[#FFF8EE]">
                Ako pražíme →
              </a>
            </>
          )}
        </div>
      </div>

      {/* the data ticker (onyx): origin facts on a loop */}
      <div className="relative z-10 overflow-hidden border-t border-[#FFF8EE]/25 backdrop-blur-[8px]" style={{ background: "rgba(18,24,16,0.55)" }}>
        <div className="pz-ticker flex w-max">
          {[...TICKER, ...TICKER].map(([v, l], i) => (
            <div
              key={`${v}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: the loop is a doubled static list.
                i
              }`}
              className="flex items-baseline gap-2.5 border-r border-[#FFF8EE]/15 px-6 py-3.5 text-[0.68rem] tracking-[0.08em] whitespace-nowrap"
              style={MONO}
            >
              <b className="text-[0.8rem]" style={{ color: AMBER }}>{v}</b> {l}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  )
}

export default function MeridianSite() {
  const [cart, setCart] = useState(0)
  const rootRef = useRef<HTMLElement>(null)

  /* scroll choreography: Ken Burns hero + story parallax. Native scroll
     only (non-negotiable #1); reduced motion keeps the stills. */
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
        gsap.fromTo(
          ".pz-heroimg",
          { scale: 1.14, yPercent: 0 },
          { scale: 1, yPercent: -5, ease: "none", scrollTrigger: { trigger: ".pz-hero", start: "top top", end: "bottom top", scrub: true } }
        )
        gsap.fromTo(
          ".pz-storyimg",
          { yPercent: -10 },
          { yPercent: 10, ease: "none", scrollTrigger: { trigger: "#pribeh", start: "top bottom", end: "bottom top", scrub: true } }
        )
        gsap.fromTo(
          ".pz-subimg",
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: "#predplatne", start: "top bottom", end: "bottom top", scrub: true } }
        )
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  const addToCart = () => {
    setCart((c) => c + 1)
    const badge = document.querySelector("[data-cart]")
    if (badge) {
      badge.textContent = `Košík · ${cart + 1}`
    }
  }

  return (
    <main ref={rootRef} style={{ background: KOST, color: UMBRA }}>
      <MeridianHero />

      {/* ---- the shop ---- */}
      <Shell id="kava" className="px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh]">
        <h2 className="wfx" style={{ ...FR, fontWeight: 560, fontSize: "clamp(2.4rem,5.4vw,4.6rem)", letterSpacing: "-0.015em", ...fx(0) }}>
          Čerstvo upražené
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {BEANS.map((b, i) => (
            <article
              key={b.name}
              className="wfx group overflow-hidden rounded-[18px] transition-transform duration-300 hover:-translate-y-1.5"
              style={{ background: CREAM, boxShadow: "0 24px 50px -30px rgba(60,35,15,0.35)", ...fx(i + 1) }}
            >
              <div
                className="h-[300px] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                style={{ backgroundImage: `url(${b.img})` }}
              />
              <div className="px-6 pt-5 pb-6">
                <p className="text-[0.64rem] tracking-[0.14em]" style={{ ...MONO, color: GREEN }}>
                  {b.origin}
                </p>
                <h3 className="mt-1.5" style={{ ...FR, fontWeight: 560, fontSize: "1.9rem" }}>
                  {b.name}
                </h3>
                <p className="mt-1 text-[0.9rem] text-[#241F18]/70">{b.note}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span style={{ ...FR, fontWeight: 560, fontSize: "1.5rem" }}>{b.price}</span>
                  <button
                    type="button"
                    onClick={addToCart}
                    className="rounded-full px-5 py-2.5 text-[0.85rem] font-semibold transition-transform active:scale-95"
                    style={{ background: UMBRA, color: CREAM }}
                  >
                    Do košíka
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Shell>

      {/* ---- subscription — the deep-green band (viac zelene) ---- */}
      <Shell id="predplatne" className="relative overflow-hidden px-[clamp(1.25rem,4vw,3.5rem)] py-[10svh]" style={{ background: GREEN, color: CREAM }}>
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden lg:block">
          <div className="pz-subimg absolute inset-[-10%] bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/vetva.jpg)` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #274D36 0%, rgba(39,77,54,0.25) 60%, rgba(39,77,54,0.1) 100%)" }} />
        </div>
        <div className="relative z-10 max-w-[40rem]">
          <h2 className="wfx" style={{ ...FR, fontWeight: 560, fontSize: "clamp(2.4rem,5.4vw,4.6rem)", lineHeight: 1.02, letterSpacing: "-0.015em", ...fx(0) }}>
            Predplatné bez záväzkov
          </h2>
          <p className="wfx mt-5 max-w-[30rem] text-[1.08rem] leading-[1.6] text-[#FFF8EE]/85" style={fx(1)}>
            Každé 2 alebo 4 týždne čerstvá dávka podľa vášho výberu. Zmeníte
            alebo zrušíte kedykoľvek — bez poplatkov, bez otázok.
          </p>
          <div className="wfx mt-7 flex flex-wrap items-center gap-4" style={fx(2)}>
            <span className="cursor-pointer rounded-full px-7 py-3.5 text-[0.95rem] font-semibold transition-transform hover:-translate-y-0.5" style={{ background: CREAM, color: GREEN }}>
              Zostaviť predplatné
            </span>
            <span className="text-[0.85rem] text-[#FFF8EE]/75">od 11,90 € / dávka · doprava v cene</span>
          </div>
        </div>
      </Shell>

      {/* ---- the story split ---- */}
      <Shell id="pribeh" className="grid lg:grid-cols-2">
        <div className="relative min-h-[420px] overflow-hidden">
          <div className="pz-storyimg absolute inset-[-12%] bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/cerene.jpg)` }} />
        </div>
        <div className="flex flex-col justify-center px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh]">
          <h2 className="wfx max-w-[9em]" style={{ ...FR, fontWeight: 560, fontSize: "clamp(2.2rem,4.4vw,3.8rem)", lineHeight: 1.04, letterSpacing: "-0.015em", ...fx(0) }}>
            Pražíme v utorok a piatok. Nikdy na sklad.
          </h2>
          <p className="wfx mt-5 max-w-[30rem] text-[1.02rem] leading-[1.65] text-[#241F18]/75" style={fx(1)}>
            Malé dávky, profil pre každé zrno zvlášť. Balíme v deň praženia a
            posielame do 24 hodín — káva k vám príde vo chvíli, keď začína
            najlepšie chutiť.
          </p>
          <div className="wfx mt-7 grid max-w-[26rem] grid-cols-2 gap-6" style={fx(2)}>
            <div>
              <p style={{ ...FR, fontWeight: 560, fontSize: "2.2rem" }}>48 h</p>
              <p className="mt-1 text-[0.85rem] text-[#241F18]/65">od praženia k vám</p>
            </div>
            <div>
              <p style={{ ...FR, fontWeight: 560, fontSize: "2.2rem" }}>2×</p>
              <p className="mt-1 text-[0.85rem] text-[#241F18]/65">pražíme do týždňa</p>
            </div>
          </div>
        </div>
      </Shell>

      {/* ---- benefit band (cowboy) ---- */}
      <Shell as="div" className="grid border-t-[1.5px] border-[#241F18]/15 sm:grid-cols-3">
        {[
          ["Pražíme utorok a piatok", "odosielame do 24 h od praženia"],
          ["Doprava zdarma od 40 €", "kuriér aj balíkobox"],
          ["Predplatné bez záväzkov", "každé 2 alebo 4 týždne, kedykoľvek zrušíte"],
        ].map(([t, s], i) => (
          <div key={t} className="wfx border-[#241F18]/15 px-[clamp(1.25rem,4vw,3.5rem)] py-8 not-last:border-r-[1.5px]" style={fx(i)}>
            <b className="block text-[1.05rem] font-semibold">{t}</b>
            <span className="mt-1 block text-[0.9rem] text-[#241F18]/65">{s}</span>
          </div>
        ))}
      </Shell>

      <footer className="flex flex-wrap items-baseline justify-between gap-3 border-t border-[#241F18]/15 px-[clamp(1.25rem,4vw,3.5rem)] py-5 text-[0.56rem] tracking-[0.14em] text-[#241F18]/55" style={MONO}>
        <span>PRAŽIAREŇ · PRIAMY NÁKUP OD FARMÁROV</span>
        <span>KOŠÍK V DEME: {cart} POLOŽIEK</span>
      </footer>
    </main>
  )
}
