"use client"

import { GlareHover } from "@/components/react-bits/GlareHover"
import { ArcTick } from "@/components/site/arc"
import { FormaPreview } from "@/components/site/previews/forma"
import { KonstruktPreview } from "@/components/site/previews/konstrukt"
import { VitalisPreview } from "@/components/site/previews/vitalis"
import { useScene } from "@/hooks/use-scene"
import { EASE } from "@/lib/motion"

/**
 * SCENE 02B — PRÁCA
 *
 * One stage, three states. The viewport is pinned and the projects transform
 * into one another inside it, rather than three cards scrolling past in a
 * column. Each one gets the whole screen for as long as it is on it, which is
 * the only way a piece of work reads as *work* rather than as a thumbnail in a
 * grid.
 *
 * **The ground changes with the project.** Konštrukt is graphite, Vitalis and
 * Forma are paper. That is the brief's dark → light → dark rhythm, and it is
 * driven by the work itself: the site takes on the character of whatever it is
 * showing. The switch is a `data-project` attribute that re-points the colour
 * tokens; the elements that read them carry a colour transition, so the ground
 * dissolves between states instead of cutting.
 *
 * **Very little text.** Index, name, sector, disciplines and one line about
 * the commercial decision. The visual has to carry it — and the visuals here
 * are live markup, not screenshots, so they stay sharp at any density and cost
 * no image bytes.
 */

type Project = {
  id: string
  index: string
  name: string
  sector: string
  disciplines: string
  /** One line, about the commercial decision — never about the palette. */
  reasoning: string
  domain: string
  label: string
  /** Which ground the stage takes on while this project holds it. */
  ground: "graphite" | "paper"
  preview: React.ReactNode
}

const PROJECTS: Project[] = [
  {
    id: "konstrukt",
    index: "01",
    name: "Konštrukt",
    sector: "Generálny dodávateľ stavieb",
    disciplines: "Brand direction · UX · Vývoj",
    reasoning:
      "Prebiehajúca stavba je hneď v úvode — investor vidí referenciu skôr než cenník.",
    domain: "konstrukt-koncept.sk",
    ground: "graphite",
    label:
      "Koncept webu pre stavebnú spoločnosť Konštrukt: tmavá stránka s veľkým nadpisom a jantárovým akcentom.",
    preview: <KonstruktPreview />,
  },
  {
    id: "vitalis",
    index: "02",
    name: "Vitalis",
    sector: "Súkromná klinika",
    disciplines: "Dizajn · UX · Vývoj",
    reasoning:
      "Voľné termíny hneď v úvode — hlavná obava pacienta zmizne skôr, než stihne odísť.",
    domain: "vitalis-koncept.sk",
    ground: "paper",
    label:
      "Koncept webu pre súkromnú kliniku Vitalis: svetlá stránka s panelom voľných termínov.",
    preview: <VitalisPreview />,
  },
  {
    id: "forma",
    index: "03",
    name: "Forma",
    sector: "Interiérové štúdio",
    disciplines: "Art direction · Dizajn · Vývoj",
    reasoning:
      "Sadzba časopisu namiesto katalógu — štúdio sa číta ako autor, nie ako dodávateľ.",
    domain: "forma-koncept.sk",
    ground: "paper",
    label:
      "Koncept webu pre interiérové štúdio Forma: editoriálna stránka so serifovým nadpisom na teplom podklade.",
    preview: <FormaPreview />,
  },
]

/** Scroll fraction at which each project takes over. */
const SWITCH_AT = [0, 0.37, 0.71]

export function SceneWork() {
  const sceneRef = useScene<HTMLElement>(({ gsap, q, root }) => {
    const panels = q("[data-project-panel]") as HTMLElement[]
    const identities = q("[data-project-identity]") as HTMLElement[]

    /* Every panel but the first starts covered. The resting DOM has them all
       stacked and visible, which is what reduced motion and `noscript` get —
       so the "from" state has to be applied here rather than in the markup. */
    gsap.set(panels.slice(1), { clipPath: "inset(100% 0% 0% 0%)" })
    gsap.set(identities.slice(1), { opacity: 0, yPercent: 40 })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=240%",
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

          const project = PROJECTS[active]
          if (root.dataset.project === project.id) {
            return
          }

          /* One write drives the ground, the index rail and the navigation
             bar's own tone, so the three cannot disagree with each other.
             `data-chapter` is the same attribute the static light sections
             use, so the paper palette and the nav inversion are shared code
             rather than a second mechanism for the same idea. */
          root.dataset.project = project.id
          if (project.ground === "paper") {
            root.dataset.chapter = "paper"
          } else {
            delete root.dataset.chapter
          }

          for (const item of q("[data-index-item]") as HTMLElement[]) {
            item.dataset.active = String(item.dataset.indexItem === project.id)
          }
        },
      },
    })

    /* Each transition is a curtain: the incoming project uncovers from the
       bottom while the outgoing one settles back a little. Panels move on
       `clip-path` and `scale` only — both compositor properties, so three
       full-page layouts can cross without a layout pass. */
    for (let index = 1; index < panels.length; index += 1) {
      const at = index === 1 ? 1 : 2

      timeline
        /* All the way to zero, not to a low opacity. The incoming panel only
           covers the area its own frame occupies; anything left showing at
           35% keeps the previous project's navigation bar visible above and
           beside it for the rest of the scene. */
        .to(
          panels[index - 1],
          { scale: 0.94, opacity: 0, duration: 0.5, ease: EASE.soft },
          at
        )
        .fromTo(
          panels[index],
          { clipPath: "inset(100% 0% 0% 0%)", scale: 1.04 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            duration: 0.6,
            ease: EASE.soft,
          },
          at
        )
        .to(
          identities[index - 1],
          { opacity: 0, yPercent: -35, duration: 0.35, ease: EASE.soft },
          at
        )
        .fromTo(
          identities[index],
          { opacity: 0, yPercent: 40 },
          { opacity: 1, yPercent: 0, duration: 0.45, ease: EASE.quint },
          at + 0.2
        )
    }

    /* Hold at the end so the last project is not swept off the instant it
       finishes arriving. */
    timeline.to({}, { duration: 0.6 })
  })

  return (
    <section
      ref={sceneRef}
      id="praca"
      aria-labelledby="work-heading"
      data-project="konstrukt"
      data-tone-zone
      className="chapter-morph relative flex min-h-[100svh] flex-col overflow-hidden bg-background"
    >
      <div className="container-page flex flex-1 flex-col pt-[6.5rem] pb-10">
        {/* ---- Scene header and index rail ---- */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label text-brand">03 — Práca</p>
            <h2 id="work-heading" className="sr-only">
              Vybrané koncepty
            </h2>
            <p className="label mt-2 text-faint">
              Koncepty · nejde o realizácie pre klientov
            </p>
          </div>

          {/* The index doubles as scene progress: the arc under the active
              number is the same one that has been carrying the page. */}
          <ol className="flex items-center gap-5" aria-hidden="true">
            {PROJECTS.map((project, index) => (
              <li
                key={project.id}
                data-index-item={project.id}
                data-active={index === 0 ? "true" : "false"}
                className="group/idx"
              >
                <span className="label tnum relative block pb-2 text-faint transition-colors duration-500 group-data-[active=true]/idx:text-foreground">
                  {project.index}
                  <ArcTick
                    className="absolute inset-x-0 bottom-0 h-1.5 w-full origin-center scale-x-0 text-brand opacity-0 transition-[transform,opacity] duration-500 ease-[var(--ease-out-quint)] group-data-[active=true]/idx:scale-x-100 group-data-[active=true]/idx:opacity-100"
                    startAngle={-24}
                    sweep={48}
                    weight={1.6}
                  />
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* ---- The stage ---- *
            Panels are stacked, not sequenced in flow: with motion on they are
            absolutely positioned and only one is uncovered at a time. Without
            it they fall back to ordinary stacked blocks, which is why the
            positioning is keyed off `data-motion` rather than hard-coded. */}
        <div className="work-stage relative mt-8 flex-1">
          {PROJECTS.map((project) => (
            <article
              key={project.id}
              data-project-panel
              className="work-panel grid items-center gap-y-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-x-10"
            >
              <div
                data-project-identity
                className="relative z-10 lg:pr-0"
              >
                {/* The index, set as structure rather than as a caption. It
                    fills the column above the name — which is otherwise the
                    one genuinely empty quadrant of the stage — and it is
                    outlined rather than filled, so it reads as a register
                    mark and never competes with the project's own name. */}
                <p
                  aria-hidden="true"
                  className="type-outline tnum text-display leading-[0.8]"
                >
                  {project.index}
                </p>
                <h3 className="mt-6 text-h2 tracking-[-0.035em]">
                  {project.name}
                </h3>
                <p className="mt-2 text-lead text-muted-foreground">
                  {project.sector}
                </p>
                <p className="label mt-6 text-faint">{project.disciplines}</p>
                <p className="mt-6 max-w-[22rem] text-small text-pretty text-muted-foreground">
                  {project.reasoning}
                </p>
              </div>

              {/* The visual bleeds past the container's right gutter so it
                  reads as a fragment of something larger than the screen,
                  rather than as a picture centred in a box. */}
              <div className="relative lg:-mr-[clamp(1.25rem,4vw,3.5rem)]">
                <GlareHover className="rounded-[0.75rem] border border-hairline shadow-[var(--shadow-frame)]">
                  <div
                    role="img"
                    aria-label={project.label}
                    className="@container relative isolate aspect-4/3 w-full overflow-hidden bg-background sm:aspect-16/10"
                  >
                    <div data-preview aria-hidden="true" className="absolute inset-0">
                      {project.preview}
                    </div>
                  </div>
                </GlareHover>
                <p className="label mt-3 text-faint">{project.domain}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
