"use client"

import { ArcTick } from "@/components/site/arc"
import { useScene } from "@/hooks/use-scene"
import { EASE } from "@/lib/motion"

/**
 * SCENE 03 — PONUKA
 *
 * What Codera actually sells, as one composition rather than a grid of six
 * cards. Three words hold the stage; one is lit at a time, and the other two
 * drop to outline so the active one reads as *selected* rather than merely
 * larger.
 *
 * **The width axis does the work.** Archivo is variable on `wdth`, so the
 * active word physically expands and the inactive ones compress — real
 * letterforms at every width, not a headline scaled up until its stems get
 * fat. That is the reason this typeface is in the project at all, and this is
 * the scene it was chosen for. GSAP tweens a custom property that
 * `font-variation-settings` reads, so the interpolation happens on the axis
 * itself.
 *
 * **The rule under the active word is the arc.** Same geometry as the mark,
 * cut to a shallow segment — the device that has carried every scene so far
 * arrives here as the thing that points at what is selected.
 *
 * The process is folded in at the foot of the scene as four words rather than
 * given a section of its own. A visitor deciding whether to enquire does not
 * need a diagram of the workflow; they need to know it is defined.
 */

type Service = {
  id: string
  word: string
  copy: string
}

const SERVICES: Service[] = [
  {
    id: "strategia",
    word: "Stratégia",
    copy: "Najprv pochopíme firmu, jej zákazníka a to, čo má web spraviť. Až potom kreslíme.",
  },
  {
    id: "dizajn",
    word: "Dizajn",
    copy: "Vizuálny systém, ktorý firmu odlíši od konkurencie a dá jej dôveryhodnosť, akú si zaslúži.",
  },
  {
    id: "vyvoj",
    word: "Vývoj",
    copy: "Rýchla a responzívna implementácia, postavená na reálnu prevádzku — nie na prezentáciu.",
  },
]

const PROCESS = [
  { index: "01", label: "Pochopíme" },
  { index: "02", label: "Navrhneme" },
  { index: "03", label: "Postavíme" },
  { index: "04", label: "Spustíme" },
]

/** Scroll fraction at which each word takes over. */
const SWITCH_AT = [0, 0.36, 0.7]

export function SceneOffer() {
  const sceneRef = useScene<HTMLElement>(({ gsap, q, root }) => {
    const rows = q("[data-service-row]") as HTMLElement[]

    const setActive = (activeIndex: number) => {
      rows.forEach((row, index) => {
        const active = index === activeIndex
        row.dataset.active = String(active)

        gsap.to(row.querySelector("[data-service-word]"), {
          "--wdth": active ? 116 : 86,
          duration: 0.7,
          ease: EASE.soft,
          overwrite: true,
        })
        gsap.to(row.querySelector("[data-service-copy]"), {
          opacity: active ? 1 : 0,
          y: active ? 0 : 10,
          duration: 0.5,
          ease: EASE.soft,
          overwrite: true,
        })
      })
    }

    /* The resting DOM has every word filled and every line of copy visible —
       that is the reduced-motion and scripting-off layout. The selected state
       only exists once the scene is actually running, so it is applied here
       rather than in the markup. */
    setActive(0)

    gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=190%",
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          let active = 0
          for (let index = SWITCH_AT.length - 1; index >= 0; index -= 1) {
            if (self.progress >= SWITCH_AT[index]) {
              active = index
              break
            }
          }
          if (root.dataset.active !== SERVICES[active].id) {
            root.dataset.active = SERVICES[active].id
            setActive(active)
          }
        },
      },
    })
  })

  return (
    <section
      ref={sceneRef}
      id="sluzby"
      aria-labelledby="offer-heading"
      data-tone-zone
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <div className="container-page flex flex-1 flex-col justify-center gap-10 pt-[6.5rem] pb-10">
        <div>
          <p className="label text-brand">04 — Ponuka</p>
          <h2 id="offer-heading" className="sr-only">
            Čo robíme
          </h2>
        </div>

        <ul className="flex flex-col gap-6 lg:gap-8">
          {SERVICES.map((service) => (
            <li
              key={service.id}
              data-service-row
              data-active="true"
              className="group/row grid items-baseline gap-x-10 gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]"
            >
              <div className="relative">
                <p
                  data-service-word
                  className="offer-word"
                >
                  {service.word}
                </p>
                {/* The arc, cut to a shallow segment, pointing at what is
                    selected. */}
                <ArcTick
                  stretch
                  className="mt-1 h-3 origin-left scale-x-0 text-brand opacity-0 transition-[transform,opacity] duration-700 ease-[var(--ease-out-quint)] group-data-[active=true]/row:scale-x-100 group-data-[active=true]/row:opacity-100"
                  sweep={26}
                  weight={1.5}
                />
              </div>

              <p
                data-service-copy
                className="max-w-[23rem] text-small text-pretty text-muted-foreground lg:pb-3"
              >
                {service.copy}
              </p>
            </li>
          ))}
        </ul>

        {/* ---- Process, folded in ---- */}
        <div className="mt-2 border-t border-hairline pt-6">
          <ol className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
            {PROCESS.map((step) => (
              <li key={step.index} className="flex items-baseline gap-2.5">
                <span className="label tnum text-brand">{step.index}</span>
                <span className="text-small text-muted-foreground">
                  {step.label}
                </span>
              </li>
            ))}
            <li className="label ml-auto text-faint">
              Prvý návrh do 72 hodín
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}
