"use client"

import ScrollReveal from "@/components/react-bits/ScrollReveal"
import { ARC_PATH } from "@/components/site/arc"
import { ButtonLink } from "@/components/site/button-link"
import { CountUp } from "@/components/site/count-up"
import { EnquiryForm } from "@/components/site/enquiry-form"
import { Magnetic } from "@/components/site/magnetic"
import { useScene } from "@/hooks/use-scene"
import { EASE } from "@/lib/motion"
import {
  commercial,
  primaryCta,
  siteConfig,
  telHref,
} from "@/lib/site-config"

/**
 * SCENE 04 — ZÁVER
 *
 * The conversion, in the order a buyer actually decides in: reason to believe,
 * then price, then the ask. The price appears here and only here — putting
 * "od 699 €" in the hero would have priced the studio before it had shown
 * anything, which is the fastest way to be compared on cost alone.
 *
 * The arc closes. It has been drawing, masking, sweeping and pointing for four
 * scenes; here it completes into the whole mark as the page ends. That is the
 * conceptual full stop, and it is the reason the mark was open in the first
 * place.
 */

const REASONS = [
  {
    title: "Obchodné myslenie",
    body: "Rozumieme, na čom firma zarába, skôr než navrhneme prvú obrazovku.",
  },
  {
    title: "Výrazný dizajn",
    body: "Vlastný vizuálny smer pre každú firmu. Nie šablóna prefarbená na mieru.",
  },
  {
    title: "Technická realizácia",
    body: "Rýchly, prístupný a udržateľný web. To, čo nevidno, rozhoduje o zvyšku.",
  },
]

const FACTS = [
  {
    value: 699,
    prefix: "od ",
    suffix: " €",
    label: "Webové projekty",
    note: "Konečná cena závisí od rozsahu. Povieme ju po konzultácii, nie až v zmluve.",
  },
  {
    value: commercial.firstProposalHours,
    prefix: "do ",
    suffix: " h",
    label: "Prvý návrh",
    note: "Konkrétny vizuálny smer, nie prezentácia o tom, ako pracujeme.",
  },
  {
    value: commercial.responseHours,
    prefix: "do ",
    suffix: " h",
    label: "Odpoveď na dopyt",
    note: "Konzultácia je bezplatná a nezáväzná. Nevoláme opakovane.",
  },
]

export function SceneClose() {
  const sceneRef = useScene<HTMLElement>(({ gsap, q, root }) => {
    /* The mark completes as the closing statement arrives. Scrubbed rather
       than played, so the visitor is the one closing it. */
    gsap.fromTo(
      q("[data-close-arc] path"),
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: q("[data-close-stage]")[0] ?? root,
          start: "top bottom-=15%",
          end: "center center",
          scrub: 0.6,
        },
      }
    )

    gsap.from(q("[data-close-line]"), {
      yPercent: 110,
      duration: 1,
      stagger: 0.1,
      ease: EASE.quint,
      scrollTrigger: {
        trigger: q("[data-close-stage]")[0] ?? root,
        start: "top center",
      },
    })
  })

  return (
    <section
      ref={sceneRef}
      id="kontakt"
      aria-labelledby="close-heading"
      data-tone-zone
      className="grain relative overflow-hidden"
    >
      <div className="container-page flex flex-col gap-[clamp(4rem,8vw,7rem)] pt-[clamp(5rem,9vw,8rem)] pb-16">
        {/* ---- Reason to believe ---- */}
        <div>
          <p className="label text-brand">05 — Prečo Codera</p>

          {/* The one scrubbed statement on the page. Reserved for this line
              because it is the only one that earns being read a word at a
              time. */}
          <div className="mt-6 max-w-[38rem]">
            <ScrollReveal
              containerClassName="text-h2 text-balance"
              baseOpacity={0.14}
              blurStrength={4}
            >
              Nie šablóna. Nie generický web. Nie dizajn bez výsledku.
            </ScrollReveal>
          </div>

          <ul className="mt-12 grid gap-x-10 gap-y-8 border-t border-hairline pt-8 sm:grid-cols-3">
            {REASONS.map((reason) => (
              <li key={reason.title}>
                <p className="text-h4">{reason.title}</p>
                <p className="mt-2.5 text-small text-pretty text-muted-foreground">
                  {reason.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- The commercial facts ---- *
            Stated once, plainly, at the point the visitor is deciding. */}
        <dl className="grid gap-x-10 gap-y-8 border-t border-hairline pt-8 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="label text-faint">{fact.label}</dt>
              <dd>
                <p className="tnum mt-3 text-h2">
                  <span className="text-muted-foreground">{fact.prefix}</span>
                  <CountUp to={fact.value} duration={1.1} separator=" " />
                  {fact.suffix}
                </p>
                <p className="mt-3 max-w-[22rem] text-small text-pretty text-muted-foreground">
                  {fact.note}
                </p>
              </dd>
            </div>
          ))}
        </dl>

        {/* ---- The close ---- */}
        <div
          data-close-stage
          className="relative grid items-center gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-x-16"
        >
          {/* The mark, completed. */}
          <div
            data-close-arc
            aria-hidden="true"
            className="pointer-events-none absolute -top-[12%] -left-[14%] -z-10 hidden aspect-square w-[min(46vw,30rem)] opacity-[0.16] lg:block"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-full w-full overflow-visible"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d={ARC_PATH}
                pathLength="1"
                stroke="var(--metal-high)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeDasharray="1"
                strokeDashoffset="0"
              />
            </svg>
          </div>

          <div className="relative">
            <h2 id="close-heading" className="text-h1 text-balance">
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-close-line className="block">
                  Váš ďalší web nemusí
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-close-line className="block">
                  vyzerať ako všetky ostatné.
                </span>
              </span>
            </h2>

            <p className="mt-7 max-w-[30rem] text-lead text-pretty text-muted-foreground">
              Vytvorme taký, ktorý si ľudia zapamätajú. Napíšte pár viet o firme
              a o tom, čo potrebujete riešiť.
            </p>

            <div className="mt-9">
              <Magnetic>
                <ButtonLink href={primaryCta.href} variant="brand" size="xl">
                  {primaryCta.label}
                </ButtonLink>
              </Magnetic>
            </div>

            <div className="mt-10 flex flex-col gap-2 border-t border-hairline pt-6 text-small">
              <a
                href={`mailto:${siteConfig.email}`}
                className="w-fit font-medium underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-brand"
              >
                {siteConfig.email}
              </a>
              <a
                href={telHref}
                className="w-fit font-medium underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-brand"
              >
                {siteConfig.phone}
              </a>
            </div>
          </div>

          <div
            id="dopyt"
            className="rounded-[1rem] border border-hairline bg-surface p-6 shadow-[var(--shadow-lift)] sm:p-9"
          >
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  )
}
