"use client"

/**
 * The WordPress hero that lands (Iterácia 4.2, Ondrej 2026-09-12: "to úvodné
 * okno vôbec nezaujme, urob to tak, aby to vyniklo").
 *
 * The exhibit IS the product demo (lusion): the bakery site edits itself in
 * front of the visitor. A ghost cursor and a small editor card retype the
 * headline, pick a brand colour, swap the photo, add a dish, turn the whole
 * site English, publish — on a desktop and a phone at once — and then hand
 * over. The room light follows the brand colour. The copy beside it never
 * moves; a mono line narrates the step (igloo: annotations carry precision).
 *
 * DOM only, GSAP for time; reduced motion renders the finished edit as a
 * composed still. Nothing here is sent anywhere.
 */

import { useEffect, useRef, useState } from "react"
import { MONO } from "./shell"
import { ACCENTS, DEFAULT_SITE, HEROES, IMG, INK, PAPER, Preview, type Site } from "./wordpress-editor"

type Step = "start" | "headline" | "accent" | "photo" | "dish" | "lang" | "publish" | "yours"

const HEADLINE = "Rožky sú na pulte od šiestej."
const DISH_NAME = "Makový závin"
const DISH_PRICE = "2,80 €"
const GREEN = ACCENTS[2][1]
const PUBLISHED_AT = "22:14"

/** the mono line beside the copy, per step */
export const STEP_LINE: Record<Step, string> = {
  start: "SLEDUJ: STRÁNKA SA PRÁVE UPRAVUJE",
  headline: "MENÍ SA · NADPIS",
  accent: "MENÍ SA · FARBA ZNAČKY",
  photo: "MENÍ SA · ÚVODNÁ FOTKA",
  dish: "MENÍ SA · MENU, NOVÉ JEDLO",
  lang: "MENÍ SA · JAZYK, CELÁ STRÁNKA",
  publish: `ZVEREJNENÉ · ${PUBLISHED_AT}`,
  yours: "TERAZ TY ↓",
}

/** the site after every step of the show — the reduced-motion still */
export const FINISHED_SITE: Site = {
  ...DEFAULT_SITE,
  headline: HEADLINE,
  accent: GREEN,
  hero: "kolace",
  menu: [...DEFAULT_SITE.menu, { id: "demo", name: DISH_NAME, price: DISH_PRICE }],
}

/** layout position of `el` inside `root`, independent of any transform on
 *  the way (the stage tilts with the pointer; rects would tilt with it) */
function offsetIn(el: HTMLElement, root: HTMLElement): { x: number; y: number; w: number; h: number } {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== root) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

export function WordpressHeroDemo({ onStep }: { onStep?: (step: Step) => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [site, setSite] = useState<Site>(DEFAULT_SITE)
  const [step, setStep] = useState<Step>("start")
  const [typed, setTyped] = useState("")
  const [still, setStill] = useState(false)
  const [hot, setHot] = useState<string | undefined>(undefined)
  const stepRef = useRef(onStep)
  stepRef.current = onStep

  useEffect(() => {
    const stage = stageRef.current
    const cursor = cursorRef.current
    if (!stage || !cursor) {
      return
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true)
      setSite(FINISHED_SITE)
      setStep("publish")
      stepRef.current?.("publish")
      return
    }
    let alive = true
    let kill: () => void = () => {}
    import("gsap").then(({ gsap }) => {
      if (!alive) {
        return
      }
      const go = (s: Step) => {
        setStep(s)
        stepRef.current?.(s)
      }
      /* the cursor glides to a thing in the stage and taps it */
      const moveTo = (sel: string, dx = 0.5, dy = 0.5, d = 0.7) => {
        const el = stage.querySelector<HTMLElement>(sel)
        if (!el) {
          return
        }
        const o = offsetIn(el, stage)
        gsap.to(cursor, { x: o.x + o.w * dx, y: o.y + o.h * dy, duration: d, ease: "power2.inOut", overwrite: true })
      }
      const tap = () => {
        gsap.fromTo(cursor, { scale: 1 }, { scale: 0.82, duration: 0.11, yoyo: true, repeat: 1, ease: "power1.inOut" })
        const ring = cursor.querySelector<HTMLElement>("[data-ring]")
        if (ring) {
          gsap.fromTo(ring, { scale: 0.4, opacity: 0.7 }, { scale: 2.2, opacity: 0, duration: 0.5, ease: "power2.out" })
        }
      }
      const type = (text: string, at: number, apply: (s: string) => void, cps = 16) => {
        const proxy = { n: 0 }
        let last = -1
        tl.to(
          proxy,
          {
            n: text.length,
            duration: text.length / cps,
            ease: "none",
            onUpdate: () => {
              /* one render per letter, not per frame */
              const n = Math.round(proxy.n)
              if (n === last) {
                return
              }
              last = n
              const s = text.slice(0, n)
              setTyped(s)
              apply(s)
            },
          },
          at
        )
      }

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true })
      /* start: the cursor enters from the copy side */
      tl.call(() => {
        setSite(DEFAULT_SITE)
        setTyped("")
        setHot(undefined)
        go("start")
        gsap.set(cursor, { x: -40, y: stage.offsetHeight * 0.5, opacity: 0 })
        gsap.to(cursor, { opacity: 1, duration: 0.4 })
      })
      /* 1 · the headline is retyped in place */
      tl.call(
        () => {
          go("headline")
          moveTo('[data-preview="desktop"] [data-field="headline"]', 0.3, 0.6, 0.9)
        },
        [],
        0.4
      )
      tl.call(
        () => {
          tap()
          setHot("headline")
          setSite((s) => ({ ...s, headline: "" }))
        },
        [],
        1.4
      )
      type(HEADLINE, 1.7, (s) => setSite((x) => ({ ...x, headline: s })), 17)
      /* 2 · a brand colour */
      tl.call(
        () => {
          setHot(undefined)
          go("accent")
          moveTo('[data-swatch="Lesná"]', 0.5, 0.5, 0.8)
        },
        [],
        3.9
      )
      tl.call(
        () => {
          tap()
          setSite((s) => ({ ...s, accent: GREEN }))
        },
        [],
        4.75
      )
      /* 3 · the photo */
      tl.call(
        () => {
          go("photo")
          moveTo('[data-thumb="kolace"]', 0.5, 0.5, 0.7)
        },
        [],
        5.5
      )
      tl.call(
        () => {
          tap()
          setSite((s) => ({ ...s, hero: "kolace" }))
        },
        [],
        6.25
      )
      /* 4 · a dish, typed */
      tl.call(
        () => {
          go("dish")
          moveTo("[data-add]", 0.5, 0.5, 0.7)
        },
        [],
        7.1
      )
      tl.call(
        () => {
          tap()
          setHot("menu")
          setSite((s) => ({ ...s, menu: [...DEFAULT_SITE.menu, { id: "demo", name: "", price: DISH_PRICE }] }))
        },
        [],
        7.85
      )
      type(DISH_NAME, 8.05, (s) => setSite((x) => ({ ...x, menu: x.menu.map((d) => (d.id === "demo" ? { ...d, name: s } : d)) })), 15)
      /* 5 · the whole site turns English */
      tl.call(
        () => {
          setHot(undefined)
          go("lang")
          moveTo('[data-lang="en"]', 0.5, 0.5, 0.8)
        },
        [],
        9.4
      )
      tl.call(
        () => {
          tap()
          setSite((s) => ({ ...s, lang: "en" }))
        },
        [],
        10.25
      )
      /* 6 · publish */
      tl.call(
        () => {
          go("publish")
          moveTo("[data-go-publish]", 0.5, 0.5, 0.8)
        },
        [],
        11.6
      )
      tl.call(
        () => {
          tap()
        },
        [],
        12.45
      )
      /* 7 · hand over */
      tl.call(
        () => {
          go("yours")
          gsap.to(cursor, { opacity: 0, duration: 0.5 })
        },
        [],
        14.2
      )
      tl.to({}, { duration: 0.1 }, 17.2)

      /* runs only while on screen */
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              tl.play()
            } else {
              tl.pause()
            }
          }
        },
        { threshold: 0.35 }
      )
      io.observe(stage)
      kill = () => {
        io.disconnect()
        tl.kill()
      }
    })
    return () => {
      alive = false
      kill()
    }
  }, [])

  const accent = site.accent
  const publishing = step === "publish" || step === "yours"

  return (
    <div ref={stageRef} className="wp-demo relative" data-step={step} style={{ ["--wp-room" as string]: accent }}>
      {/* the desktop, standing in the room */}
      <div className="wp-demo-desktop">
        <Preview site={site} compact hot={hot} />
      </div>
      {/* the phone, same site, in front */}
      <div className="wp-demo-phone wp-float" style={{ ["--fl" as string]: "-2.1s" }}>
        <Preview site={site} phone compact />
      </div>

      {/* the editor card: what is being changed, and with what */}
      <div className={`wp-demo-card ${still ? "" : "wp-float"}`} style={{ ["--fl" as string]: "-0.8s" }} aria-hidden="true">
        <div className="flex items-center justify-between text-[0.56rem] tracking-[0.18em] text-[#1B1A17]/50" style={MONO}>
          <span>EDITOR</span>
          <span style={{ color: publishing ? accent : undefined }}>{publishing ? `ZVEREJNENÉ ${PUBLISHED_AT}` : "KONCEPT"}</span>
        </div>

        {step === "start" || step === "headline" ? (
          <div className="mt-2">
            <span className="text-[0.72rem] font-bold">Nadpis</span>
            <div className="wp-demo-input mt-1">
              <span>{step === "headline" ? typed : DEFAULT_SITE.headline}</span>
              {step === "headline" ? <span className="wp-caret" /> : null}
            </div>
          </div>
        ) : null}

        {step === "accent" ? (
          <div className="mt-2">
            <span className="text-[0.72rem] font-bold">Farba značky</span>
            <div className="mt-1.5 flex gap-2">
              {ACCENTS.map(([n, c]) => (
                <span key={n} data-swatch={n} className="h-7 w-7 rounded-full border-2 transition-transform" style={{ background: c, borderColor: accent === c ? INK : "transparent", transform: accent === c ? "scale(1.12)" : undefined }} />
              ))}
            </div>
          </div>
        ) : null}

        {step === "photo" ? (
          <div className="mt-2">
            <span className="text-[0.72rem] font-bold">Úvodná fotka</span>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {(Object.keys(HEROES) as (keyof typeof HEROES)[]).map((k) => (
                <span key={k} data-thumb={k} className="block overflow-hidden rounded-md border-2" style={{ borderColor: site.hero === k ? INK : "transparent" }}>
                  <span className="block aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${IMG}/${k}.jpg)` }} />
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {step === "dish" ? (
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] font-bold">Menu</span>
              <span data-add className="rounded-full px-2.5 py-0.5 text-[0.58rem] font-bold text-white" style={{ background: INK }}>
                + Pridať
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-[1fr_4rem] gap-1.5">
              <div className="wp-demo-input">
                <span>{typed}</span>
                <span className="wp-caret" />
              </div>
              <div className="wp-demo-input justify-end" style={MONO}>
                {DISH_PRICE}
              </div>
            </div>
          </div>
        ) : null}

        {step === "lang" ? (
          <div className="mt-2">
            <span className="text-[0.72rem] font-bold">Jazyk stránky</span>
            <div className="mt-1.5 inline-flex overflow-hidden rounded-full border border-[#1B1A17]/20">
              {(["sk", "en"] as const).map((l) => (
                <span key={l} data-lang={l} className="px-3.5 py-1 text-[0.62rem] font-bold tracking-[0.1em]" style={site.lang === l ? { background: INK, color: PAPER } : { color: "rgba(27,26,23,0.7)" }}>
                  {l.toUpperCase()}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-[0.62rem] leading-[1.4] text-[#1B1A17]/55">Aj vlastné texty — celá stránka.</p>
          </div>
        ) : null}

        {publishing ? (
          <div className="mt-2">
            <span data-go-publish className="wp-demo-publish block rounded-full py-2 text-center text-[0.66rem] font-bold tracking-[0.06em] text-white" style={{ background: step === "publish" ? accent : INK }}>
              {step === "publish" ? "Publikovať" : "Zverejnené ✓"}
            </span>
            <p className="mt-1.5 text-[0.62rem] leading-[1.4] text-[#1B1A17]/55">{step === "yours" ? "Šesť zmien, o desiatej večer, bez vývojára." : "Revízia sa uloží, stránka je vonku."}</p>
          </div>
        ) : null}
      </div>

      {/* the ghost cursor */}
      <div ref={cursorRef} className="wp-demo-cursor" aria-hidden="true" style={{ opacity: still ? 0 : undefined }}>
        <span data-ring className="wp-demo-ring" style={{ borderColor: accent }} />
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true">
          <path d="M2 2l8 20 3-8 8-3L2 2z" fill="#1B1A17" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
