"use client"

import { useId, useState } from "react"

import { BrowserFrame } from "@/components/site/device-frames"
import { KonstruktPreview } from "@/components/site/previews/konstrukt"
import { LegacyPreview } from "@/components/site/previews/legacy"
import { Container, Section, SectionHeader } from "@/components/site/primitives"
import { Reveal } from "@/components/site/reveal"

/**
 * Before / after comparison.
 *
 * The control is a real `<input type="range">` stretched over the whole
 * comparison area. That gives pointer dragging, click-to-jump, arrow-key
 * stepping, Home/End and a correct screen-reader announcement for free —
 * a div with pointer handlers would have to reimplement all of it, worse.
 * The input itself is transparent; the visible handle is drawn underneath
 * and follows the same value.
 */
export function Transformation() {
  const [position, setPosition] = useState(50)
  const inputId = useId()

  return (
    <Section id="premena" aria-labelledby="transformation-heading">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Premena"
            headingId="transformation-heading"
            title="Rovnaká firma. Úplne iný dojem."
            lead="Vľavo web, aký má dnes množstvo slovenských firiem. Vpravo tá istá spoločnosť a ten istý obsah v našom spracovaní. Potiahnite deliacu čiaru."
            afterLead={
              <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
                <div className="bg-background p-6">
                  <p className="text-caption font-medium tracking-[0.06em] text-muted-foreground uppercase">
                    Predtým
                  </p>
                  <ul className="mt-3 flex flex-col gap-2 text-small text-muted-foreground">
                    <li>Návštevník nevie, čo je dôležité.</li>
                    <li>Web pôsobí staršie než firma reálne je.</li>
                    <li>Kľúčové informácie treba hľadať.</li>
                    <li>Nie je jasné, čo má človek urobiť ďalej.</li>
                  </ul>
                </div>
                <div className="bg-background p-6">
                  <p className="text-caption font-medium tracking-[0.06em] text-brand uppercase">
                    Po redizajne
                  </p>
                  <ul className="mt-3 flex flex-col gap-2 text-small">
                    <li>Hodnotu pochopí do pár sekúnd.</li>
                    <li>Firma pôsobí na úrovni, akú si pýta.</li>
                    <li>Služby majú zrozumiteľnú štruktúru.</li>
                    <li>Cesta k dopytu je viditeľná na každej stránke.</li>
                  </ul>
                </div>
              </div>
            }
          />
        </Reveal>

        <Reveal delay={80} className="mt-12">
          <BrowserFrame url="konstrukt-koncept.sk" ratio="16 / 10">
            <div className="group/compare absolute inset-0">
              <div aria-hidden="true" className="absolute inset-0">
                <KonstruktPreview />
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  clipPath: `inset(0 ${100 - position}% 0 0)`,
                }}
              >
                <LegacyPreview />
              </div>

              {/* Divider + handle. Purely visual: the input below owns the
                  interaction and the focus ring. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_0_1px_oklch(0.19_0.02_262_/_0.28)]"
                style={{ left: `${position}%` }}
              >
                <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111419] shadow-[var(--shadow-lift)] transition-transform duration-200 ease-[var(--ease-out-quint)] group-has-[:focus-visible]/compare:scale-110 group-has-[:focus-visible]/compare:ring-2 group-has-[:focus-visible]/compare:ring-brand group-has-[:focus-visible]/compare:ring-offset-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 8 6 12l4 4M14 8l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.7"
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
                  id={inputId}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={position}
                  onChange={(event) =>
                    setPosition(Number(event.currentTarget.value))
                  }
                  aria-valuetext={`Zobrazené ${position} % pôvodného webu`}
                  className="h-full w-full cursor-col-resize appearance-none bg-transparent focus:outline-none [&::-moz-range-thumb]:h-10 [&::-moz-range-thumb]:w-10 [&::-moz-range-thumb]:cursor-col-resize [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:cursor-col-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent"
                />
              </div>

            </div>
          </BrowserFrame>

          {/* Labels live under the frame, not on it: laid over the preview
              they collided with the concept site's own navigation. */}
          <div className="mt-3 flex items-baseline justify-between gap-4 text-caption text-muted-foreground">
            <span>◀ Predtým — typický firemný web spred rokov</span>
            <span className="text-right">Codera — súčasný koncept ▶</span>
          </div>
        </Reveal>

      </Container>
    </Section>
  )
}
