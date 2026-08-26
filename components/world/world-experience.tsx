"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"

import { ButtonLink } from "@/components/site/button-link"
import { Magnetic } from "@/components/site/magnetic"
import { SceneHero } from "@/components/site/scene-hero"
import { SceneOffer } from "@/components/site/scene-offer"
import { SceneTransformation } from "@/components/site/scene-transformation"
import { SceneWork } from "@/components/site/scene-work"
import { CAMERA_STATES, film, useCapabilityTier } from "@/components/world/film"
import { usePointerField } from "@/hooks/use-scene"
import { EASE, gsap, ScrollTrigger } from "@/lib/motion"
import { primaryCta, secondaryCta } from "@/lib/site-config"

/**
 * SCENES 01–02 — the spatial world (desktop), or the designed DOM experience.
 *
 * The tier decides what mounts. `dom` — reduced motion, no WebGL, or any
 * viewport under 1024px — gets the v1 hero and transformation: complete,
 * tested, accessible, and what the server renders (so it is also the LCP and
 * the SEO content). `world` swaps in the persistent canvas.
 *
 * Inside the world, two timelines write the same film object:
 *
 *  - **The intro** autoplays once (~1.9 s): surface → the revealed C, with
 *    the headline landing as the camera settles. Commercial clarity is
 *    priority one — the offer is readable in seconds, not after 29% of a
 *    pin. A scroll during the intro fast-forwards it instead of fighting it.
 *  - **The master timeline** is scrubbed: B → portal → transformation. It is
 *    created only when the intro completes, so the two never contest a value.
 */

const RibbonWorld = dynamic(() => import("@/components/world/ribbon-world"), {
  ssr: false,
})

const HEADLINE = ["Vaša firma je lepšia,", "než ukazuje váš web."]

/** One line per project, about the commercial decision — never the palette. */
const WORK = [
  {
    id: "konstrukt",
    index: "01",
    name: "Konštrukt",
    sector: "Stavebníctvo",
    proof: "Prebiehajúca stavba hneď v úvode — investor vidí referenciu skôr než cenník.",
    disciplines: "Brand direction · UX · Vývoj",
  },
  {
    id: "vitalis",
    index: "02",
    name: "Vitalis",
    sector: "Súkromná klinika",
    proof: "Voľné termíny hneď v úvode — hlavná obava pacienta zmizne skôr, než stihne odísť.",
    disciplines: "Dizajn · UX · Vývoj",
  },
  {
    id: "forma",
    index: "03",
    name: "Forma",
    sector: "Interiérové štúdio",
    proof: "Sadzba časopisu namiesto katalógu — štúdio sa číta ako autor, nie dodávateľ.",
    disciplines: "Art direction · Dizajn · Vývoj",
  },
]

/** The offer, as the brand's own anatomy: three strands, three words. */
const OFFER = [
  { word: "Stratégia", line: "Najprv pochopíme firmu, zákazníka a to, čo má web dosiahnuť." },
  { word: "Dizajn", line: "Vizuálny systém, ktorý firmu odlíši a dodá jej dôveryhodnosť." },
  { word: "Vývoj", line: "Rýchla, responzívna realizácia pripravená na produkciu." },
]

function WorldStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const pointerRef = usePointerField<HTMLDivElement>(1)

  /* Pointer field feeds the film — the camera sways, the DOM stays still. */
  useEffect(() => {
    const element = pointerRef.current
    if (!element) {
      return
    }
    let frame = 0
    const read = () => {
      film.swayX = Number.parseFloat(element.style.getPropertyValue("--px") || "0")
      film.swayY = Number.parseFloat(element.style.getPropertyValue("--py") || "0")
      frame = requestAnimationFrame(read)
    }
    frame = requestAnimationFrame(read)
    return () => cancelAnimationFrame(frame)
  }, [pointerRef])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) {
      return
    }

    const context = gsap.context(() => {
      const { A, B, C, D, E1, E2, E3, F, G } = CAMERA_STATES

      const setState = (name: string) => () => {
        stage.dataset.worldState = name
      }

      /* Marks the active service row for CSS. */
      const activeService = (index: number) => () => {
        stage.dataset.service = String(index)
      }

      /* The stage is a tone zone: flipping its chapter re-points every token
         underneath it AND inverts the fixed navigation — the same mechanism
         the v1 paper sections use, so it is one system, not two. */
      const toneZone = (chapter: "paper" | null) => () => {
        if (chapter) {
          stage.dataset.chapter = chapter
        } else {
          delete stage.dataset.chapter
        }
      }

      /* ---- The intro: A → B, autoplayed ---- */
      const intro = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onStart: setState("a"),
      })

      intro
        .fromTo(film.cam, { ...A.cam }, { ...B.cam, duration: 1.9 }, 0)
        .fromTo(film.target, { ...A.target }, { ...B.target, duration: 1.9 }, 0)
        .fromTo(film, { key: A.key, idle: 1 }, { key: B.key, idle: 0.3, duration: 1.9 }, 0)
        .fromTo(
          "[data-hero-line]",
          { yPercent: 110 },
          { yPercent: 0, duration: 1.05, ease: EASE.quint, stagger: 0.1 },
          0.9
        )
        .fromTo(
          "[data-hero-tail]",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, ease: EASE.expo, stagger: 0.08 },
          1.5
        )
        .call(setState("b"))

      /* A scroll during the intro accelerates it rather than fighting it. */
      const hurry = () => {
        if (intro.isActive()) {
          intro.timeScale(3.5)
        }
      }
      window.addEventListener("wheel", hurry, { passive: true, once: true })
      window.addEventListener("touchmove", hurry, { passive: true, once: true })

      /* ---- The master timeline: B → C → D, scrubbed ---- */
      intro.eventCallback("onComplete", () => {
        /* Before the pin exists: anything waiting on the pin-spacer as the
           handover signal must already see the settled hero state. */
        setState("b")()

        const master = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=860%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        })

        master
          /* Hold on the hero long enough to read it. */
          .to({}, { duration: 1 })
          /* B → C: toward the opening; the hero hands off. */
          .to(film.cam, { ...C.cam, duration: 2.6 }, 1)
          .to(film.target, { ...C.target, duration: 2.6 }, 1)
          .to(film, { key: C.key, idle: 0, duration: 2.6 }, 1)
          .to(
            "[data-hero-block]",
            { opacity: 0, y: -70, filter: "blur(8px)", duration: 1.3 },
            1.15
          )
          .call(setState("c"), undefined, 2.4)
          /* The dated site materialises beyond the opening as we approach. */
          .to(film, { planeReveal: 1, duration: 1.4 }, 1.9)
          /* C → D: through the opening, settling on the dated site. */
          .to(film.cam, { ...D.cam, duration: 2 }, 3.6)
          .to(film.target, { ...D.target, duration: 2 }, 3.6)
          .to(film, { key: D.key, duration: 2 }, 3.6)
          .fromTo(
            "[data-premena-block]",
            { opacity: 0, y: 44 },
            { opacity: 1, y: 0, duration: 1.2, ease: EASE.quint },
            4.4
          )
          .call(setState("d"), undefined, 5.4)
          /* The transformation itself — the reason the journey exists. */
          .to(film, { morph: 1, duration: 2.6 }, 5.8)
          .to(
            "[data-premena-caption-a]",
            { opacity: 0.25, duration: 0.8 },
            5.8
          )
          .to(
            "[data-premena-caption-b]",
            { opacity: 1, duration: 0.8 },
            7.4
          )
          /* A beat on the finished concept. */
          .to({}, { duration: 0.8 })

          /* ---- E1: the transformed surface becomes project 01 ---- *
             The premena framing hands off to the work presentation on the
             SAME plane — no cut, the continuity the storyboard demands. */
          .to("[data-premena-block]", { opacity: 0, y: -30, duration: 0.8 }, 9.2)
          .to(film.cam, { ...E1.cam, duration: 1.4 }, 9.2)
          .to(film.target, { ...E1.target, duration: 1.4 }, 9.2)
          .fromTo(
            '[data-work="konstrukt"]',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1, ease: EASE.quint },
            9.8
          )
          .call(setState("e1"), undefined, 10.2)

          /* ---- E1 → E2: lateral track; the world turns to paper ---- */
          .to("[data-work='konstrukt']", { opacity: 0, y: -30, duration: 0.8 }, 11.4)
          .to(film.cam, { ...E2.cam, duration: 2.4 }, 11.6)
          .to(film.target, { ...E2.target, duration: 2.4 }, 11.6)
          .to(film, { envTone: 1, planeVitalis: 1, planeReveal: 0, key: E2.key, duration: 2.2 }, 11.8)
          .call(toneZone("paper"), undefined, 12.7)
          .fromTo(
            '[data-work="vitalis"]',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1, ease: EASE.quint },
            13.2
          )
          .call(setState("e2"), undefined, 13.4)

          /* ---- E2 → E3: further along the arc; warm paper ---- */
          .to("[data-work='vitalis']", { opacity: 0, y: -30, duration: 0.8 }, 14.6)
          .to(film.cam, { ...E3.cam, duration: 2.4 }, 14.8)
          .to(film.target, { ...E3.target, duration: 2.4 }, 14.8)
          .to(film, { envTone: 2, planeForma: 1, planeVitalis: 0, duration: 2.2 }, 15.0)
          .fromTo(
            '[data-work="forma"]',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1, ease: EASE.quint },
            16.4
          )
          .call(setState("e3"), undefined, 16.6)

          /* A beat on the last project. */
          .to({}, { duration: 0.8 })

          /* ---- F: back to the ribbon; the offer ---- *
             The world returns to graphite and the mark splits into its three
             strands — the offer presented as the brand's own anatomy. */
          .to("[data-work='forma']", { opacity: 0, y: -30, duration: 0.8 }, 17.8)
          .to(film.cam, { ...F.cam, duration: 2.2 }, 18.0)
          .to(film.target, { ...F.target, duration: 2.2 }, 18.0)
          .to(film, { envTone: 0, planeForma: 0, key: F.key, duration: 2.0 }, 18.1)
          .call(toneZone(null), undefined, 19.0)
          .to(film, { strand: 1, duration: 1.6, ease: "power2.inOut" }, 19.6)
          .fromTo(
            "[data-offer-block]",
            { opacity: 0, y: 44 },
            { opacity: 1, y: 0, duration: 1, ease: EASE.quint },
            20.2
          )
          .call(setState("f"), undefined, 20.4)

          /* The three strands take the light in turn. */
          .to(film, { glow0: 1, duration: 0.5 }, 20.6)
          .call(activeService(0), undefined, 20.6)
          .to(film, { glow0: 0, glow1: 1, duration: 0.5 }, 22.0)
          .call(activeService(1), undefined, 22.0)
          .to(film, { glow1: 0, glow2: 1, duration: 0.5 }, 23.4)
          .call(activeService(2), undefined, 23.4)
          .fromTo(
            "[data-offer-price]",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: EASE.expo },
            23.8
          )

          /* ---- G: resolution — the strands close back into the C ---- */
          .to("[data-offer-block]", { opacity: 0, y: -30, duration: 0.8 }, 25.0)
          .to(film.cam, { ...G.cam, duration: 2.2 }, 25.2)
          .to(film.target, { ...G.target, duration: 2.2 }, 25.2)
          .to(film, { glow2: 0, key: G.key, duration: 1 }, 25.2)
          .to(film, { strand: 0, duration: 1.4, ease: "power2.inOut" }, 26.0)
          .call(setState("g"), undefined, 27.0)
          .fromTo(
            "[data-resolution]",
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.9, ease: EASE.quint },
            27.2
          )

          /* The completed mark holds; the page hands over to the epilogue. */
          .to({}, { duration: 1 })

        /* The master is created seconds after the sections below built their
           triggers, and refresh processes triggers in CREATION order — so
           without a sort, the world's ~3 viewports of pin distance are never
           added to the later sections' starts and they pin on top of the
           world. Sort into scroll order first, then re-measure. */
        ScrollTrigger.sort()
        ScrollTrigger.refresh()
      })

      return () => {
        window.removeEventListener("wheel", hurry)
        window.removeEventListener("touchmove", hurry)
      }
    }, stage)

    /* Dev instrumentation: real trigger starts, for the harness. */
    const w = window as unknown as Record<string, unknown>
    w.__triggers = () =>
      ScrollTrigger.getAll().map((t) => ({
        el: (t.trigger as HTMLElement | undefined)?.id ?? "?",
        start: Math.round(t.start),
        end: Math.round(t.end),
        pin: Boolean(t.pin),
      }))

    return () => {
      delete w.__triggers
      context.revert()
    }
  }, [])

  return (
    <div ref={pointerRef} className="relative">
      {/* Anchor for the nav's Práca link: the work chapter lives inside the
          pinned stage, so the target is a marker at its scroll offset. */}
      <div id="praca" aria-hidden="true" className="absolute top-[300svh] h-px w-px" />
      <div id="sluzby" aria-hidden="true" className="absolute top-[640svh] h-px w-px" />
      <div
        ref={stageRef}
        id="top"
        data-world-state="a"
        data-tone-zone=""
        className="relative min-h-[100svh] overflow-hidden bg-[#0d0d0f]"
      >
        <div className="absolute inset-0">
          <RibbonWorld />
        </div>

        {/* ---- DOM layer, synchronised to the film ---- */}
        <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-end">
          <div data-hero-block className="container-page pb-[clamp(3rem,8vh,6rem)]">
            <h1 id="hero-heading" className="text-mega max-w-[13ch] text-foreground">
              {HEADLINE.map((line) => (
                <span key={line} className="block overflow-hidden pb-[0.05em]">
                  <span data-hero-line className="block">
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-hero-lead
              data-hero-tail
              className="mt-6 max-w-[30rem] text-lead text-pretty text-muted-foreground"
            >
              Navrhujeme a vyvíjame weby, ktoré menia to, ako zákazníci vnímajú
              vašu firmu.
            </p>

            <div data-hero-tail className="pointer-events-auto mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <ButtonLink href={primaryCta.href} variant="brand" size="xl">
                  {primaryCta.label}
                </ButtonLink>
              </Magnetic>
              <ButtonLink href={secondaryCta.href} variant="quiet" size="xl">
                {secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          {/* Work metadata: one block per project, cross-faded by the film.
              Little text on purpose — the surfaces carry the argument. */}
          {WORK.map((project) => (
            <div
              key={project.id}
              data-work={project.id}
              className="container-page absolute inset-0 flex flex-col justify-center opacity-0"
            >
              <div className="max-w-[24rem]">
                <p className="label text-brand">
                  {project.index} — {project.sector}
                </p>
                <p className="mt-4 text-h1 tracking-[-0.035em] text-foreground">
                  {project.name}
                </p>
                <p className="mt-5 text-small text-pretty text-muted-foreground">
                  {project.proof}
                </p>
                <p className="label mt-6 flex items-center gap-3 text-faint">
                  {project.disciplines}
                  <span className="rounded-full border border-border-strong/50 px-2.5 py-1">
                    Koncept
                  </span>
                </p>
              </div>
            </div>
          ))}

          {/* Offer: the three strands, named. The active row follows the lit
              strand via the stage's data-service attribute. */}
          <div
            data-offer-block
            className="container-page absolute inset-0 flex flex-col justify-center opacity-0"
          >
            <div className="max-w-[26rem]">
              <p className="label text-brand">04 — Ponuka</p>
              <ul className="mt-6 flex flex-col gap-6">
                {OFFER.map((service, index) => (
                  <li
                    key={service.word}
                    data-offer-row={index}
                    className="transition-opacity duration-500"
                  >
                    <p className="text-h2 tracking-[-0.032em] text-foreground">
                      {service.word}
                    </p>
                    <p
                      data-offer-line
                      className="mt-1.5 max-w-[24rem] text-small text-pretty text-muted-foreground"
                    >
                      {service.line}
                    </p>
                  </li>
                ))}
              </ul>
              <p data-offer-price className="label mt-8 text-faint opacity-0">
                Webové projekty od 699 € — presnú cenu poviete po konzultácii.
              </p>
            </div>
          </div>

          {/* Resolution: the completed mark carries the frame; the wordmark
              stays sharp DOM type, as the brand direction requires. */}
          <div
            data-resolution
            className="absolute inset-0 flex flex-col items-center justify-end pb-[clamp(1.25rem,3.5vh,2.5rem)] text-center opacity-0"
          >
            <p className="label text-faint">Digitálne štúdio</p>
            <p className="mt-3 text-[clamp(2rem,4.5vw,3.4rem)] font-semibold tracking-[0.26em] text-foreground">
              CODERA
            </p>
          </div>

          {/* Premena: enters as the camera settles on the dated site. */}
          <div
            data-premena-block
            id="premena"
            className="container-page absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-[clamp(2.5rem,6vh,4.5rem)] opacity-0"
          >
            <div>
              <p className="label text-brand">02 — Premena</p>
              <h2 className="mt-4 max-w-[16ch] text-h2 text-balance">
                Rovnaká firma. Úplne iný dojem.
              </h2>
            </div>
            <div className="label hidden flex-col items-end gap-2 text-right sm:flex">
              <span data-premena-caption-a className="text-muted-foreground">
                Typický firemný web
              </span>
              <span data-premena-caption-b className="text-brand opacity-25">
                Codera — koncept Konštrukt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorldExperience() {
  const tier = useCapabilityTier()

  /* Server + hydration render the DOM experience; a capable client swaps in
     the world on its first post-hydration render. */
  if (tier !== "world") {
    return (
      <>
        <SceneHero />
        <SceneTransformation />
        <SceneWork />
        <SceneOffer />
      </>
    )
  }

  return <WorldStage />
}
