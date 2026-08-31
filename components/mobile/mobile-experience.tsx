"use client"

import { useEffect, useId, useRef } from "react"

import { ButtonLink } from "@/components/site/button-link"
import { KonstruktPreview } from "@/components/site/previews/konstrukt"
import { LegacyPreview } from "@/components/site/previews/legacy"
import { commercial, primaryCta, secondaryCta } from "@/lib/site-config"

/**
 * THE MOBILE EXPERIENCE — separately directed, as the brief demands.
 *
 * Desktop is an interactive film; this is the trailer. Same brand, story,
 * work and offer — different pacing and different physics:
 *
 *  - **No pins, no scroll hijack, no WebGL.** Scroll is story navigation,
 *    swipe is project control, tap is action. The audit showed the v1
 *    desktop scenes dropping 49–67% of frames on throttled phones — nothing
 *    here runs a scrubbed timeline at all.
 *  - **The mark is the SVG asset with a masked light sweep** — one
 *    compositor-only animation, `motion-safe` gated, zero JavaScript.
 *  - **The work is a swipe deck**: native scroll-snap, baked textures, the
 *    ground tone following the active card through one scoped transition.
 *  - **The offer is a stack**: active state on scroll-into-view via one
 *    IntersectionObserver. The width-axis animation stays desktop-only —
 *    scrubbing `font-variation-settings` was the single worst finding of
 *    the audit (67% jank).
 *
 * ~4 screens to the CTA; the conversion epilogue (SceneClose) follows in
 * normal flow, shared with every other tier.
 */

const HEADLINE = ["Vaša firma je lepšia,", "než ukazuje váš web."]

const WORK = [
  {
    id: "konstrukt",
    index: "01",
    name: "Konštrukt",
    sector: "Stavebníctvo",
    image: "/work/konstrukt.jpg",
    alt: "Koncept webu pre stavebnú spoločnosť Konštrukt — tmavá stránka s jantárovým akcentom.",
    tone: "graphite",
  },
  {
    id: "vitalis",
    index: "02",
    name: "Vitalis",
    sector: "Súkromná klinika",
    image: "/work/vitalis.jpg",
    alt: "Koncept webu pre kliniku Vitalis — svetlá stránka s panelom voľných termínov.",
    tone: "paper",
  },
  {
    id: "forma",
    index: "03",
    name: "Forma",
    sector: "Interiérové štúdio",
    image: "/work/forma.jpg",
    alt: "Koncept webu pre interiérové štúdio Forma — editoriálna stránka na teplom podklade.",
    tone: "paper",
  },
] as const

const OFFER = [
  { word: "Stratégia", line: "Najprv pochopíme firmu, zákazníka a to, čo má web dosiahnuť." },
  { word: "Dizajn", line: "Vizuálny systém, ktorý firmu odlíši a dodá jej dôveryhodnosť." },
  { word: "Vývoj", line: "Rýchla, responzívna realizácia pripravená na produkciu." },
]

/** M1 — hero: everything visible immediately, one ambient sweep. */
function MobileHero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-background"
    >
      {/* The mark, masked light sweep riding over the mono SVG. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[8svh] right-[-12vw] h-[62vw] w-[62vw] max-h-[24rem] max-w-[24rem]"
      >
        <div
          className="mobile-mark absolute inset-0"
          style={{
            maskImage: "url(/brand/codera-mark-mono.svg)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskImage: "url(/brand/codera-mark-mono.svg)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
      </div>

      <div className="container-page relative z-10 pb-[clamp(2.5rem,7svh,4rem)]">
        <p className="label text-muted-foreground">Digitálne štúdio — Slovensko</p>
        <h1 id="hero-heading" className="mt-5 text-mega text-foreground">
          {HEADLINE.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p data-hero-lead className="mt-5 max-w-[28rem] text-lead text-pretty text-muted-foreground">
          Navrhujeme a vyvíjame weby, ktoré menia to, ako zákazníci vnímajú
          vašu firmu.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href={primaryCta.href} variant="brand" size="xl">
            {primaryCta.label}
          </ButtonLink>
          <ButtonLink href={secondaryCta.href} variant="quiet" size="xl">
            {secondaryCta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

/** M2 — premena: the comparison, unpinned, tap-and-drag only. */
function MobilePremena() {
  const stageRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  useEffect(() => {
    const stage = stageRef.current
    const input = inputRef.current
    if (!stage || !input) {
      return
    }
    const onInput = () => {
      stage.style.setProperty("--split", input.value)
      input.setAttribute(
        "aria-valuetext",
        `Zobrazené ${input.value} % pôvodného webu`
      )
    }
    input.addEventListener("input", onInput)
    return () => input.removeEventListener("input", onInput)
  }, [])

  return (
    <section id="premena" className="section-pad-sm bg-background">
      <div className="container-page">
        <p className="label text-brand">02 — Premena</p>
        <h2 className="mt-4 max-w-[16ch] text-h2 text-balance">
          Rovnaká firma. Úplne iný dojem.
        </h2>
        <p className="mt-4 max-w-[30rem] text-small text-pretty text-muted-foreground">
          Potiahnite deliacu čiaru — vľavo bežný firemný web, vpravo náš
          koncept.
        </p>

        <div
          ref={stageRef}
          data-stage
          className="group/stage relative mt-6 [--split:50]"
        >
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-[0.6rem] border border-hairline bg-background">
            {/* Cropped into the hero region so both sites stay legible at
                phone width — the audit's "impression, not comparison" fix. */}
            <div data-preview aria-hidden="true" className="@container absolute inset-0 h-[160%] w-[160%] origin-top-left scale-[0.625]">
              <KonstruktPreview />
            </div>
            <div
              data-preview
              aria-hidden="true"
              className="absolute inset-0"
              style={{ clipPath: "inset(0 calc((100 - var(--split)) * 1%) 0 0)" }}
            >
              <div className="@container absolute inset-0 h-[160%] w-[160%] origin-top-left scale-[0.625]">
                <LegacyPreview />
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[var(--metal-high)]/85"
              style={{ left: "calc(var(--split) * 1%)" }}
            >
              <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--metal-high)] shadow-[var(--shadow-lift)]">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
                  <path
                    d="M9 7 4 12l5 5M15 7l5 5-5 5"
                    stroke="#131316"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <div className="absolute inset-0 z-20">
              <label htmlFor={inputId} className="sr-only">
                Porovnanie starého a nového webu
              </label>
              <input
                ref={inputRef}
                id={inputId}
                type="range"
                min={0}
                max={100}
                step={1}
                defaultValue={50}
                aria-valuetext="Zobrazené 50 % pôvodného webu"
                className="h-full w-full cursor-col-resize appearance-none bg-transparent [&::-moz-range-thumb]:h-11 [&::-moz-range-thumb]:w-11 [&::-moz-range-thumb]:cursor-col-resize [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-thumb]:h-11 [&::-webkit-slider-thumb]:w-11 [&::-webkit-slider-thumb]:cursor-col-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
              />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="label text-faint">Typický web</span>
            <span className="label text-brand">Codera</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** M3 — práca: the swipe deck. Native snap, ground follows the active card. */
function MobileWork() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === "undefined") {
      return
    }
    const cards = section.querySelectorAll<HTMLElement>("[data-deck-card]")
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const tone = (entry.target as HTMLElement).dataset.tone
            if (tone === "paper") {
              section.dataset.chapter = "paper"
            } else {
              delete section.dataset.chapter
            }
          }
        }
      },
      { root: null, threshold: 0.6 }
    )
    for (const card of cards) {
      observer.observe(card)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="praca"
      data-tone-zone=""
      className="section-pad-sm bg-background transition-colors duration-700"
    >
      <div className="container-page flex items-baseline justify-between">
        <div>
          <p className="label text-brand">03 — Práca</p>
          <h2 className="mt-4 text-h2">Vybrané koncepty</h2>
        </div>
        <p className="label text-faint">Potiahnite →</p>
      </div>

      <ul className="scrollbar-none mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-2">
        {WORK.map((project) => (
          <li
            key={project.id}
            data-deck-card
            data-tone={project.tone}
            className="w-[85vw] max-w-[26rem] shrink-0 snap-center"
          >
            <div className="overflow-hidden rounded-[0.6rem] border border-hairline bg-card shadow-[var(--shadow-lift)]">
              {/* Baked texture — the same asset the desktop world projects. */}
              {/* biome-ignore lint/performance/noImgElement: static same-origin asset with known dimensions; next/image adds nothing here. */}
              <img
                src={project.image}
                srcSet={`${project.image.replace(".jpg", "-sm.jpg")} 720w, ${project.image} 1440w`}
                sizes="(min-width: 640px) 26rem, 85vw"
                alt={project.alt}
                width={1440}
                height={900}
                loading="lazy"
                decoding="async"
                className="aspect-16/10 w-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <div>
                <p className="label text-brand">
                  {project.index} — {project.sector}
                </p>
                <h3 className="mt-1.5 text-h3 text-foreground">{project.name}</h3>
              </div>
              <span className="label shrink-0 rounded-full border border-border-strong/50 px-2.5 py-1 text-faint">
                Koncept
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="container-page mt-4 text-caption text-muted-foreground">
        Ukážkové koncepty — nejde o realizácie pre klientov.
      </p>
    </section>
  )
}

/** M4 — ponuka: a stack; the active row follows the viewport. */
function MobileOffer() {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list || typeof IntersectionObserver === "undefined") {
      return
    }
    const rows = list.querySelectorAll<HTMLElement>("[data-offer-item]")
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ;(entry.target as HTMLElement).dataset.active = String(
            entry.isIntersecting
          )
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    )
    for (const row of rows) {
      observer.observe(row)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <section id="sluzby" className="section-pad-sm bg-background">
      <div className="container-page">
        <p className="label text-brand">04 — Ponuka</p>
        <h2 className="sr-only">Čo robíme</h2>
        <ul ref={listRef} className="mt-6 flex flex-col gap-8">
          {OFFER.map((service) => (
            <li
              key={service.word}
              data-offer-item
              data-active="false"
              className="opacity-40 transition-opacity duration-500 data-[active=true]:opacity-100"
            >
              <h3 className="text-h1 tracking-[-0.035em] text-foreground">
                {service.word}
              </h3>
              <p className="mt-2 max-w-[26rem] text-small text-pretty text-muted-foreground">
                {service.line}
              </p>
            </li>
          ))}
        </ul>
        <p className="label mt-9 text-faint">
          {commercial.priceFromSentence}
        </p>
      </div>
    </section>
  )
}

export function MobileExperience() {
  /* `display: contents`: the wrapper exists only so tests and tooling can
     tell which experience is mounted; it contributes nothing to layout. */
  return (
    <div data-experience="mobile" className="contents">
      <MobileHero />
      <MobilePremena />
      <MobileWork />
      <MobileOffer />
    </div>
  )
}
