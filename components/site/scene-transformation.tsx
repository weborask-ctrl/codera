"use client"

import { useEffect, useId, useRef } from "react"

import { Arc } from "@/components/site/arc"
import { KonstruktPreview } from "@/components/site/previews/konstrukt"
import { LegacyPreview } from "@/components/site/previews/legacy"
import { useScene } from "@/hooks/use-scene"
import { EASE } from "@/lib/motion"

/**
 * SCENE 02A — PREMENA
 *
 * The commercial problem, demonstrated instead of described. The same
 * fictional construction company is on screen twice: the site it would have
 * had a decade ago, and the site Codera would build it. Scrolling performs the
 * transformation; the visitor can also take the handle and do it themselves.
 *
 * **One value, two ways to drive it.** The split lives in a CSS custom
 * property (`--split`, 0–100, the percentage of the *old* site still showing)
 * rather than in React state. Scroll writes it directly to the element; the
 * range input writes the same property. Whichever moved last wins, and neither
 * path costs a React render — a scrubbed value in `useState` would schedule
 * sixty renders a second for a number React has no use for.
 *
 * **The control is a real `<input type="range">`.** Stretched invisibly over
 * the stage, it gives pointer dragging, click-to-jump, arrow stepping,
 * Home/End and a correct screen-reader announcement for free. A div with
 * pointer handlers would have to reimplement all of that, worse. The visible
 * divider is drawn underneath and follows the same property.
 *
 * **The handle is the mark.** The arc that framed the work in Scene 01 is what
 * sweeps across here and changes the site underneath it — the continuity is
 * literal, not thematic.
 */
export function SceneTransformation() {
  const stageRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const sceneRef = useScene<HTMLElement>(({ gsap, q, root }) => {
    const stage = stageRef.current
    const input = inputRef.current
    if (!stage || !input) {
      return
    }

    /* Writing both the property and the input's value keeps the visual state
       and the accessible state from ever disagreeing — the announcement a
       screen reader makes is the same number the clip is using. */
    const applySplit = (value: number) => {
      const clamped = Math.round(Math.min(100, Math.max(0, value)))
      stage.style.setProperty("--split", String(clamped))
      input.value = String(clamped)
      input.setAttribute(
        "aria-valuetext",
        `Zobrazené ${clamped} % pôvodného webu`
      )
    }

    /* The handoff from Scene 01. As the hero leaves, this scene's frame opens
       from a slit at its own centre — the same gesture the arc has been
       making, so the two scenes read as one environment changing state rather
       than as one section ending and another starting. It is a separate
       trigger from the pin below because it has to run while the section is
       still travelling up the viewport, before the pin takes hold. */
    gsap.fromTo(
      q("[data-stage-frame]"),
      { clipPath: "inset(0% 46% 0% 46% round 0.75rem)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 0.75rem)",
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top bottom-=10%",
          end: "top top",
          scrub: 0.4,
        },
      }
    )

    gsap
      .timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=150%",
          pin: true,
          /* A touch of smoothing so a trackpad flick reads as a sweep rather
             than a jump cut, without the value ever leading the scroll. */
          scrub: 0.5,
          anticipatePin: 1,
        },
      })
      /* The statement resolves first, so the visitor knows what they are
         looking at before it starts changing. */
      .from(q("[data-scene-line]"), {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.12,
        ease: EASE.quint,
      })
      .fromTo(
        { value: 100 },
        { value: 100 },
        {
          value: 0,
          duration: 2.4,
          ease: "none",
          onUpdate() {
            applySplit((this.targets()[0] as { value: number }).value)
          },
        },
        ">-0.2"
      )
  })

  /* Manual control. Attached here rather than as a React `onChange` so the
     handler writes straight to the DOM on the same path the scrubbed timeline
     uses — one code path, one source of truth, no re-render either way. */
  useEffect(() => {
    const stage = stageRef.current
    const input = inputRef.current
    if (!stage || !input) {
      return
    }

    const onInput = () => {
      const value = Number(input.value)
      stage.style.setProperty("--split", String(value))
      input.setAttribute(
        "aria-valuetext",
        `Zobrazené ${value} % pôvodného webu`
      )
    }

    input.addEventListener("input", onInput)
    return () => input.removeEventListener("input", onInput)
  }, [])

  return (
    <section
      ref={sceneRef}
      id="premena"
      aria-labelledby="transformation-heading"
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* The statement sits *beside* the stage rather than above it. Stacked,
          the two together are taller than the viewport they are pinned in,
          and the stage ends up either cropped or shrunk to a thumbnail. Side
          by side, the stage gets two thirds of a very wide screen and the
          type gets a proper measure. */}
      <div className="container-page grid flex-1 content-center items-center gap-y-8 pt-[6.5rem] pb-10 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-x-14">
        <div>
          <p className="label text-brand">02 — Premena</p>
          <h2
            id="transformation-heading"
            className="mt-5 text-h2 text-balance"
          >
            <span className="block overflow-hidden pb-[0.05em]">
              <span data-scene-line className="block">
                Rovnaká firma.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.05em]">
              <span data-scene-line className="block text-muted-foreground">
                Úplne iný dojem.
              </span>
            </span>
          </h2>

          <p className="mt-7 max-w-[24rem] text-lead text-pretty text-muted-foreground">
            Web nie je dekorácia. Je to prvý obchodný kontakt vašej firmy —
            a väčšinou jediný, ktorý prebehne bez vás.
          </p>
        </div>

        {/* ---- The stage ---- */}
        <div
          ref={stageRef}
          data-stage
          className="group/stage relative w-full [--split:50]"
        >
          <div
            data-stage-frame
            className="relative aspect-4/3 w-full overflow-hidden rounded-[0.75rem] border border-hairline bg-background shadow-[var(--shadow-frame)] sm:aspect-16/10"
          >
            {/* The result, underneath. */}
            <div aria-hidden="true" className="@container absolute inset-0">
              <KonstruktPreview />
            </div>

            {/* The old site, on top, clipped back as the split falls. */}
            <div
              aria-hidden="true"
              className="@container absolute inset-0"
              style={{ clipPath: "inset(0 calc((100 - var(--split)) * 1%) 0 0)" }}
            >
              <LegacyPreview />
            </div>

            {/* Divider and handle. Purely visual — the input below owns the
                interaction and the focus ring. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[var(--metal-high)]/80"
              style={{ left: "calc(var(--split) * 1%)" }}
            >
              {/* The handle is the mark, and it is machined rather than
                  drawn: a light disc against both grounds, so it stays legible
                  whether it is sitting on the pale 2011 page or on the
                  near-black concept. */}
              <span className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--metal-high)] text-[oklch(0.16_0.004_250)] shadow-[var(--shadow-lift)] transition-transform duration-300 ease-[var(--ease-out-quint)] group-has-[:focus-visible]/stage:scale-110">
                <Arc className="h-6" weight={2.8} />
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
                className="h-full w-full cursor-col-resize appearance-none bg-transparent focus:outline-none [&::-moz-range-thumb]:h-14 [&::-moz-range-thumb]:w-14 [&::-moz-range-thumb]:cursor-col-resize [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-thumb]:h-14 [&::-webkit-slider-thumb]:w-14 [&::-webkit-slider-thumb]:cursor-col-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
              />
            </div>
          </div>

          {/* Labels sit under the frame, never on it: laid over the preview
              they collide with the concept site's own navigation. */}
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <span className="label text-faint">Typický firemný web</span>
            <span className="label hidden text-faint sm:inline">Potiahnite</span>
            <span className="label text-brand">Codera</span>
          </div>
        </div>
      </div>
    </section>
  )
}
