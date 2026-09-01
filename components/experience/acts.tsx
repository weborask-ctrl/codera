"use client"

/**
 * Žiara — the DOM acts (/01–/05).
 *
 * One atmosphere, one sunrise: the acts share a single fog-to-frost world
 * and differ only in camera and light (CODERA_ART_DIRECTION_V3.md).
 * Native scroll, zero pins; sticky regions choreograph /02 and /03.
 * Reference records: CODERA_DESIGN_REFERENCES (igloo, exoape, basement).
 */

import { useEffect, useRef, useState } from "react"
import { MeridianHero } from "@/components/concepts/meridian"
import { StatutHero } from "@/components/concepts/statut"
import { VlnaHero } from "@/components/concepts/vlna"
import { packages } from "@/lib/site-config"
import { skills } from "@/lib/skills"
import { openEnquiry } from "./enquiry-bus"
import { bindStage, stage } from "./stage"

const MONO = { fontFamily: "var(--font-geist-mono)" }
/* Iterácia 0.1: the display voice is Fraunces, worn MODERN — large, tight,
   confident, never bookish, never with a shadow halo. */
const DISPLAY = { fontFamily: "var(--font-fraunces), Georgia, serif" }

/* ------------------------------------------------------------ binding --- */

function useStage(probe: boolean) {
  const probeRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const unbind = bindStage()
    const root = document.querySelector<HTMLElement>("main[data-experience=v3]")
    root?.setAttribute("data-hydrated", "")
    let frame = 0
    let lastScrollTs = 0
    let worst = 0
    const onScroll = () => {
      lastScrollTs = performance.now()
    }
    window.addEventListener("scroll", onScroll, { passive: true })

    const write = () => {
      frame = requestAnimationFrame(write)
      if (!root) {
        return
      }
      root.style.setProperty("--journey", stage.total.toFixed(4))

      if (probe && probeRef.current) {
        const now = performance.now()
        const delta = lastScrollTs ? now - lastScrollTs : 0
        if (delta > worst && delta < 250) {
          worst = delta
        }
        probeRef.current.textContent = `act ${stage.act} · input→write ${delta.toFixed(1)} ms (worst ${worst.toFixed(1)})`
      }
    }
    frame = requestAnimationFrame(write)

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-entered", "")
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: "-12% 0px" }
    )
    for (const el of document.querySelectorAll("[data-enter]")) {
      io.observe(el)
    }

    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-offer-row]"))
    const rowIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.toggleAttribute("data-active", e.isIntersecting)
        }
      },
      { rootMargin: "-42% 0px -42% 0px" }
    )
    for (const r of rows) {
      rowIo.observe(r)
    }

    return () => {
      unbind()
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      io.disconnect()
      rowIo.disconnect()
    }
  }, [probe])
  return probeRef
}

/* ---------------------------------------------------------- /01 ENTRY --- */

/* Flat-mode obsidians: under 1024px (and wherever WebGL is missing) the R3F
   world never mounts, so the constellation is drawn as SVG stones in the
   free upper half above the bottom-anchored copy. ONE shared silhouette —
   the stones are siblings, only size and rotation vary (Ondrej: nech sú si
   podobné). Cheap by design; the picture information survives the edit. */
const FLAT_STONE_BODY = "50,6 88,30 94,62 70,92 28,88 8,52 20,20"
const FLAT_STONE_LIT = "20,20 50,6 88,30"
const FLAT_STONES = [
  { style: { right: "4%", top: "16%", width: "min(30vmin,132px)" }, rot: 0, dur: "11s", delay: "0s" },
  { style: { left: "7%", top: "8%", width: "min(15vmin,64px)" }, rot: 118, dur: "9s", delay: "-3s" },
  { style: { right: "30%", top: "30%", width: "min(13vmin,56px)" }, rot: 226, dur: "10s", delay: "-6s" },
  { style: { left: "22%", top: "32%", width: "min(8vmin,36px)" }, rot: 74, dur: "8s", delay: "-2s" },
  { style: { left: "47%", top: "6%", width: "min(7vmin,30px)" }, rot: 168, dur: "12s", delay: "-8s" },
  { style: { right: "13%", top: "40%", width: "min(7.5vmin,32px)" }, rot: 296, dur: "9.5s", delay: "-5s" },
] as const

function FlatStones() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[5svh] h-[42svh]">
      {FLAT_STONES.map((st, i) => (
        <svg
          // biome-ignore lint/suspicious/noArrayIndexKey: static config list, never reordered.
          key={i}
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="flat-stone absolute"
          style={{ ...st.style, ["--drift-dur" as string]: st.dur, ["--drift-delay" as string]: st.delay }}
        >
          <defs>
            <linearGradient id={`fs-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#333a46" />
              <stop offset="1" stopColor="#12161d" />
            </linearGradient>
          </defs>
          <g transform={`rotate(${st.rot} 50 50)`}>
            <polygon points={FLAT_STONE_BODY} fill={`url(#fs-${i})`} stroke="rgba(235,242,252,0.3)" strokeWidth="1.2" />
            <polyline points={FLAT_STONE_LIT} fill="none" stroke="rgba(245,250,255,0.65)" strokeWidth="1.8" />
          </g>
        </svg>
      ))}
    </div>
  )
}

function ActHero({ world }: { world: boolean }) {
  return (
    <section
      data-zone="hero"
      className={`relative flex h-svh flex-col overflow-hidden text-[#f2f4f6] ${world ? "" : "molten-field"}`}
    >
      {!world ? (
        /* flat mode: the typography still owns the frame; one cool glow
           keeps the fog alive, and the SVG constellation carries the same
           picture the R3F stones paint on desktop */
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[26svh] right-[6vmin] h-[46vmin] w-[46vmin] rounded-full opacity-70 lg:top-1/2 lg:right-[2vmin] lg:h-[60vmin] lg:w-[60vmin] lg:-translate-y-1/2"
            style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(220,230,238,0.22) 0%, rgba(220,230,238,0.07) 45%, transparent 70%)" }}
          />
          <FlatStones />
        </>
      ) : null}


      {/* rotating scroll badge (monopo) */}
      <a
        href="#praca"
        aria-label="Posunúť na prácu"
        className="absolute right-[clamp(1.25rem,4vw,3.5rem)] bottom-[7svh] hidden h-[92px] w-[92px] lg:block"
      >
        <svg viewBox="0 0 100 100" className="scroll-badge h-full w-full opacity-70" role="img" aria-label="Skrolujte">
          <defs>
            <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <text fill="#f2f4f6" fontSize="10" letterSpacing="2.6" style={MONO}>
            <textPath href="#badge-circle">SCROLL · POZRIEŤ PRÁCU ·</textPath>
          </text>
          <path d="M50 42 L50 58 M44 52 L50 58 L56 52" stroke="#f2f4f6" strokeWidth="1.6" fill="none" />
        </svg>
      </a>

      {/* quiet fog thickening behind the copy so the headline never blends
          into the white C (Iterácia 0.2) — a scrim, never a text outline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ background: "radial-gradient(60% 55% at 16% 78%, rgba(8,9,12,0.72) 0%, rgba(8,9,12,0.3) 55%, transparent 78%)" }}
      />
      <div data-enter className="enter relative z-10 mt-auto mb-[7svh] px-[clamp(1.25rem,4vw,3.5rem)]">
        {/* Iterácia 0.3 (mockup 3): TYPOGRAFIA AKO HERO. The letterform left
            the stage — the headline IS the main element of /01, set at
            display scale across the full canvas with a true-italic accent
            [refokus: type at display scale; exoape: confidence through
            lightness]. The svh term caps the size on short viewports so
            three lines + support never overflow the fold. */}
        <h1
          data-hero-line
          className="text-[clamp(2.2rem,12.5vw,4.2rem)] lg:text-[clamp(3.5rem,min(11.4vw,23svh),12rem)]"
          style={{ ...DISPLAY, lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 420 }}
        >
          <span className="rise-wrap">
            <span className="rise">Vaša firma je</span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.1s" }}>
              lepšia, <em style={{ fontWeight: 380, color: "#dfe5ee" }}>než ukazuje</em>
            </span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.2s" }}>
              váš web.
            </span>
          </span>
        </h1>
        {/* the support line is about the READER, not our disciplines —
            CODERA_STEP6_CONTENT.md §3 */}
        <p className="mt-6 max-w-[32rem] text-[1.08rem] leading-[1.6] text-[#f2f4f6]/80 lg:text-[1.18rem]">
          Navrhujeme a staviame firemné weby, ktoré pôsobia tak dôveryhodne, ako
          naozaj pracujete.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="rounded-full bg-[#f2f4f6] px-6 py-3 text-[0.85rem] font-medium text-[#17181d]"
          >
            Začať projekt
          </button>
          <a href="#praca" className="border-b border-white/35 pb-0.5 text-[0.85rem] text-white/80">
            Pozrieť prácu ↓
          </a>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- /03 WORK --- */

/**
 * /02 as a SKILLS INDEX (AD v3 amendment 3, refokus grammar): capabilities,
 * not invented brands. Iterácia 0.4: pure title rows at display scale — no
 * numbers, no support lines — activated by scroll AND pointer; the active
 * row shows its demo in the tilted portal. Ready skills open their full demo
 * page; the rest carry an honest V PRÍPRAVE teaser panel, never a dead link.
 */
const SKILL_HEROES: Record<string, React.ComponentType<{ portal?: boolean }>> = {
  dizajn: StatutHero,
  objednavky: MeridianHero,
  rezervacie: VlnaHero,
}

/** Each ready skill's design decisions live in its case study. */
const SKILL_STUDY: Record<string, string> = {
  dizajn: "statut",
  objednavky: "meridian",
  rezervacie: "vlna",
}

/* Iterácia 0.4: provisional portal panels for the two skills whose demo
   sites are not built yet — an honest teaser in the portal frame, never a
   dead link. Each gets replaced by its real demo in its own session. */
function AnimTeaser() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#101116] p-[6cqw] text-[#f2f4f6]">
      <div aria-hidden="true" className="absolute inset-0">
        <div
          className="absolute rounded-full"
          style={{ right: "-12%", top: "-22%", width: "58%", aspectRatio: "1", background: "radial-gradient(50% 50% at 50% 50%, rgba(125,145,185,0.38), transparent 70%)" }}
        />
        <div className="absolute rounded-full border border-white/12" style={{ right: "6%", top: "10%", width: "36%", aspectRatio: "1", transform: "rotateX(62deg)" }} />
        <div className="absolute rounded-full border border-white/8" style={{ right: "-1%", top: "4%", width: "50%", aspectRatio: "1", transform: "rotateX(62deg)" }} />
        <div className="absolute h-[1.2cqw] w-[1.2cqw] rounded-full bg-[#dce6ee]" style={{ right: "22%", top: "24%" }} />
      </div>
      <p className="relative text-[1.35cqw] tracking-[0.22em] text-white/55" style={MONO}>
        ANIMÁCIE & 3D · UKÁŽKA V PRÍPRAVE
      </p>
      <div className="relative">
        <h3 style={{ ...DISPLAY, fontSize: "5.4cqw", lineHeight: 1.06, fontWeight: 420 }}>
          Priestor, ktorý sa pohne,
          <br />
          keď sa pohnete vy.
        </h3>
        <p className="mt-[2cqw] max-w-[52cqw] text-[1.7cqw] leading-[1.55] text-white/65">
          Scroll choreografia a reálna hĺbka — stavia sa na rovnakom základe ako
          stránka, na ktorej práve ste.
        </p>
      </div>
    </div>
  )
}

function VykonTeaser() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#F3F5F7] p-[6cqw] text-[#17181d]">
      <div aria-hidden="true" className="absolute right-[6cqw] bottom-[6cqw] flex items-end gap-[1.6cqw]">
        {[26, 16, 10, 6.5, 4].map((h, j) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static bars, never reordered.
            key={j}
            className="w-[4.4cqw] rounded-t-[0.8cqw] bg-[#17181d]"
            style={{ height: `${h}cqw`, opacity: 0.14 + j * 0.05 }}
          />
        ))}
      </div>
      <p className="relative text-[1.35cqw] tracking-[0.22em] text-[#17181d]/55" style={MONO}>
        VÝKON · UKÁŽKA V PRÍPRAVE
      </p>
      <div className="relative">
        <p className="tnum" style={{ ...DISPLAY, fontSize: "11cqw", lineHeight: 1, fontWeight: 420 }}>
          0,4 s
        </p>
        <p className="mt-[1.6cqw] max-w-[40cqw] text-[1.7cqw] leading-[1.55] text-[#17181d]/65">
          Merané, nie sľubované — rýchlosť, ktorú vidí Google aj návštevník.
        </p>
      </div>
    </div>
  )
}

const SKILL_TEASERS: Record<string, React.ComponentType<{ portal?: boolean }>> = {
  "animacie-3d": AnimTeaser,
  vykon: VykonTeaser,
}

function Portal({ Hero, href }: { Hero: React.ComponentType<{ portal?: boolean }>; href?: string }) {
  const frame = {
    aspectRatio: "16/10",
    transform:
      "perspective(1400px) rotateY(calc(var(--tx, 0) * 7deg)) rotateX(calc(var(--ty, 0) * -7deg))",
    transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    boxShadow: "0 40px 90px -35px rgba(14,15,19,0.55), 0 0 0 1px rgba(23,24,29,0.1)",
  }
  const inner = (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 h-[200%] w-[200%] origin-top-left"
      style={{ transform: "scale(0.5)", containerType: "inline-size" }}
    >
      <div className="h-full">
        <Hero portal />
      </div>
    </div>
  )
  if (!href) {
    /* teaser portals carry no route yet — a frame, not a dead link */
    return (
      <div className="relative block overflow-hidden rounded-[12px]" style={frame}>
        {inner}
      </div>
    )
  }
  return (
    <a
      href={href}
      aria-label="Otvoriť živú ukážku"
      className="group relative block overflow-hidden rounded-[12px]"
      style={frame}
    >
      {inner}
      <span
        className="absolute right-4 bottom-4 z-10 rounded-full bg-[#17181d]/85 px-5 py-2.5 text-[0.62rem] tracking-[0.16em] text-[#f2f4f6] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
        style={MONO}
      >
        VSTÚPIŤ →
      </span>
    </a>
  )
}

function ActWork({ world }: { world: boolean }) {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  /* the portal follows SCROLL (Iterácia 0.1), and since Iterácia 0.4 the
     POINTER too: a hovered row takes the portal immediately and holds it
     until the pointer leaves the index; then scroll resumes ownership. */
  const hoverRef = useRef<number | null>(null)
  useEffect(() => {
    let frame = 0
    const pick = () => {
      frame = requestAnimationFrame(pick)
      if (hoverRef.current !== null) {
        return
      }
      const rows = listRef.current?.querySelectorAll("[data-skill-row]")
      if (!rows?.length) {
        return
      }
      const mid = window.innerHeight / 2
      let best = 0
      let bestD = Number.POSITIVE_INFINITY
      rows.forEach((r, i) => {
        const rect = r.getBoundingClientRect()
        const d = Math.abs(rect.top + rect.height / 2 - mid)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      setActive((prev) => (prev === best ? prev : best))
    }
    frame = requestAnimationFrame(pick)
    return () => cancelAnimationFrame(frame)
  }, [])
  const current = skills[active]
  const CurrentHero = current.demo ? SKILL_HEROES[current.demo] : SKILL_TEASERS[current.slug]
  return (
    <section
      data-zone="work"
      id="praca"
      className="relative"
      style={world ? undefined : { background: "linear-gradient(180deg,#9BA1AC 0%,#C4C9D1 55%,#DFE3E8 100%)" }}
    >
      {/* the section says what this is, at display scale */}
      <div data-enter className="px-[clamp(1.1rem,4vw,3.5rem)] pt-[12svh] pb-[4svh]">
        <h2
          className="mt-4 max-w-[12em] text-[#17181d]"
          style={{ ...DISPLAY, fontSize: "clamp(2.4rem,5.4vw,5rem)", lineHeight: 1.02, letterSpacing: "-0.012em", fontWeight: 420 }}
        >
          <span className="rise-wrap">
            <span className="rise">Neukazujeme logá klientov.</span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.12s" }}>
              Ukazujeme, čo vieme postaviť.
            </span>
          </span>
        </h2>
        <p className="mt-5 max-w-[36rem] text-[1.02rem] leading-[1.6] text-[#17181d]/70">
          Päť schopností, žiadne vymyslené značky — každá hotová ukážka je živá
          stránka, do ktorej môžete vstúpiť a preklikať si ju.
        </p>
      </div>

      <div
        className="grid gap-10 px-[clamp(1.1rem,4vw,3.5rem)] pb-[12svh] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)] lg:gap-14"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty("--tx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
          e.currentTarget.style.setProperty("--ty", ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty("--tx", "0")
          e.currentTarget.style.setProperty("--ty", "0")
        }}
      >
        {/* the index (Iterácia 0.4): pure titles at display scale — no
            numbers, no support lines; the one intro paragraph above serves
            the whole list. The case-study link surfaces only on the active
            row, so the path to /praca stays alive without row clutter. */}
        <ol ref={listRef} onPointerLeave={() => { hoverRef.current = null }}>
          {skills.map((s, i) => (
            <li key={s.slug} data-skill-row data-enter className="border-t border-black/15 last:border-b">
              <div
                className="group flex w-full flex-col py-7 text-left lg:py-8"
                onFocusCapture={() => setActive(i)}
                onPointerEnter={() => {
                  hoverRef.current = i
                  setActive(i)
                }}
              >
                {s.ready ? (
                  <a
                    href={`/ukazky/${s.slug}`}
                    className="text-[#17181d] transition-transform duration-300 group-hover:translate-x-2"
                    style={{ ...DISPLAY, fontSize: "clamp(2.8rem,6.2vw,6.2rem)", lineHeight: 1, letterSpacing: "-0.018em", fontWeight: 520 }}
                  >
                    {s.name}
                    <span className={`ml-4 inline-block align-middle text-[0.5em] transition-opacity ${active === i ? "opacity-100" : "opacity-0"}`}>
                      →
                    </span>
                  </a>
                ) : (
                  <span
                    className="text-[#17181d]/45"
                    style={{ ...DISPLAY, fontSize: "clamp(2.8rem,6.2vw,6.2rem)", lineHeight: 1, letterSpacing: "-0.018em", fontWeight: 520 }}
                  >
                    {s.name}
                    <span className="ml-5 inline-block translate-y-[-0.4em] rounded-full border border-[#17181d]/25 px-3 py-1 align-middle text-[0.13em] tracking-[0.18em] text-[#17181d]/55" style={MONO}>
                      V PRÍPRAVE
                    </span>
                  </span>
                )}
                {s.ready ? (
                  <p
                    className={`mt-2 text-[0.88rem] text-[#17181d]/60 transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-0"}`}
                  >
                    <a
                      href={`/praca/${SKILL_STUDY[s.slug]}`}
                      className="underline underline-offset-4 hover:text-[#17181d]"
                      tabIndex={active === i ? 0 : -1}
                    >
                      Ako sme to navrhli →
                    </a>
                  </p>
                ) : null}
                {/* mobile: the portal rides under its own row */}
                <div className="mt-4 lg:hidden">
                  <Portal
                    Hero={s.demo ? SKILL_HEROES[s.demo] : SKILL_TEASERS[s.slug]}
                    href={s.ready ? `/ukazky/${s.slug}` : undefined}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* the live portal follows the active row (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-[14svh]">
            <div key={current.slug} className="portal-swap">
              <Portal
                Hero={CurrentHero}
                href={current.ready ? `/ukazky/${current.slug}` : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- /04 OFFER --- */

/**
 * Isometric artifacts (Iterácia 0.1): each discipline shows a specimen with
 * REAL depth — layered CSS 3D plates that float apart, not a flat plate.
 * Monochrome frost/ink only; the depth is the decoration.
 */
function IsoArtifact({ kind }: { kind: "strategia" | "dizajn" | "vyvoj" }) {
  const plates: { z: number; inner: React.ReactNode; bg: string; border?: string }[] =
    kind === "dizajn"
      ? [
          { z: 0, bg: "#DFE3E8", inner: null },
          {
            z: 22,
            bg: "#F6F8FA",
            inner: (
              <div className="flex h-full flex-col justify-between p-3">
                <div className="h-2 w-1/2 rounded-full bg-[#17181d]/25" />
                <div className="h-8 w-full rounded-[4px] bg-[#17181d]/10" />
              </div>
            ),
          },
          {
            z: 44,
            bg: "#17181d",
            inner: (
              <p className="p-3 text-[1.5rem] leading-none text-[#F2F4F6]" style={{ fontFamily: "var(--font-fraunces), serif" }}>
                Aa
              </p>
            ),
          },
        ]
      : kind === "strategia"
        ? [
            { z: 0, bg: "#DFE3E8", inner: null },
            {
              z: 22,
              bg: "#F6F8FA",
              inner: (
                <svg viewBox="0 0 120 80" className="h-full w-full p-2" aria-hidden="true">
                  <g stroke="#17181d" strokeOpacity="0.3" strokeWidth="1" fill="none">
                    <path d="M12 62 L44 40 L74 50 L108 18" />
                  </g>
                  <circle cx="44" cy="40" r="3.5" fill="#17181d" fillOpacity="0.55" />
                  <circle cx="108" cy="18" r="4.5" fill="#17181d" />
                </svg>
              ),
            },
            {
              z: 44,
              bg: "transparent",
              border: "1px dashed rgba(23,24,29,0.35)",
              inner: null,
            },
          ]
        : [
            { z: 0, bg: "#17181d", inner: null },
            {
              z: 22,
              bg: "#22252c",
              inner: (
                <div className="flex h-full flex-col justify-center gap-1.5 p-3">
                  <div className="h-1.5 w-3/4 rounded-full bg-[#DCE6EE]/50" />
                  <div className="h-1.5 w-1/2 rounded-full bg-[#DCE6EE]/30" />
                  <div className="h-1.5 w-2/3 rounded-full bg-[#DCE6EE]/40" />
                </div>
              ),
            },
            {
              z: 44,
              bg: "#DCE6EE",
              inner: (
                <p className="p-2.5 text-[0.62rem] tracking-[0.1em] text-[#17181d]" style={MONO}>
                  0,4 s
                </p>
              ),
            },
          ]
  return (
    <div className="iso-stage h-[150px] w-[210px]" aria-hidden="true">
      <div className="iso mx-auto mt-6 h-[96px] w-[150px]">
        {plates.map((p, i) => (
          <div
            key={p.z}
            className="iso-f overflow-hidden"
            style={{
              ["--z" as string]: `${p.z}px`,
              ["--fd" as string]: `${i * 0.6}s`,
              background: p.bg,
              border: p.border,
              boxShadow: i === 0 ? "0 30px 40px -18px rgba(14,15,19,0.35)" : "0 0 0 1px rgba(23,24,29,0.08)",
            }}
          >
            {p.inner}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActOffer({ world }: { world: boolean }) {
  return (
    <section
      data-zone="offer"
      id="sluzby"
      className="act-rule relative text-[#17181d]"
      style={world ? undefined : { background: "#EDF0F3" }}
    >
      <div className="flex flex-col gap-10 px-[clamp(1.25rem,4vw,3.5rem)] py-[9svh] lg:flex-row lg:gap-16">
        {/* sticky act title (Navigate band structure) */}
        <div className="lg:w-[34%]">
          <div className="lg:sticky lg:top-28">
            <h2
              data-enter
              style={{ ...DISPLAY, fontSize: "clamp(2.4rem,4.4vw,4.4rem)", lineHeight: 1.0, letterSpacing: "-0.012em", fontWeight: 420 }}
            >
              <span className="rise-wrap">
                <span className="rise">Čo pre vás</span>
              </span>
              <span className="rise-wrap">
                <span className="rise" style={{ ["--rise-delay" as string]: "0.12s" }}>
                  urobíme.
                </span>
              </span>
            </h2>
            <p className="mt-5 max-w-[24em] text-[1.05rem] leading-relaxed text-black/65">
              Jedna stuha, tri disciplíny — od pochopenia firmy až po web
              pripravený na produkciu.
            </p>
            {/* strand hairlines drawing toward the rows */}
            <svg aria-hidden="true" viewBox="0 0 220 60" className="mt-6 hidden w-[220px] lg:block">
              <path d="M0 8 H150 M0 30 H190 M0 52 H120" stroke="#17181d" strokeOpacity="0.35" strokeWidth="1.2" />
              <circle cx="150" cy="8" r="2.4" fill="#a4520f" />
              <circle cx="190" cy="30" r="2.4" fill="#1d5f5a" />
              <circle cx="120" cy="52" r="2.4" fill="#9c3b22" />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          {(
            [
              ["01", "STRATÉGIA", "Najprv pochopíme vašu firmu, zákazníkov a to, čo má web reálne priniesť.", "strategia"],
              ["02", "DIZAJN", "Z pochopenia vznikne vizuálny systém, ktorý firmu odlíši a pôsobí dôveryhodne.", "dizajn"],
              ["03", "VÝVOJ", "Rýchly, responzívny web pripravený na produkciu — bez kompromisov v detailoch.", "vyvoj"],
            ] as const
          ).map(([n, t, d, kind]) => (
            <div
              key={n}
              data-enter
              data-offer-row
              className="enter offer-row grid grid-cols-[3.4rem_1fr] items-baseline gap-x-6 border-t border-black/15 px-2 py-[3.4svh] lg:grid-cols-[3.4rem_1fr_auto] lg:items-center"
            >
              <span
                className="font-semibold text-black/20"
                style={{ fontSize: "clamp(1.6rem,2.6vw,2.6rem)", fontStretch: "118%" }}
              >
                {n}
              </span>
              <div>
                <span
                  className="offer-title"
                  style={{ ...DISPLAY, fontSize: "clamp(2rem,3.8vw,3.8rem)", letterSpacing: "-0.012em", fontWeight: 460 }}
                >
                  {t}
                </span>
                <p className="mt-2.5 max-w-[30em] text-[0.98rem] leading-relaxed text-black/70">{d}</p>
              </div>
              <div className="hidden lg:block">
                <IsoArtifact kind={kind} />
              </div>
            </div>
          ))}

          {/* The offer itself. Three packages, no highlighted middle column:
              pushing one of them is the pricing form of scarcity theatre, and
              the audit bans it. The "čo v tom nie je" line is the point of the
              whole block — it proves the price is a boundary, not bait. */}
          <div
            data-enter
            className="enter mt-2 grid gap-px border-t border-black/15 bg-black/12 pt-px sm:grid-cols-3"
          >
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col bg-[#EDF0F3] px-5 py-6">
                <p
                  className="text-[0.56rem] tracking-[0.2em] text-black/50"
                  style={MONO}
                >
                  {pkg.name.toUpperCase()}
                </p>
                <p
                  className="mt-2 font-semibold"
                  style={{ fontSize: "clamp(1.5rem,2.4vw,2.1rem)", letterSpacing: "-0.02em", fontStretch: "112%" }}
                >
                  od {pkg.priceFrom}
                </p>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-black/65">
                  {pkg.audience}
                </p>
                <ul className="mt-4 flex flex-col gap-2 border-t border-black/12 pt-4 text-[0.76rem] leading-snug text-black/75">
                  {pkg.scope.map((line) => (
                    <li key={line} className="grid grid-cols-[0.7rem_1fr] gap-2">
                      <span aria-hidden="true" className="mt-[0.42em] h-px bg-black/35" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-black/12 pt-3 text-[0.72rem] text-black/50">
                  Čo v tom nie je: {pkg.notIncluded}.
                </p>
              </div>
            ))}
          </div>

          {/* conversational close (The1's question + pill) */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-6">
            <p className="text-[0.9rem] text-black/70">
              Uvedené sú východiskové ceny — presnú cenu poviete po konzultácii.
            </p>
            <span className="flex items-center gap-3 text-[0.8rem] text-black/70">
              Koľko by stál ten váš?
              <button
                type="button"
                onClick={() => openEnquiry()}
                className="rounded-full bg-[#17181d] px-5 py-2.5 text-[0.75rem] font-medium text-[#f2f4f6]"
              >
                Zistiť cenu
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------- /05 RESOLUTION --- */

function ActResolution({ world }: { world: boolean }) {
  return (
    <section
      data-zone="resolution"
      id="kontakt"
      className="relative flex min-h-svh flex-col overflow-hidden text-[#17181d]"
      style={world ? undefined : { background: "radial-gradient(70% 55% at 50% 38%, #FFFFFF 0%, #EDF0F3 62%, #E2E6EB 100%)" }}
    >
      {!world ? (
        // biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here.
        <img
          src="/brand/codera-mark.svg"
          alt=""
          className="pointer-events-none absolute top-1/2 left-1/2 w-[44vmin] -translate-x-1/2 -translate-y-[64%] opacity-80"
          style={{ filter: "drop-shadow(0 30px 70px rgba(0,0,0,0.5))" }}
        />
      ) : null}

      <div
        data-enter
        className="enter relative z-10 flex flex-1 flex-col items-center justify-end px-[clamp(1.25rem,4vw,3.5rem)] pt-[34svh] pb-[10svh] text-center lg:justify-center lg:pt-[46svh]"
      >
        <h2
          className="text-[clamp(1.8rem,8vw,5.2rem)] lg:text-[clamp(2.2rem,5.4rem,5.6rem)]"
          style={{ ...DISPLAY, lineHeight: 1.02, letterSpacing: "-0.012em", fontWeight: 420 }}
        >
          <span className="rise-wrap">
            <span className="rise">Váš ďalší web nemusí</span>
          </span>
          <span className="rise-wrap">
            <span className="rise" style={{ ["--rise-delay" as string]: "0.12s" }}>
              vyzerať ako všetky ostatné.
            </span>
          </span>
        </h2>
        <p className="mt-5 text-[0.95rem] text-[#17181d]/70">Vytvorme taký, ktorý si ľudia zapamätajú.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-6" id="dopyt">
          <span className="hidden text-[0.85rem] text-[#17181d]/60 md:block">Máte projekt v hlave?</span>
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="rounded-full bg-[#17181d] px-7 py-3.5 text-[0.9rem] font-medium text-[#fafbfc]"
          >
            Začať projekt
          </button>
          <a href="mailto:coderaslovakia@gmail.com" className="text-[0.8rem] text-[#17181d]/60 underline underline-offset-4">
            coderaslovakia@gmail.com
          </a>
        </div>
      </div>

      {/* the crystal C's own stage: the world places the section-coloured C
          into this quiet band, whole and uncovered (Iterácia 0.1) */}
      <div aria-hidden="true" className="hidden h-[30svh] lg:block" />

      {/* What happens after the form — the biggest SMB friction is not the
          price, it is not knowing what they are starting
          (CODERA_STEP6_CONTENT.md §7). Three verifiable commitments. */}
      <div
        data-enter
        className="enter relative z-10 mx-auto mb-14 w-full max-w-[52rem] px-[clamp(1.25rem,4vw,3.5rem)]"
      >
        <p className="text-center text-[1.3rem] text-[#17181d]/80" style={{ ...DISPLAY, fontWeight: 460 }}>
          Čo bude nasledovať
        </p>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-[12px] border border-black/12 bg-black/12 sm:grid-cols-3">
          {[
            ["01", "Do 24 hodín sa ozveme a spýtame sa na to, čo z formulára nevyplynulo."],
            ["02", "Do 72 hodín uvidíte prvý vizuálny návrh vašej stránky."],
            ["03", "Ak vás nezaujme, končíme — nič neplatíte a nič nepodpisujete."],
          ].map(([n, line]) => (
            <li key={n} className="bg-[#F6F8FA]/85 px-6 py-6 text-left">
              <span className="text-[1.8rem] text-[#17181d]/30" style={{ ...DISPLAY, fontWeight: 460 }}>
                {n}
              </span>
              <p className="mt-2.5 text-[0.98rem] leading-[1.55] text-[#17181d]/85">{line}</p>
            </li>
          ))}
        </ol>
      </div>


      <footer className="relative z-10 bg-[#101116] px-[clamp(1.25rem,4vw,3.5rem)] py-7 text-[0.66rem] text-[#f2f4f6]/70">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="flex items-center gap-2">
            {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
            <img src="/brand/codera-mark-mono.svg" alt="" className="h-3.5 w-3.5 opacity-70" />
            <span className="tracking-[0.26em]">CODERA</span>
          </span>
          <span>
            <a href="tel:+421949753556">+421 949 753 556</a> ·{" "}
            <a href="mailto:coderaslovakia@gmail.com">coderaslovakia@gmail.com</a>
          </span>
          <span>
            <a href="#praca">Práca</a> · <a href="#sluzby">Služby</a> · <a href="#kontakt">Kontakt</a>
          </span>
          <span>© 2026 Codera</span>
        </div>
        <p className="mt-2 opacity-80">
          Ukážky v sekcii 02 sú demá štúdia Codera — nejde o realizácie pre klientov.
        </p>
      </footer>
    </section>
  )
}

/* ------------------------------------------------------------ export ---- */

export function ExperienceActs({ world, probe = false }: { world: boolean; probe?: boolean }) {
  const probeRef = useStage(probe)
  return (
    <main
      id="hlavny-obsah"
      data-experience="v3"
      tabIndex={-1}
      className="relative z-10 outline-none"
      style={{ background: world ? "transparent" : undefined }}
    >
      {/* the journey hairline: real scroll state, worn at the top edge */}
      <div aria-hidden="true" className="journey-line" />
      <ActHero world={world} />
      {world ? <div data-zone="pass" aria-hidden="true" className="h-[60svh]" /> : null}
      <ActWork world={world} />
      <ActOffer world={world} />
      <ActResolution world={world} />
      {probe ? (
        <div
          ref={probeRef}
          className="fixed right-2 bottom-2 z-50 rounded bg-black/80 px-2 py-1 font-mono text-[11px] text-lime-300"
        />
      ) : null}
    </main>
  )
}
