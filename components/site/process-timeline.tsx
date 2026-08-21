"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"

import { Container, Section, SectionHeader } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"
import { buildTrackPath, Vertex } from "@/components/site/w-motif"
import { processSteps } from "@/lib/process-steps"
import { cn } from "@/lib/utils"

const TRACK_WIDTH = 1000
const TRACK_BASELINE = 26
const TRACK_DIP = 11
const TRACK_PATH = buildTrackPath(
  processSteps.length,
  TRACK_WIDTH,
  TRACK_BASELINE,
  TRACK_DIP
)

/**
 * The process timeline — the page's second signature moment.
 *
 * Desktop is a horizontal track whose connecting line dips into the Webora
 * vertex between each node. Scrolling fills the track and moves the active
 * step; the step's detail appears in a panel below, so the section stays
 * compact while every step is one click away.
 *
 * Interaction is a real tab set (`tablist` / `tab` / `tabpanel`) with arrow,
 * Home and End keys. Scrolling changes which tab is selected but never moves
 * focus, and once the visitor picks a step themselves the scroll sync stops
 * fighting them until they scroll again.
 *
 * Mobile drops the track for a vertical list with every step expanded — on a
 * phone, reading all six beats tapping through them, and nothing scrolls
 * sideways.
 */
function Track({
  className,
  stroke,
}: {
  className?: string
  stroke: string
}) {
  return (
    <svg
      viewBox={`0 0 ${TRACK_WIDTH} 52`}
      preserveAspectRatio="none"
      className={cn("h-[52px] w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={TRACK_PATH}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function ProcessTimeline() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const userPickedRef = useRef(false)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()

  const tabId = (index: number) => `${baseId}-tab-${index}`
  const panelId = (index: number) => `${baseId}-panel-${index}`

  useEffect(() => {
    const element = sectionRef.current
    if (!element) {
      return
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) {
      return
    }

    let frame = 0

    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      // 0 as the block reaches the middle of the viewport, 1 as it leaves it.
      const travel = rect.height + window.innerHeight * 0.4
      const scrolled = window.innerHeight * 0.7 - rect.top
      const progress = Math.min(1, Math.max(0, scrolled / travel))

      element.style.setProperty("--progress", progress.toFixed(4))

      if (!userPickedRef.current) {
        const index = Math.min(
          processSteps.length - 1,
          Math.floor(progress * processSteps.length)
        )
        setActive((current) => (current === index ? current : index))
      }
    }

    const onScroll = () => {
      userPickedRef.current = false
      if (!frame) {
        frame = window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  const pick = useCallback((index: number) => {
    userPickedRef.current = true
    setActive(index)
  }, [])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = processSteps.length - 1
      let next: number | null = null

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = index === last ? 0 : index + 1
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = index === 0 ? last : index - 1
      } else if (event.key === "Home") {
        next = 0
      } else if (event.key === "End") {
        next = last
      }

      if (next === null) {
        return
      }

      event.preventDefault()
      pick(next)
      tabRefs.current[next]?.focus()
    },
    [pick]
  )

  const step = processSteps[active]

  return (
    <Section id="proces" tone="surface" aria-labelledby="process-heading">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Proces"
            headingId="process-heading"
            title="Vždy viete, čo sa deje a čo bude ďalej."
            lead="Šesť krokov od prvého hovoru po spustenie. Pri každom vidíte, čo robíme my, čo potrebujeme od vás a čo z toho máte."
          />
        </Reveal>

        <div ref={sectionRef} className="mt-14 [--progress:0] lg:mt-20">
          {/* ---------- Desktop: track + tabs + detail panel ---------- */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* The filled portion is a second copy of the track clipped from
                  the right, not a dash offset: `pathLength` dashes misbehave
                  once `preserveAspectRatio="none"` scales the box unevenly. */}
              <div aria-hidden="true" className="relative h-[52px]">
                <Track className="absolute inset-0" stroke="var(--hairline)" />
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath:
                      "inset(0 calc((1 - var(--progress)) * 100%) 0 0)",
                  }}
                >
                  <Track className="absolute inset-0" stroke="var(--brand)" />
                </div>
              </div>

              <div
                role="tablist"
                aria-label="Kroky spolupráce"
                className="absolute inset-x-0 top-0 grid grid-cols-6"
              >
                {processSteps.map((item, index) => {
                  const selected = index === active
                  const reached = index <= active

                  return (
                    <button
                      key={item.index}
                      ref={(node) => {
                        tabRefs.current[index] = node
                      }}
                      type="button"
                      role="tab"
                      id={tabId(index)}
                      aria-selected={selected}
                      aria-controls={panelId(index)}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => pick(index)}
                      onKeyDown={(event) => onKeyDown(event, index)}
                      className="group/step flex flex-col items-center gap-3 rounded-md pt-[14px] pb-2 text-center"
                    >
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full border transition-colors duration-300",
                          reached
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-hairline bg-background text-transparent"
                        )}
                      >
                        <Vertex className="h-1.5" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="tnum text-caption text-muted-foreground">
                          {item.index}
                        </span>
                        <span
                          className={cn(
                            "text-[1.0625rem] font-semibold tracking-[-0.014em] transition-colors duration-300",
                            selected
                              ? "text-foreground"
                              : "text-muted-foreground group-hover/step:text-foreground"
                          )}
                        >
                          {item.title}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              role="tabpanel"
              id={panelId(active)}
              aria-labelledby={tabId(active)}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: the ARIA tabs pattern requires a focusable panel when it holds no focusable content, so keyboard users can reach what the tab revealed.
              tabIndex={0}
              className="mt-12 rounded-[1.25rem] border border-hairline bg-background p-10"
            >
              {/* Side-by-side only from `xl`: at 1024 the three detail columns
                  would be ~120px wide and every label would wrap. */}
              <div className="grid gap-10 xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
                <div>
                  <p className="text-h3">{step.title}</p>
                  <p className="mt-3 text-body text-pretty text-muted-foreground">
                    {step.summary}
                  </p>
                  <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-caption text-muted-foreground">
                    Trvanie: {step.duration}
                  </p>
                  {step.highlight ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-caption font-medium text-brand-strong">
                      {step.highlight}
                    </p>
                  ) : null}
                </div>

                <dl className="grid gap-px bg-hairline md:grid-cols-3">
                  <div className="bg-background py-4 md:px-6 md:py-0 md:first:pl-0">
                    <dt className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                      Čo robíme
                    </dt>
                    <dd className="mt-3 text-small text-pretty">
                      {step.webora}
                    </dd>
                  </div>
                  <div className="bg-background py-4 md:px-6 md:py-0">
                    <dt className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                      Čo potrebujeme
                    </dt>
                    <dd className="mt-3 text-small text-pretty">
                      {step.client ?? "Nič — pracujeme na svojej strane."}
                    </dd>
                  </div>
                  <div className="bg-background py-4 md:px-6 md:py-0 md:last:pr-0">
                    <dt className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                      Čo z toho máte
                    </dt>
                    <dd className="mt-3 text-small text-pretty">
                      {step.output}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* ---------- Mobile: vertical list, everything expanded ---------- */}
          <ol className="lg:hidden">
            {processSteps.map((item, index) => (
              <li key={item.index} className="relative pb-10 pl-10 last:pb-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-7 left-[11px] w-px bg-hairline",
                    index === processSteps.length - 1 ? "hidden" : "bottom-0"
                  )}
                />
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 flex size-6 items-center justify-center rounded-full border border-brand bg-brand text-brand-foreground"
                >
                  <Vertex className="h-1.5" />
                </span>

                <Reveal delay={index * 40}>
                  <p className="tnum text-caption text-muted-foreground">
                    {item.index}
                  </p>
                  <h3 className="mt-1 text-h4">{item.title}</h3>
                  <p className="mt-2 text-small text-pretty text-muted-foreground">
                    {item.summary}
                  </p>

                  <dl className="mt-4 flex flex-col gap-3 border-l-2 border-hairline pl-4">
                    <div>
                      <dt className="text-caption font-medium text-foreground">
                        Čo robíme
                      </dt>
                      <dd className="mt-1 text-small text-muted-foreground">
                        {item.webora}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-caption font-medium text-foreground">
                        Čo potrebujeme od vás
                      </dt>
                      <dd className="mt-1 text-small text-muted-foreground">
                        {item.client ?? "Nič — pracujeme na svojej strane."}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-caption font-medium text-foreground">
                        Čo z toho máte
                      </dt>
                      <dd className="mt-1 text-small text-muted-foreground">
                        {item.output}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 inline-flex rounded-full bg-muted px-3 py-1 text-caption text-muted-foreground">
                    {item.duration}
                  </p>
                  {item.highlight ? (
                    <p className="mt-2 inline-flex rounded-full bg-brand-soft px-3 py-1 text-caption font-medium text-brand-strong">
                      {item.highlight}
                    </p>
                  ) : null}
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  )
}
