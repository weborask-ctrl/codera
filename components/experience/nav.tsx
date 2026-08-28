"use client"

/**
 * Step 5 experience navigation.
 *
 * Fixed typographic bar whose ink follows the act (dark act → paper ink,
 * light acts → graphite ink) via [data-act] CSS. The under-lg menu is the
 * audit §3 rebuild: ONE translation channel (a CSS class toggling
 * `transform`, animated by transition — GSAP nowhere near it), aria-hidden
 * kept in sync, focus moved in on open and restored on close, Escape and
 * link activation close it, body scroll locked while open.
 */

import { useEffect, useRef, useState } from "react"
import { openEnquiry } from "./enquiry-bus"

const LINKS = [
  ["01", "Práca", "#praca"],
  ["02", "Služby", "#sluzby"],
  ["03", "Kontakt", "#kontakt"],
] as const

export function ExperienceNav() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const first = panelRef.current?.querySelector<HTMLElement>("a, button")
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <header className="experience-nav fixed inset-x-0 top-0 z-40">
      <div className="nav-shell flex items-center justify-between px-[clamp(1.25rem,4vw,3.5rem)] py-4 transition-colors duration-500">
        <a href="#hlavny-obsah" className="flex items-center gap-3" aria-label="Codera — domov">
          {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
          <img src="/brand/codera-mark-mono.svg" alt="" className="h-6 w-6" />
          <span className="text-[0.8rem] font-semibold tracking-[0.34em]">CODERA</span>
        </a>

        <nav aria-label="Hlavná navigácia" className="hidden items-center gap-8 lg:flex">
          {LINKS.map(([n, label, href]) => (
            <a
              key={href}
              href={href}
              className="text-[0.72rem] tracking-[0.22em] opacity-70 transition-opacity hover:opacity-100"
            >
              {n} {label.toUpperCase()}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* act signage pill (Laxenaire's scroll indicator) — text is
              driven by the stage writer via [data-act-pill] */}
          <span
            data-act-pill
            aria-hidden="true"
            className="hidden rounded-full border border-current/25 px-3 py-1.5 text-[0.6rem] tracking-[0.22em] opacity-70 lg:block"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            01 / 05
          </span>
          <button
            type="button"
            onClick={() => openEnquiry()}
            className="experience-cta rounded-full px-4 py-2 text-[0.72rem] font-medium tracking-[0.08em]"
          >
            Začať projekt
          </button>
          <button
            ref={buttonRef}
            type="button"
            aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
            aria-expanded={open}
            aria-controls="experience-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center lg:hidden"
          >
            <span className="relative block h-[10px] w-5">
              <span
                className="absolute top-0 left-0 h-[1.6px] w-full bg-current transition-transform duration-300"
                style={open ? { transform: "translateY(4.2px) rotate(45deg)" } : undefined}
              />
              <span
                className="absolute bottom-0 left-0 h-[1.6px] w-full bg-current transition-transform duration-300"
                style={open ? { transform: "translateY(-4.2px) rotate(-45deg)" } : undefined}
              />
            </span>
          </button>
        </div>
      </div>

      {/* The under-lg menu panel: transform lives ONLY here, driven by the
          open class — nothing else ever writes this element's transform. */}
      <div
        ref={panelRef}
        id="experience-menu"
        aria-hidden={!open}
        className="experience-menu fixed inset-0 z-50 flex flex-col justify-between bg-[#16171b] px-[clamp(1.25rem,5vw,3rem)] pt-24 pb-10 text-[#f4f1ea] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
        {...(!open ? { inert: true } : {})}
      >
        <button
          type="button"
          aria-label="Zavrieť menu"
          onClick={() => {
            setOpen(false)
            buttonRef.current?.focus()
          }}
          className="absolute top-5 right-[clamp(1.25rem,5vw,3rem)] flex h-10 w-10 items-center justify-center"
        >
          <span className="relative block h-5 w-5">
            <span className="absolute top-1/2 left-0 h-[1.6px] w-full rotate-45 bg-current" />
            <span className="absolute top-1/2 left-0 h-[1.6px] w-full -rotate-45 bg-current" />
          </span>
        </button>
        <nav aria-label="Mobilná navigácia" className="mt-6 flex flex-col gap-1">
          {LINKS.map(([n, label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-white/12 py-5"
            >
              <span className="font-mono text-[0.7rem] text-white/40">{n}</span>
              <span className="text-[1.7rem] font-semibold tracking-[-0.01em]">{label}</span>
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              openEnquiry()
            }}
            className="mt-8 w-full rounded-full bg-[#f4f1ea] py-4 text-center text-[0.95rem] font-medium text-[#16171b]"
          >
            Začať projekt
          </button>
        </nav>
        <div className="flex flex-col gap-1 text-[0.8rem] text-white/55">
          <a href="mailto:coderaslovakia@gmail.com">coderaslovakia@gmail.com</a>
          <a href="tel:+421949753556">+421 949 753 556</a>
        </div>
      </div>
    </header>
  )
}
