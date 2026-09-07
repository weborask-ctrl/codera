"use client"

/**
 * Codera City — the five acts as DOM (Iterácia 2.0, Ondrej's approved
 * direction 2026-09-05: one continuous 5D world, the city we build).
 *
 * /01 hero above the city at dawn · /02 the street of demos at noon ·
 * /03 the platforms at golden hour · /04 the bridge at dusk · /05 the
 * landing hall at night. In city mode (≥1024px, motion allowed) the world
 * lives on the fixed stage behind this DOM and the seams between acts are
 * camera flights; in the flat edit every act carries its own plate of the
 * same world with a cloud band on the seam. Same story, different edit.
 *
 * Copy is Slovak; every commercial fact comes from lib/site-config.
 * References named in the PR: activetheory, lusion, zentry, refokus
 * (two-voice type: Bricolage structure + Fraunces italic humanity).
 */

import { useEffect } from "react"
import { openEnquiry } from "@/components/experience/enquiry-bus"
import { bindStage } from "@/components/experience/stage"
import { commercial, packages, siteConfig, wordpressService } from "@/lib/site-config"
import { skills } from "@/lib/skills"
import { demoShot, HOME_DEMOS } from "./demos"

const DISPLAY = { fontFamily: "var(--font-bricolage), var(--font-geist-sans), sans-serif" }
const ACCENT = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: "0",
} as const
const MONO = { fontFamily: "var(--font-geist-mono)" }

const SERVICES = [
  ["01", "Stratégia", "Najprv pochopíme vašu firmu, zákazníkov a to, čo má web reálne priniesť."],
  ["02", "Dizajn", "Z pochopenia vznikne vizuálny systém, ktorý firmu odlíši a pôsobí dôveryhodne."],
  ["03", "Vývoj", "Rýchly, responzívny web pripravený na produkciu — bez kompromisov v detailoch."],
] as const

const STEPS = [
  [
    `${commercial.responseHours} h`,
    "Ozveme sa",
    `Do ${commercial.responseHours} hodín sa ozveme a spýtame sa na to, čo z formulára nevyplynulo.`,
  ],
  [
    `${commercial.firstProposalHours} h`,
    "Prvý návrh",
    `Do ${commercial.firstProposalHours} hodín uvidíte prvý vizuálny návrh vašej stránky.`,
  ],
  ["0 €", "Bez záväzku", "Ak vás nezaujme, končíme — nič neplatíte a nič nepodpisujete."],
] as const

/* ------------------------------------------------------------ binding --- */

/** Wires the scroll stage (act detection for the nav ink) and the
 *  settle-once entrances. The acts remount when the edit flips (keyed in
 *  the Experience), so one binding per mount is exact. */
function useCityStage() {
  useEffect(() => {
    const unbind = bindStage()

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-entered", "")
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: "-10% 0px" }
    )
    for (const el of document.querySelectorAll("[data-enter]")) {
      io.observe(el)
    }
    return () => {
      unbind()
      io.disconnect()
    }
  }, [])
}

/* ------------------------------------------------------------ helpers --- */

function Cta({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <button type="button" onClick={() => openEnquiry()} className={className}>
      {children}
    </button>
  )
}

/** Flat edit: the act's plate of the world plus the cloud band that carries
 *  the previous act into this one. */
function Plate({ name, band = true }: { name: string; band?: boolean }) {
  return (
    <div aria-hidden="true" className="city-plate">
      <div data-plate className={`city-plate-img city-plate-${name}`} />
      {band ? (
        /* biome-ignore lint/performance/noImgElement: screen-blended cloud plate, decorative. */
        <img className="city-band" src="/home/cloud-bank.webp" alt="" decoding="async" loading="lazy" />
      ) : null}
    </div>
  )
}

function DemoCard({
  slug,
  title,
  line,
  index,
  rail,
}: {
  slug: string
  title: string
  line: string
  index: number
  rail: boolean
}) {
  const skill = skills.find((s) => s.slug === slug)?.name ?? ""
  return (
    <a
      data-card={rail ? undefined : ""}
      href={`/ukazky/${slug}`}
      className={rail ? "city-railcard" : "city-card"}
      aria-label={`Otvoriť ukážku ${title}`}
    >
      <span className="city-card-frame">
        <span className="city-card-bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <span className="city-card-url" style={MONO}>
            codera.sk/ukazky/{slug}
          </span>
        </span>
        {/* biome-ignore lint/performance/noImgElement: a complete production screenshot of the demo, fixed aspect, sized by CSS. */}
        <img
          src={demoShot(slug, "d")}
          alt={`${title} — ${skill}`}
          width={1600}
          height={1000}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      </span>
      <span data-cap={rail ? undefined : ""} className="city-cap">
        <span className="city-cap-row">
          <span className="city-cap-title" style={DISPLAY}>
            {title}
          </span>
          <span className="city-cap-skill" style={MONO}>
            {skill.toUpperCase()}
          </span>
        </span>
        <span className="city-cap-line">{line}</span>
        <span className="city-cap-go">Otvoriť ukážku →</span>
      </span>
    </a>
  )
}

/* ------------------------------------------------------------ /01 --- */

function Hero() {
  return (
    <section data-zone="hero" className="city-act city-hero">
      {/* the hero plate stays in the city edit too: it holds the frame for
          the instant before the stage chunk arrives, then the stage hides it */}
      <Plate name="hero" band={false} />
      <div aria-hidden="true" className="city-hero-scrim" />
      <div data-enter className="enter city-hero-copy">
        <h1 className="city-h1" style={DISPLAY}>
          <span className="rise-wrap">
            <span className="rise">Vaša firma je</span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.1s" }}>
              lepšia,{" "}
              <em className="city-coral" style={ACCENT}>
                než ukazuje
              </em>
            </span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.2s" }}>
              váš web.
            </span>
          </span>
        </h1>
        <span className="rise-wrap">
          <p className="rise city-lead" style={{ ["--rise-delay" as string]: "0.32s" }}>
            Navrhujeme a staviame firemné weby, ktoré pôsobia tak dôveryhodne, ako naozaj
            pracujete.
          </p>
        </span>
        <span className="rise-wrap">
          <div className="rise city-cta-row" style={{ ["--rise-delay" as string]: "0.46s" }}>
            <Cta className="city-btn city-btn-ink">Začať projekt</Cta>
            <a href="#praca" className="city-btn city-btn-ghost">
              Zostúpiť do mesta ↓
            </a>
          </div>
        </span>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ seam --- */

/** A seam is scroll room between two acts. In the city edit the stage flies
 *  through it; in the flat edit clouds pass over it (CityFlatMotion). */
function Seam({ name, from, to, flat }: { name: string; from: string; to: string; flat: boolean }) {
  return (
    <div
      data-seam={name}
      data-from={from}
      data-to={to}
      aria-hidden="true"
      className={flat ? "city-seam city-seam-flat" : "city-seam"}
    />
  )
}

/* ------------------------------------------------------------ /02 --- */

function WorkHead() {
  return (
    <div data-enter className="enter city-head">
      <h2 className="city-h2" style={DISPLAY}>
        Neukazujeme logá klientov.{" "}
        <em className="city-tang" style={ACCENT}>
          Ukazujeme, čo vieme postaviť.
        </em>
      </h2>
      <p className="city-sub">
        Päť živých ukážok. Každá je hotová stránka, do ktorej môžete vstúpiť a preklikať si ju.
      </p>
    </div>
  )
}

function Work({ city }: { city: boolean }) {
  if (city) {
    /* the street: the visitor walks past the facades and every demo comes
       to them, complete and readable, before the next one approaches */
    return (
      <section id="praca" data-zone="work" data-walk="" className="city-act city-walk">
        <div className="city-walk-sticky">
          <WorkHead />
          <div className="city-street">
            {HOME_DEMOS.map((d, i) => (
              <DemoCard key={d.slug} slug={d.slug} title={d.title} line={d.line} index={i} rail={false} />
            ))}
          </div>
        </div>
      </section>
    )
  }
  return (
    <section id="praca" data-zone="work" className="city-act city-work-flat">
      <Plate name="street" />
      <div className="city-inner">
        <WorkHead />
      </div>
      <div className="city-rail">
        {HOME_DEMOS.map((d, i) => (
          <DemoCard key={d.slug} slug={d.slug} title={d.title} line={d.line} index={i} rail />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ /03 --- */

function Offer({ city }: { city: boolean }) {
  return (
    <section id="sluzby" data-zone="offer" className="city-act city-offer">
      {city ? null : <Plate name="services" />}
      <div className="city-inner">
        <div data-enter className="enter city-head">
          <h2 className="city-h2" style={DISPLAY}>
            Čo pre vás urobíme —{" "}
            <em className="city-coral" style={ACCENT}>
              a za koľko.
            </em>
          </h2>
        </div>

        <div className="city-signs">
          {SERVICES.map(([n, t, d], i) => (
            <div
              key={n}
              data-enter
              data-offer-row
              data-depth={(0.35 + i * 0.25).toFixed(2)}
              data-shift={((i - 1) * 0.5).toFixed(2)}
              className="enter city-glass city-sign"
            >
              <span className="city-sign-n" style={MONO}>
                {n}
              </span>
              <p className="city-sign-t" style={DISPLAY}>
                {t}
              </p>
              <p className="city-sign-d">{d}</p>
            </div>
          ))}
        </div>

        {/* three terraces, none pushed over the others — the "čo v tom nie
            je" line is the point: the price is a boundary, not bait */}
        <div className="city-terraces">
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              data-enter
              data-depth={(0.2 + (i === 1 ? 0.5 : 0)).toFixed(2)}
              data-shift={((1 - i) * 0.35).toFixed(2)}
              className="enter city-glass city-terrace"
            >
              <p className="city-terrace-name" style={DISPLAY}>
                {pkg.name}
              </p>
              <p className="city-terrace-price" style={DISPLAY}>
                <span className="city-od">od</span>
                {pkg.priceFrom}
              </p>
              <p className="city-terrace-aud">{pkg.audience}</p>
              <ul className="city-terrace-scope">
                {pkg.scope.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="city-terrace-not">Čo v tom nie je: {pkg.notIncluded}.</p>
            </div>
          ))}
        </div>

        {/* WordPress work beside the packages (Ondrej, 2026-09-07): edits and
            care for sites that already run on WordPress — the live editor demo
            shows what the client gets to touch */}
        <div data-enter data-depth="0.3" className="enter city-glass city-wp">
          <div className="city-wp-copy">
            <span className="city-sign-n" style={MONO}>
              WORDPRESS
            </span>
            <p className="city-wp-t" style={DISPLAY}>
              {wordpressService.name}
            </p>
            <p className="city-wp-d">{wordpressService.line}</p>
          </div>
          <ul className="city-wp-scope">
            {wordpressService.scope.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="city-wp-act">
            <p className="city-wp-price">{wordpressService.priceNote}</p>
            <Cta className="city-btn city-btn-ink city-btn-sm">Zistiť cenu</Cta>
            <a href={wordpressService.demo} className="city-wp-demo">
              Pozrieť ukážku editora →
            </a>
          </div>
        </div>

        <div data-enter className="enter city-offer-close">
          <p>Uvedené sú východiskové ceny — presnú cenu poviete po konzultácii.</p>
          <span>
            Koľko by stál ten váš?
            <Cta className="city-btn city-btn-ink city-btn-sm">Zistiť cenu</Cta>
          </span>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ /04 --- */

function Process({ city }: { city: boolean }) {
  return (
    <section id="proces" data-zone="process" className="city-act city-process">
      {city ? null : <Plate name="bridge" />}
      <div className="city-inner">
        <div data-enter className="enter city-head city-head-light">
          <h2 className="city-h2" style={DISPLAY}>
            Čo bude{" "}
            <em className="city-tang" style={ACCENT}>
              nasledovať.
            </em>
          </h2>
          <p className="city-sub">Tri zastávky na moste. Žiadny záväzok.</p>
        </div>
        <ol className="city-stations">
          {STEPS.map(([big, t, d], i) => (
            <li
              key={t}
              data-enter
              data-depth={(0.3 + i * 0.3).toFixed(2)}
              data-station=""
              className="enter city-glass city-glass-dark city-holo city-station"
            >
              <span className="city-station-dot" aria-hidden="true" />
              <span className="city-station-big" style={DISPLAY}>
                {big}
              </span>
              <span className="city-station-body">
                <span className="city-station-t" style={DISPLAY}>
                  {t}
                </span>
                <span className="city-station-d">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ /05 --- */

function Resolution({ city }: { city: boolean }) {
  return (
    <section id="kontakt" data-zone="resolution" className="city-act city-resolution">
      {city ? null : <Plate name="night" />}
      <div className="city-inner city-res-inner">
        <div data-enter className="enter city-res-copy">
          <h2 className="city-h2 city-h2-xl" style={DISPLAY}>
            Váš ďalší web nemusí vyzerať{" "}
            <em className="city-mint" style={ACCENT}>
              ako všetky ostatné.
            </em>
          </h2>
          <p className="city-sub">Vytvorme taký, ktorý si ľudia zapamätajú.</p>
        </div>
        <div id="dopyt" data-enter data-depth="0.5" className="enter city-glass city-glass-dark city-holo city-hall">
          <p className="city-hall-t" style={DISPLAY}>
            Začnime vaším projektom
          </p>
          <p className="city-hall-d">
            Ozveme sa do {commercial.responseHours} hodín. Konzultácia je bezplatná a nezáväzná.
          </p>
          <Cta className="city-btn city-btn-w city-btn-wide">Začať projekt</Cta>
          <p className="city-hall-links">
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phone}</a>
          </p>
        </div>
      </div>

      <footer className="city-footer">
        <div className="city-footer-row">
          <span className="city-footer-brand">
            {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
            <img src="/brand/codera-mark-mono.svg" alt="" className="h-3.5 w-3.5 opacity-70" />
            <span className="tracking-[0.26em]">CODERA</span>
          </span>
          <span>
            <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phone}</a> ·{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </span>
          <span>
            <a href="#praca">Ukážky</a> · <a href="#sluzby">Služby</a> · <a href="#kontakt">Kontakt</a>
          </span>
          <span>© 2026 Codera</span>
        </div>
        <p className="mt-2 opacity-80">
          Ukážky v sekcii 02 sú demá štúdia Codera — nejde o realizácie pre klientov.
        </p>
      </footer>
    </section>
  )
}

/* ------------------------------------------------------------ export --- */

export function CitySections({ city, seams }: { city: boolean; seams: boolean }) {
  useCityStage()
  const flat = !city
  return (
    <main
      id="hlavny-obsah"
      data-experience="v4"
      data-city={city ? "" : undefined}
      tabIndex={-1}
      className="city-main relative z-10 outline-none"
    >
      <Hero />
      {seams ? <Seam name="t1" from="hero" to="work" flat={flat} /> : null}
      <Work city={city} />
      {seams ? <Seam name="t2" from="work" to="offer" flat={flat} /> : null}
      <Offer city={city} />
      {seams ? <Seam name="t3" from="offer" to="process" flat={flat} /> : null}
      <Process city={city} />
      {seams ? <Seam name="t4" from="process" to="resolution" flat={flat} /> : null}
      <Resolution city={city} />
    </main>
  )
}
