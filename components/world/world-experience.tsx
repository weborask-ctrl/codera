"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"

import { ButtonLink } from "@/components/site/button-link"
import { Magnetic } from "@/components/site/magnetic"
import { SceneHero } from "@/components/site/scene-hero"
import { SceneTransformation } from "@/components/site/scene-transformation"
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
      const { A, B, C, D } = CAMERA_STATES

      const setState = (name: string) => () => {
        stage.dataset.worldState = name
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
            end: "+=320%",
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
          /* A beat on the finished concept before the world hands back. */
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
    <div ref={pointerRef}>
      <div
        ref={stageRef}
        id="top"
        data-world-state="a"
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
      </>
    )
  }

  return <WorldStage />
}
