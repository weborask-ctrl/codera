"use client"

/**
 * WORDPRESS — the fifth capability as a full demo (Iterácia 1.2, Ondrej's
 * brief 2026-09-04: replace Výkon with a WordPress demo that briefly shows
 * what WordPress gives a client's site; design per the earlier passes).
 *
 * The honest way to show WordPress is to let the visitor DO the thing it
 * is for: a fictional bakery site sits inside a live block editor, and
 * every change — headline, accent, sections, language — lands in the
 * preview at once. Around it: what the platform brings (general facts
 * about WordPress, nothing invented about the studio), when it fits and
 * when custom code is the honest answer, the close. Warm paper, ink, an
 * editor-blue accent with the bakery's amber. Photos generated for this
 * concept in Higgsfield. No canvas; the depth is CSS 3D on the pointer.
 */

import { useEffect, useRef, useState } from "react"
import { BRIC, FR, fx, KonceptLine, MONO, Shell } from "./shell"

const PAPER = "#F6F1E7"
const INK = "#1B1A17"
const BLUE = "#2F5BFF"
const AMBER = "#E8A23A"
const IMG = "/demos/wordpress"
const PAD = "px-[clamp(1.25rem,4vw,3.5rem)]"

type Lang = "sk" | "en"
const T: Record<Lang, Record<string, string>> = {
  sk: { nav1: "Menu", nav2: "Galéria", nav3: "Rezervácia", open: "Otvorené dnes 7:00 – 18:00", menu: "Dnes na pulte", gallery: "Z pekárne", book: "Rezervuj stôl", news: "Novinky", cta: "Objednať na zajtra" },
  en: { nav1: "Menu", nav2: "Gallery", nav3: "Booking", open: "Open today 7:00 – 18:00", menu: "On the counter today", gallery: "From the bakery", book: "Book a table", news: "News", cta: "Order for tomorrow" },
}
const ACCENTS = [
  ["Jantár", AMBER],
  ["Modrá", BLUE],
  ["Lesná", "#2F7A4F"],
] as const
const SECTIONS = ["menu", "gallery", "book", "news"] as const
type SectionKey = (typeof SECTIONS)[number]

const FACTS = [
  ["Editor blokov", "Texty, fotky a sekcie upravíš ako v dokumente — bez kódu, bez čakania."],
  ["Novinky a blog", "Nový článok za päť minút. Vyhľadávače milujú stránky, ktoré žijú."],
  ["E-shop cez WooCommerce", "Produkty, košík, platby a doprava na tej istej platforme ako obsah."],
  ["Viac jazykov", "Slovenská aj anglická verzia z jedného miesta, s prepínačom pre návštevníka."],
  ["Rozšírenia", "Rezervácie, formuláre, newsletter — tisíce overených doplnkov namiesto vývoja od nuly."],
  ["Aktualizácie a zálohy", "Platforma sa udržiava; obsah aj nastavenia sa zálohujú automaticky."],
] as const

/* ----------------------------------------------------- the site preview --- */

function Preview({
  headline,
  accent,
  lang,
  on,
  compact = false,
}: {
  headline: string
  accent: string
  lang: Lang
  on: Record<SectionKey, boolean>
  compact?: boolean
}) {
  const t = T[lang]
  return (
    <div
      className="wp-site overflow-hidden rounded-[1.1rem] border border-[#1B1A17]/10 bg-white text-[#1B1A17] shadow-[0_40px_90px_-30px_rgba(27,26,23,0.45)]"
      style={{ ["--wp-accent" as string]: accent }}
    >
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-[#1B1A17]/8 bg-[#F6F1E7] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#1B1A17]/20" />
        <span className="h-2 w-2 rounded-full bg-[#1B1A17]/20" />
        <span className="h-2 w-2 rounded-full bg-[#1B1A17]/20" />
        <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[0.55rem] tracking-[0.08em] text-[#1B1A17]/55" style={MONO}>
          pekaren-korka.sk
        </span>
      </div>
      {/* the fictional site */}
      <div className={`flex items-center justify-between ${compact ? "px-4 py-2.5" : "px-6 py-3.5"}`}>
        <span style={{ ...FR, fontWeight: 600, fontSize: compact ? "0.95rem" : "1.15rem" }}>Pekáreň Kôrka</span>
        <nav className={`flex ${compact ? "gap-3 text-[0.62rem]" : "gap-5 text-[0.78rem]"} font-medium text-[#1B1A17]/70`}>
          {on.menu ? <span>{t.nav1}</span> : null}
          {on.gallery ? <span>{t.nav2}</span> : null}
          {on.book ? <span style={{ color: accent, fontWeight: 700 }}>{t.nav3}</span> : null}
        </nav>
      </div>
      <div className={`relative ${compact ? "h-[150px]" : "h-[260px] md:h-[300px]"} overflow-hidden`}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/pekaren.jpg)` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(27,26,23,0.72) 0%, rgba(27,26,23,0.15) 70%)" }} />
        <div className={`relative flex h-full flex-col justify-end ${compact ? "p-4" : "p-6 md:p-8"} text-white`}>
          <p className={`${compact ? "text-[0.5rem]" : "text-[0.6rem]"} tracking-[0.2em] opacity-80`} style={MONO}>
            {t.open.toUpperCase()}
          </p>
          <h3
            className="wp-headline mt-2 max-w-[18ch] text-balance"
            style={{ ...FR, fontWeight: 600, fontSize: compact ? "1.25rem" : "clamp(1.5rem,2.6vw,2.2rem)", lineHeight: 1.05 }}
          >
            {headline || " "}
          </h3>
          <span
            className={`mt-3 w-fit rounded-full ${compact ? "px-3 py-1.5 text-[0.55rem]" : "px-4 py-2 text-[0.7rem]"} font-bold tracking-[0.1em] text-white`}
            style={{ background: accent }}
          >
            {t.cta.toUpperCase()}
          </span>
        </div>
      </div>
      {!compact ? (
        <div className="grid gap-4 p-6 md:grid-cols-[1.2fr_1fr]">
          {on.menu ? (
            <div>
              <p className="text-[0.58rem] tracking-[0.2em] text-[#1B1A17]/50" style={MONO}>
                {t.menu.toUpperCase()}
              </p>
              <ul className="mt-2 divide-y divide-[#1B1A17]/8 text-[0.85rem]">
                {[
                  ["Kváskový chlieb", "3,90 €"],
                  ["Maslový croissant", "2,40 €"],
                  ["Kardamómová buchta", "2,90 €"],
                ].map(([n, p]) => (
                  <li key={n} className="flex justify-between py-1.5">
                    <span>{n}</span>
                    <span className="tnum text-[#1B1A17]/60">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {on.gallery ? (
            <div>
              <p className="text-[0.58rem] tracking-[0.2em] text-[#1B1A17]/50" style={MONO}>
                {t.gallery.toUpperCase()}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="aspect-[4/5] rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/kolace.jpg)` }} />
                <div className="aspect-[4/5] rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/pekar.jpg)` }} />
              </div>
            </div>
          ) : null}
          {on.book ? (
            <div className="rounded-xl p-4 text-white md:col-span-2" style={{ background: accent }}>
              <p className="text-[0.95rem] font-bold">{t.book}</p>
              <p className="mt-1 text-[0.78rem] opacity-85">{lang === "sk" ? "Raňajky v sobotu pre štyroch — dve kliknutia." : "Saturday breakfast for four — two clicks."}</p>
            </div>
          ) : null}
          {on.news ? (
            <div className="border-t border-[#1B1A17]/8 pt-3 text-[0.8rem] text-[#1B1A17]/70 md:col-span-2">
              <span className="font-bold text-[#1B1A17]">{t.news}: </span>
              {lang === "sk" ? "Od pondelka pečieme aj bezlepkový chlieb." : "From Monday we also bake gluten-free bread."}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------- hero --- */

export function WordpressHero({ portal = false }: { portal?: boolean }) {
  return (
    <Shell
      className={`wp-hero relative flex h-full flex-col overflow-hidden ${portal ? "" : "min-h-svh"}`}
      style={{ background: PAPER, color: INK }}
    >
      <header className={`relative z-10 flex items-center justify-between ${PAD} pt-7 pb-3`}>
        <span style={{ ...BRIC, fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.02em" }}>
          WordPress<span style={{ color: BLUE }}>.</span>
        </span>
        <span className="hidden text-[0.62rem] tracking-[0.22em] text-[#1B1A17]/50 md:block" style={MONO}>
          UKÁŽKA — STRÁNKA S EDITOROM
        </span>
        {portal ? (
          <span className="rounded-full px-5 py-2.5 text-[0.7rem] font-bold tracking-[0.12em] text-white" style={{ background: INK }}>
            SKÚS EDITOR
          </span>
        ) : (
          <a href="#editor" className="rounded-full px-5 py-2.5 text-[0.7rem] font-bold tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5" style={{ background: INK }}>
            SKÚS EDITOR
          </a>
        )}
      </header>

      <div className={`relative z-10 grid flex-1 items-center gap-10 ${PAD} pb-10 lg:grid-cols-[1fr_1.05fr]`}>
        <div>
          <h1
            className="wfx max-w-[10ch] text-balance"
            style={{ ...BRIC, fontWeight: 800, fontSize: portal ? "4.6rem" : "clamp(3rem,7.6vw,6.8rem)", lineHeight: 0.98, letterSpacing: "-0.02em", ...fx(0) }}
          >
            Stránka, ktorú si upravíš{" "}
            <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, color: BLUE }}>sám.</em>
          </h1>
          <p className="wfx mt-6 max-w-[30rem] text-[1.1rem] leading-[1.55] text-[#1B1A17]/70" style={fx(1)}>
            WordPress dá klientovi kľúče od vlastného obsahu. Text, fotka, cena,
            nový článok — zmeníš to sám, o desiatej večer, bez volania vývojárovi.
          </p>
          <div className="wfx mt-8 flex flex-wrap items-center gap-4" style={fx(2)}>
            {portal ? (
              <span className="rounded-full px-8 py-4 text-[0.9rem] font-bold text-white" style={{ background: BLUE }}>
                Skús editor naživo
              </span>
            ) : (
              <>
                <a href="#editor" className="rounded-full px-8 py-4 text-[0.9rem] font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: BLUE }}>
                  Skús editor naživo
                </a>
                <a href="#kedy" className="rounded-full border border-[#1B1A17]/30 px-8 py-4 text-[0.9rem] font-medium transition-colors hover:border-[#1B1A17]">
                  Kedy sa hodí →
                </a>
              </>
            )}
          </div>
        </div>

        {/* the site, standing in the room: CSS depth on the pointer, block chips floating around it */}
        <div className="wfx relative" style={{ ...fx(1), perspective: "1400px" }}>
          <div
            className="wp-tilt relative"
            style={{ transform: "rotateY(calc(var(--tx, 0) * -9deg)) rotateX(calc(var(--ty, 0) * 7deg))", transformStyle: "preserve-3d", transition: "transform 0.25s ease-out" }}
          >
            <Preview headline="Chlieb, ktorý vonia už na ulici." accent={AMBER} lang="sk" on={{ menu: true, gallery: true, book: true, news: false }} compact />
            {[
              ["Nadpis", "-8%", "18%"],
              ["Obrázok", "82%", "36%"],
              ["Tlačidlo", "-6%", "72%"],
              ["Menu", "86%", "82%"],
            ].map(([l, x, y], i) => (
              <span
                key={l}
                className="wp-chip absolute rounded-md border-2 bg-white px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.12em]"
                style={{ left: x, top: y, borderColor: BLUE, color: BLUE, transform: `translateZ(${40 + i * 18}px)`, boxShadow: "0 12px 30px -10px rgba(47,91,255,0.5)" }}
              >
                {l.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* ---------------------------------------------------------------- site --- */

export default function WordpressSite() {
  const [headline, setHeadline] = useState("Chlieb, ktorý vonia už na ulici.")
  const [accent, setAccent] = useState<string>(AMBER)
  const [lang, setLang] = useState<Lang>("sk")
  const [on, setOn] = useState<Record<SectionKey, boolean>>({ menu: true, gallery: true, book: true, news: false })
  const [published, setPublished] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement>(null)

  /* scroll choreography: the hero chips drift with the scroll, the facts
     step in. Native scroll only; reduced motion keeps the stills. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    let ctx: { revert: () => void } | undefined
    let alive = true
    ;(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      if (!alive) {
        return
      }
      gsap.registerPlugin(ScrollTrigger)
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".wp-chip").forEach((el, i) => {
          gsap.to(el, { y: (i % 2 ? -1 : 1) * (28 + i * 10), ease: "none", scrollTrigger: { trigger: ".wp-hero", start: "top top", end: "bottom top", scrub: true } })
        })
        gsap.fromTo(".wp-tilt", { y: 0 }, { y: -60, ease: "none", scrollTrigger: { trigger: ".wp-hero", start: "top top", end: "bottom top", scrub: true } })
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  const label = (k: SectionKey) => ({ menu: "Menu", gallery: "Galéria", book: "Rezervácia", news: "Novinky" })[k]

  return (
    <main ref={rootRef} style={{ background: PAPER, color: INK }}>
      <WordpressHero />

      {/* ---- the editor: change it, see it ---- */}
      <Shell id="editor" className={`border-t border-[#1B1A17]/10 ${PAD} py-[10svh]`} style={{ background: "#FBF8F2" }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="wfx text-balance" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,5.4vw,4.6rem)", lineHeight: 1, letterSpacing: "-0.02em", ...fx(0) }}>
            Zmeň to. <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, color: BLUE }}>Hneď to vidíš.</em>
          </h2>
          <p className="wfx text-[0.66rem] tracking-[0.2em] text-[#1B1A17]/50" style={{ ...MONO, ...fx(1) }}>
            TAKTO VYZERÁ DEŇ KLIENTA S WORDPRESSOM
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[22rem_1fr]">
          {/* the panel */}
          <div className="wfx rounded-2xl border border-[#1B1A17]/10 bg-white p-6" style={fx(2)}>
            <p className="text-[0.58rem] tracking-[0.22em] text-[#1B1A17]/50" style={MONO}>
              EDITOR · ÚVODNÁ STRÁNKA
            </p>

            <label className="mt-5 block">
              <span className="text-[0.8rem] font-bold">Nadpis</span>
              <input
                value={headline}
                maxLength={48}
                onChange={(e) => setHeadline(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#1B1A17]/15 bg-[#FBF8F2] px-3 py-2.5 text-[0.95rem] outline-none focus:border-[#2F5BFF]"
                style={FR}
              />
            </label>

            <div className="mt-5">
              <span className="text-[0.8rem] font-bold">Farba značky</span>
              <div className="mt-2 flex gap-2.5">
                {ACCENTS.map(([n, c]) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAccent(c)}
                    aria-label={n}
                    aria-pressed={accent === c}
                    className="h-9 w-9 rounded-full border-2 transition-transform hover:scale-105"
                    style={{ background: c, borderColor: accent === c ? INK : "transparent" }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="text-[0.8rem] font-bold">Sekcie</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {SECTIONS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on[k]}
                    onClick={() => setOn((s) => ({ ...s, [k]: !s[k] }))}
                    className="rounded-full border px-3.5 py-1.5 text-[0.72rem] font-bold tracking-[0.06em] transition-colors"
                    style={on[k] ? { background: INK, color: PAPER, borderColor: INK } : { borderColor: "rgba(27,26,23,0.25)", color: "rgba(27,26,23,0.7)" }}
                  >
                    {label(k)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="text-[0.8rem] font-bold">Jazyk</span>
              <div className="mt-2 inline-flex overflow-hidden rounded-full border border-[#1B1A17]/20">
                {(["sk", "en"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={lang === l}
                    onClick={() => setLang(l)}
                    className="px-4 py-1.5 text-[0.72rem] font-bold tracking-[0.1em]"
                    style={lang === l ? { background: INK, color: PAPER } : { color: "rgba(27,26,23,0.7)" }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPublished(new Date().toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" }))}
              className="mt-7 w-full rounded-full px-6 py-3.5 text-[0.85rem] font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: BLUE }}
            >
              Publikovať
            </button>
            <p className="mt-3 min-h-[1.2rem] text-[0.72rem]" style={{ color: published ? "#2F7A4F" : "rgba(27,26,23,0.5)" }} aria-live="polite">
              {published ? `✓ Zverejnené o ${published}. Návštevníci to už vidia.` : "Zmeny sa zobrazujú v náhľade okamžite."}
            </p>
          </div>

          {/* the live site */}
          <div className="wfx" style={fx(3)}>
            <Preview headline={headline} accent={accent} lang={lang} on={on} />
          </div>
        </div>
      </Shell>

      {/* ---- what the platform brings ---- */}
      <Shell className={`${PAD} py-[10svh]`}>
        <h2 className="wfx max-w-[16ch] text-balance" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,5.4vw,4.6rem)", lineHeight: 1, letterSpacing: "-0.02em", ...fx(0) }}>
          Čo dostaneš s WordPressom
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map(([t, d], i) => (
            <div key={t} className="wfx rounded-2xl border border-[#1B1A17]/10 bg-white p-6 transition-transform hover:-translate-y-1" style={fx(i + 1)}>
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: i % 2 ? AMBER : BLUE }} />
              <p className="mt-4 text-[1.25rem] font-bold" style={BRIC}>
                {t}
              </p>
              <p className="mt-2 text-[0.92rem] leading-[1.55] text-[#1B1A17]/65">{d}</p>
            </div>
          ))}
        </div>
      </Shell>

      {/* ---- the honest part ---- */}
      <Shell id="kedy" className={`${PAD} py-[10svh]`} style={{ background: INK, color: PAPER }}>
        <h2 className="wfx max-w-[18ch] text-balance" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,5.4vw,4.6rem)", lineHeight: 1, letterSpacing: "-0.02em", ...fx(0) }}>
          Kedy WordPress <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, color: AMBER }}>áno</em> — a kedy radšej nie
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="wfx" style={fx(1)}>
            <p className="text-[0.62rem] tracking-[0.22em]" style={{ ...MONO, color: AMBER }}>
              WORDPRESS SEDÍ, KEĎ
            </p>
            <ul className="mt-4 space-y-3 text-[1.02rem] leading-[1.5] text-[#F6F1E7]/85">
              <li>obsah sa mení často a má ho meniť klient, nie agentúra,</li>
              <li>stránka je prezentácia, blog, katalóg alebo menší e-shop,</li>
              <li>potrebuješ jazykové verzie, rezervácie a formuláre bez vývoja od nuly,</li>
              <li>rozpočet a čas sú reálne a chceš stáť na overenej platforme.</li>
            </ul>
          </div>
          <div className="wfx" style={fx(2)}>
            <p className="text-[0.62rem] tracking-[0.22em]" style={{ ...MONO, color: BLUE }}>
              VLASTNÝ KÓD JE POCTIVEJŠÍ, KEĎ
            </p>
            <ul className="mt-4 space-y-3 text-[1.02rem] leading-[1.5] text-[#F6F1E7]/85">
              <li>stránka je aplikácia — rezervačný systém, konfigurátor, portál,</li>
              <li>pohyb, 3D a priestor sú jadrom zážitku, ako v ukážke Observatórium,</li>
              <li>každá milisekunda a každý bajt sa počíta a dizajn nesmie mať kompromis,</li>
              <li>chceš vlastniť každý riadok toho, na čom značka stojí.</li>
            </ul>
          </div>
        </div>
      </Shell>

      {/* ---- close ---- */}
      <Shell className={`${PAD} py-[14svh]`}>
        <h2 className="wfx max-w-[14ch] text-balance" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.8rem,7vw,6.4rem)", lineHeight: 1, letterSpacing: "-0.02em", ...fx(0) }}>
          Obsah je tvoj. <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, color: BLUE }}>Technika je naša.</em>
        </h2>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
          <p className="wfx max-w-[30rem] text-[1.02rem] leading-[1.6] text-[#1B1A17]/70" style={fx(1)}>
            Postavíme stránku na WordPresse tak, aby vyzerala ako na mieru — a
            odovzdáme ju s editorom, v ktorom sa nedá nič pokaziť.
          </p>
          <a href="/#kontakt" className="wfx rounded-full px-8 py-4 text-[0.9rem] font-bold text-white transition-transform hover:-translate-y-0.5" style={{ ...fx(2), background: INK }}>
            Napíšte nám
          </a>
        </div>
      </Shell>

      <footer className={`flex flex-wrap items-baseline justify-between gap-3 border-t border-[#1B1A17]/12 ${PAD} py-5 text-[0.56rem] tracking-[0.14em] text-[#1B1A17]/55`} style={MONO}>
        <span>PEKÁREŇ KÔRKA JE FIKTÍVNA · FOTOGRAFIE GENEROVANÉ PRE TENTO KONCEPT</span>
        <KonceptLine />
      </footer>
    </main>
  )
}
