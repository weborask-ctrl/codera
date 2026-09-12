"use client"

/**
 * WORDPRESS — the fifth capability as a full demo (Iterácia 1.2, Ondrej's
 * brief 2026-09-04; the editor grown into a real back office and the close
 * brought alive in Iterácia 4.0, 2026-09-12: "aby si klienti vedeli toho viac
 * vyskúšať, plus uprav dizajn konca tej stránky, chcem ho viac živý").
 *
 * The honest way to show WordPress is to let the visitor DO the thing it is
 * for: a fictional bakery site sits inside a live editor (wordpress-editor.tsx)
 * and every change — content, look, sections, dishes, posts, a shop with a
 * cart, language — lands in the preview at once, on a desktop or a phone,
 * with publish, revisions and reset. Around it: what the platform brings
 * (general facts about WordPress, nothing invented about the studio), when it
 * fits and when custom code is the honest answer, and a close where the
 * visitor's own edited site stands in the room and keeps living: it tilts
 * with the pointer, its blocks float, its news run as a ticker, the light
 * behind it breathes. Warm paper, ink, an editor-blue accent with the
 * bakery's amber. Photos generated for this concept in Higgsfield. No
 * canvas; the depth is CSS 3D on the pointer.
 */

import { useEffect, useRef } from "react"
import { BRIC, FR, fx, KonceptLine, MONO, Shell } from "./shell"
import { AMBER, BLUE, DEFAULT_SITE, Editor, INK, localize, PAPER, Preview, useSiteState } from "./wordpress-editor"

const PAD = "px-[clamp(1.25rem,4vw,3.5rem)]"

const FACTS = [
  ["Editor blokov", "Texty, fotky a sekcie upravíš ako v dokumente — bez kódu, bez čakania."],
  ["Novinky a blog", "Nový článok za päť minút. Vyhľadávače milujú stránky, ktoré žijú."],
  ["E-shop cez WooCommerce", "Produkty, košík, platby a doprava na tej istej platforme ako obsah."],
  ["Viac jazykov", "Slovenská aj anglická verzia z jedného miesta, s prepínačom pre návštevníka."],
  ["Rozšírenia", "Rezervácie, formuláre, newsletter — tisíce overených doplnkov namiesto vývoja od nuly."],
  ["Aktualizácie a zálohy", "Platforma sa udržiava; obsah aj nastavenia sa zálohujú automaticky."],
] as const

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
            <Preview site={DEFAULT_SITE} compact />
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

/* --------------------------------------------------------------- close --- */

/** The visitor's own site keeps living at the end: it stands in the room on
 *  a desktop and a phone, tilts with the pointer, its blocks float, its news
 *  and dishes run as a ticker, the light behind it breathes. Whatever they
 *  changed above is named back to them. */
function WordpressClose({ state }: { state: ReturnType<typeof useSiteState> }) {
  const { site, changes, cart } = state
  const c = localize(site)
  const ticker = [
    ...c.news.map((p) => `${p.title || "…"}`),
    ...c.menu.map((d) => `${d.name || "…"} ${d.price}`),
    `${c.hours} · ${c.name}`,
  ]
  const chips: [string, boolean][] = [
    ["Nadpis", changes.includes("nadpis")],
    ["Farba", changes.includes("farbu")],
    ["Menu", changes.includes("menu")],
    ["Novinky", changes.includes("novinky")],
    ["Obchod", changes.includes("obchod")],
    ["Fotka", changes.includes("fotku")],
    ["Jazyk", changes.includes("jazyk") || changes.includes("preklad")],
  ]
  return (
    <Shell id="zaver" className={`wp-close relative overflow-hidden ${PAD} py-[12svh]`} style={{ background: INK, color: PAPER }}>
      {/* the light: two soft bodies of colour, breathing and drifting */}
      <div aria-hidden="true" className="wp-glow wp-glow-a absolute" style={{ background: `radial-gradient(closest-side, ${site.accent}, transparent 70%)` }} />
      <div aria-hidden="true" className="wp-glow wp-glow-b absolute" style={{ background: `radial-gradient(closest-side, ${BLUE}, transparent 70%)` }} />

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="wfx text-[0.62rem] tracking-[0.22em] text-[#F6F1E7]/55" style={{ ...MONO, ...fx(0) }}>
            VAŠA STRÁNKA · ŽIVÁ
          </p>
          <h2 className="wfx mt-4 max-w-[14ch] text-balance" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.8rem,7vw,6.4rem)", lineHeight: 1, letterSpacing: "-0.02em", ...fx(1) }}>
            Obsah je tvoj. <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, color: site.accent }}>Technika je naša.</em>
          </h2>
          <p className="wfx mt-6 max-w-[30rem] text-[1.02rem] leading-[1.6] text-[#F6F1E7]/75" style={fx(2)} data-changes={changes.length}>
            {changes.length ? (
              <>
                Pred chvíľou ste zmenili <b className="text-[#F6F1E7]">{changes.join(", ")}</b>
                {cart ? ` a do košíka dali ${cart} ${cart === 1 ? "kus" : cart < 5 ? "kusy" : "kusov"}` : ""}. Presne takto to bude vyzerať u vás: stránka, ktorú si meníte sami, a my sa staráme, aby bežala rýchlo a bezpečne.
              </>
            ) : (
              <>Skúste hore zmeniť nadpis alebo pridať jedlo do menu — objaví sa aj tu. Postavíme stránku na WordPresse tak, aby vyzerala ako na mieru, a odovzdáme ju s editorom, v ktorom sa nedá nič pokaziť.</>
            )}
          </p>
          <div className="wfx mt-8 flex flex-wrap items-center gap-3" style={fx(3)}>
            <a href="/#kontakt" className="rounded-full px-8 py-4 text-[0.9rem] font-bold transition-transform hover:-translate-y-0.5" style={{ background: PAPER, color: INK }}>
              Napíšte nám
            </a>
            <a href="#editor" className="rounded-full border border-[#F6F1E7]/35 px-8 py-4 text-[0.9rem] font-medium transition-colors hover:border-[#F6F1E7]">
              Späť k editoru ↑
            </a>
          </div>
        </div>

        {/* the room: desktop and phone, depth on the pointer, blocks afloat */}
        <div className="wfx relative min-h-[26rem]" style={{ ...fx(2), perspective: "1600px" }}>
          <div
            className="wpar relative"
            style={{ ["--depth" as string]: "10", transform: "rotateY(calc(var(--tx, 0) * -10deg)) rotateX(calc(var(--ty, 0) * 8deg))", transformStyle: "preserve-3d", transition: "transform 0.3s ease-out" }}
          >
            <div className="wp-float" style={{ ["--fl" as string]: "0s" }}>
              <Preview site={site} compact cart={cart} />
            </div>
            <div
              className="wp-float absolute right-[-4%] bottom-[-10%] w-[36%] min-w-[11rem] rounded-[1.6rem] border-[6px] border-[#F6F1E7]/90 bg-[#F6F1E7] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.7)]"
              style={{ ["--fl" as string]: "-2.4s", transform: "translateZ(70px)" }}
            >
              <Preview site={site} phone compact cart={cart} />
            </div>
            {chips.map(([l, hot], i) => (
              <span
                key={l}
                className="wp-chip wp-float absolute rounded-md border-2 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.12em]"
                style={{
                  left: ["-6%", "70%", "-9%", "88%", "30%", "58%", "8%"][i],
                  top: ["10%", "-6%", "58%", "48%", "-12%", "104%", "98%"][i],
                  ["--fl" as string]: `${(-i * 0.9).toFixed(1)}s`,
                  transform: `translateZ(${50 + i * 14}px)`,
                  borderColor: hot ? site.accent : "rgba(246,241,231,0.6)",
                  background: hot ? site.accent : "rgba(27,26,23,0.85)",
                  color: hot ? "#fff" : "rgba(246,241,231,0.85)",
                  boxShadow: hot ? `0 12px 30px -10px ${site.accent}` : "none",
                }}
              >
                {l.toUpperCase()}
                {hot ? " ✓" : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* the ticker: the site's own words, running */}
      <div aria-hidden="true" className="wp-ticker relative z-10 mt-16 overflow-hidden border-y border-[#F6F1E7]/15 py-3" style={MONO}>
        <div className="wp-ticker-track flex w-max gap-10 whitespace-nowrap text-[0.66rem] tracking-[0.18em] text-[#F6F1E7]/70">
          {[...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={`${t}-${i.toString()}`}>
              {t.toUpperCase()} <span style={{ color: site.accent }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </Shell>
  )
}

/* ---------------------------------------------------------------- site --- */

export default function WordpressSite() {
  const state = useSiteState()
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
        gsap.utils.toArray<HTMLElement>(".wp-hero .wp-chip").forEach((el, i) => {
          gsap.to(el, { y: (i % 2 ? -1 : 1) * (28 + i * 10), ease: "none", scrollTrigger: { trigger: ".wp-hero", start: "top top", end: "bottom top", scrub: true } })
        })
        gsap.fromTo(".wp-tilt", { y: 0 }, { y: -60, ease: "none", scrollTrigger: { trigger: ".wp-hero", start: "top top", end: "bottom top", scrub: true } })
        /* the light in the close climbs as the visitor arrives */
        gsap.fromTo(".wp-glow-a", { yPercent: 30 }, { yPercent: -20, ease: "none", scrollTrigger: { trigger: ".wp-close", start: "top bottom", end: "bottom top", scrub: true } })
        gsap.fromTo(".wp-glow-b", { yPercent: -30 }, { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".wp-close", start: "top bottom", end: "bottom top", scrub: true } })
      }, rootRef)
    })()
    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  return (
    <main ref={rootRef} style={{ background: PAPER, color: INK }}>
      <WordpressHero />

      {/* ---- the editor: change it, see it ---- */}
      <Shell id="editor" className={`border-t border-[#1B1A17]/10 ${PAD} py-[10svh]`} style={{ background: "#FBF8F2" }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="wfx text-balance" style={{ ...BRIC, fontWeight: 800, fontSize: "clamp(2.4rem,5.4vw,4.6rem)", lineHeight: 1, letterSpacing: "-0.02em", ...fx(0) }}>
            Zmeň to. <em style={{ ...FR, fontStyle: "italic", fontWeight: 400, color: BLUE }}>Hneď to vidíš.</em>
          </h2>
          <p className="wfx max-w-[26rem] text-[0.9rem] leading-[1.5] text-[#1B1A17]/60" style={fx(1)}>
            Obsah, vzhľad, sekcie, jedlá a ceny, články, obchod s košíkom, jazyk.
            Publikovanie s revíziami. Náhľad na počítači aj telefóne. Všetko
            ostáva uložené, aj keď stránku obnovíte.
          </p>
        </div>
        <Editor state={state} />
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
      <Shell id="kedy" className={`${PAD} py-[10svh]`} style={{ background: "#2A2823", color: PAPER }}>
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
            <p className="text-[0.62rem] tracking-[0.22em]" style={{ ...MONO, color: "#8FA8FF" }}>
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

      <WordpressClose state={state} />

      <footer className={`flex flex-wrap items-baseline justify-between gap-3 border-t border-[#1B1A17]/12 ${PAD} py-5 text-[0.56rem] tracking-[0.14em] text-[#1B1A17]/55`} style={MONO}>
        <span>PEKÁREŇ KÔRKA JE FIKTÍVNA · FOTOGRAFIE GENEROVANÉ PRE TENTO KONCEPT · NIČ SA NIKAM NEODOSIELA</span>
        <KonceptLine />
      </footer>
    </main>
  )
}
