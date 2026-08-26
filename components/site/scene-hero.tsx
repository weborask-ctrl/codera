"use client"

import { ArcTick } from "@/components/site/arc"
import { ButtonLink } from "@/components/site/button-link"
import { HeroArc } from "@/components/site/hero-arc"
import { Magnetic } from "@/components/site/magnetic"
import { VitalisMobilePreview } from "@/components/site/previews/vitalis"
import { useScene } from "@/hooks/use-scene"
import { EASE } from "@/lib/motion"
import { primaryCta, secondaryCta } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * SCENE 01 — IDENTITA
 *
 * The composition states the idea before a word is read: the arc opens, and
 * the thing framed inside its opening is a real, live interface. That is the
 * argument the whole site is making — "we make this" — made structurally
 * rather than claimed in a sentence.
 *
 * Deliberately not a centred headline over empty space. The viewport is used
 * as one composition: the statement takes the full measure at architectural
 * scale, the offer sits under its left half, and the mark and the concept it
 * frames hold the right. A hairline rail closes the bottom so the viewport
 * ends on a line rather than on empty ground.
 *
 * The headline is inherited from the previous site on purpose. "Vaša firma je
 * lepšia, než ukazuje váš web." names the buyer's actual situation in nine
 * words and flatters them while doing it — that is a stronger opening than
 * anything about digital experiences, and replacing it for novelty would have
 * cost real conversions.
 */

/**
 * Two groups, not four fixed lines.
 *
 * Each group is clipped and slides up as one unit, so it does not matter how
 * many visual lines it wraps to — two on a wide screen, four on a phone. A
 * hero that hard-codes its line breaks per breakpoint is a hero that breaks on
 * the breakpoint nobody tested.
 */
const HEADLINE = ["Vaša firma je lepšia,", "než ukazuje váš web."]

/**
 * The base rail states two differentiators — not the three service words.
 *
 * "Stratégia / Dizajn / Vývoj" is Scene 03's entire payload; spending it here
 * as decoration would mean the offer scene arrives having already been read.
 * These two are things a competitor's site cannot honestly say, and neither is
 * a promise that cannot be kept.
 */
const RAIL = ["Prvý návrh do 72 hodín", "Dizajn aj vývoj pod jednou strechou"]

export function SceneHero() {
  const sceneRef = useScene<HTMLElement>(({ gsap, q, root }) => {
    const timeline = gsap.timeline({
      defaults: { ease: EASE.expo },
      /* One frame's grace so the variable font has swapped in before the
         lines are measured for the wipe. Without it the first line can be
         clipped against Archivo's fallback metrics. */
      delay: 0.08,
    })

    timeline
      .from(q("[data-hero-eyebrow]"), { opacity: 0, y: 14, duration: 0.7 })
      .from(
        q("[data-hero-line]"),
        { yPercent: 108, duration: 1.15, stagger: 0.075 },
        "-=0.5"
      )
      .from(
        q("[data-hero-lead]"),
        { opacity: 0, y: 18, duration: 0.9 },
        "-=0.65"
      )
      .from(
        q("[data-hero-action]"),
        { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 },
        "-=0.7"
      )
      /* The framed work uncovers rather than fades: an inset clip reads as a
         panel being opened, which is the same gesture the arc is making. */
      .from(
        q("[data-hero-frame]"),
        {
          clipPath: "inset(0% 0% 100% 0%)",
          scale: 1.06,
          duration: 1.3,
        },
        "-=1.05"
      )
      .from(
        q("[data-hero-strip] > *"),
        { opacity: 0, y: 12, duration: 0.7, stagger: 0.06 },
        "-=0.8"
      )

    /* Scene 01 does not slide away — it recedes, and hands the arc over to
       Scene 02. Type lifts and blurs, the mark drifts and grows, the work
       panel keeps a little more of its position than the type does, so the
       layers separate in depth on the way out. Scrubbed, so it tracks the
       real scroll position exactly. */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      })
      .to(
        q("[data-hero-type]"),
        { y: -110, opacity: 0, filter: "blur(9px)", ease: "none" },
        0
      )
      .to(q("[data-hero-frame]"), { y: -46, ease: "none" }, 0)
      /* The mark grows and dissolves rather than scrolling away, so the next
         scene's frame opening reads as the same shape continuing. */
      .to(
        q("[data-hero-mark]"),
        { y: 70, scale: 1.35, opacity: 0, ease: "none" },
        0
      )
      .to(q("[data-hero-strip]"), { opacity: 0, ease: "none" }, 0)
  })

  return (
    <section
      ref={sceneRef}
      id="top"
      aria-labelledby="hero-heading"
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden pt-[6.5rem] pb-0"
    >
      {/* A single low wash so the composition has a floor and the mark has
          something to sit in. One gradient, no aurora, no particles. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_78%_18%,var(--surface)_0%,transparent_58%)]"
      />

      <div className="container-page relative z-10 flex flex-1 flex-col justify-center gap-[clamp(2rem,4vh,3.5rem)]">
        {/* ---- Statement ---- *
            Full measure, not a column beside an image. The type is the loudest
            object in the composition and everything else is arranged under and
            behind it. */}
        <div data-hero-type>
          <p
            data-hero-eyebrow
            className="label flex items-center gap-3 text-muted-foreground"
          >
            <ArcTick className="h-2.5 text-brand" />
            Digitálne štúdio — Slovensko
          </p>

          <h1 id="hero-heading" className="mt-6 text-mega text-foreground">
            {HEADLINE.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.05em]">
                <span data-hero-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* ---- Offer, and the work it refers to ---- *
            The lead sits at the foot of the statement while the mark and the
            framed concept occupy the right. On a phone the frame moves under
            the copy, at a size where the interface inside is legible rather
            than decorative. */}
        <div className="grid items-center gap-y-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-14">
          <div data-hero-type className="max-w-[30rem]">
            <p data-hero-lead className="text-lead text-pretty text-muted-foreground">
              Navrhujeme a vyvíjame weby, ktoré menia to, ako zákazníci vnímajú
              vašu firmu.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span data-hero-action>
                <Magnetic>
                  <ButtonLink href={primaryCta.href} variant="brand" size="xl">
                    {primaryCta.label}
                  </ButtonLink>
                </Magnetic>
              </span>
              <span data-hero-action>
                <ButtonLink href={secondaryCta.href} variant="quiet" size="xl">
                  {secondaryCta.label}
                </ButtonLink>
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-[min(46vw,10rem)] lg:mx-0 lg:mr-[6vw] lg:w-[min(13vw,9rem)]">
            {/* The mark, centred on the frame and roughly two and a half times
                its width, so the concept sits *inside* the opening of the C.
                That is the site's argument stated as a composition: the thing
                held in the mark is real, working interface. */}
            <div
              data-hero-mark
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[235%] -translate-x-1/2 -translate-y-1/2"
            >
              <HeroArc className="h-full w-full" />
            </div>

            <div
              data-hero-frame
              className="relative z-10"
              style={{ clipPath: "inset(0% 0% 0% 0%)" }}
            >
              <div className="float-slow">
                <div className="rounded-[1.9rem] border border-hairline bg-card p-[0.35rem] shadow-[var(--shadow-frame)]">
                  <div
                    role="img"
                    aria-label="Ukážka konceptu webu pre súkromnú kliniku Vitalis v mobilnom zobrazení."
                    className="@container relative isolate aspect-[9/19] overflow-hidden rounded-[1.6rem] bg-background"
                  >
                    <div aria-hidden="true" className="absolute inset-0">
                      <VitalisMobilePreview />
                    </div>
                  </div>
                </div>
              </div>

              <p className="label mt-4 text-center text-faint">
                Koncept — Vitalis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Base rail ---- *
          A single hairline row instead of a second block of content: it names
          what the studio sells in three words, and it gives the composition a
          floor so the viewport does not end in empty ground. */}
      <div
        data-hero-strip
        className="container-page relative z-10 flex items-center justify-between gap-6 border-t border-hairline py-5"
      >
        <ul className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-8">
          {RAIL.map((item, index) => (
            <li
              key={item}
              className={cn(
                "label items-center gap-2.5 text-muted-foreground",
                /* The second differentiator wraps to its own line on a phone
                   and pushes the rail off the fold. One is enough there. */
                index === 0 ? "flex" : "hidden sm:flex"
              )}
            >
              <ArcTick className="h-2 shrink-0 text-brand" startAngle={-20} sweep={40} />
              {item}
            </li>
          ))}
        </ul>

        <p className="label hidden items-center gap-2.5 text-faint sm:flex">
          Scrollujte
          <svg
            viewBox="0 0 12 20"
            className="h-4 w-auto"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 2v16m0 0 4-4m-4 4-4-4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
      </div>
    </section>
  )
}
