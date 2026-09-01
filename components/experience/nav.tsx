"use client"

/**
 * The dynamic island (Iterácia 0.1): the full-width bar is gone. One floating
 * pill, centred at the top, that condenses once the visitor scrolls — the
 * refokus-family gesture. Ink follows the act via [data-act] CSS exactly as
 * before, and the a11y contract is unchanged: the same menu id, the same
 * aria wiring, focus in on open and back on close, Escape closes, body
 * scroll locks while open.
 */

import { useEffect, useRef, useState } from "react"
import { openEnquiry } from "./enquiry-bus"

const LINKS = [
  ["Ukážky", "#praca"],
  ["Služby", "#sluzby"],
  ["Kontakt", "#kontakt"],
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
    <header className="experience-nav pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <div className="nav-island pointer-events-auto flex items-center gap-0.5 rounded-full py-1 pr-1 pl-3.5 transition-all duration-500">
        <a href="#hlavny-obsah" className="flex items-center gap-2 pr-1.5" aria-label="Codera — domov">
          {/* biome-ignore lint/performance/noImgElement: static same-origin brand SVG; next/image adds nothing here. */}
          <img src="/brand/codera-mark-mono.svg" alt="" className="h-5 w-5" />
          <span className="text-[0.74rem] font-semibold tracking-[0.28em]">CODERA</span>
        </a>

        <nav aria-label="Hlavná navigácia" className="hidden items-center lg:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-2.5 py-2 text-[0.74rem] font-medium opacity-75 transition-opacity hover:opacity-100"
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => openEnquiry()}
          className="experience-cta rounded-full px-4 py-2 text-[0.72rem] font-medium tracking-[0.04em]"
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
          className="flex h-9 w-9 items-center justify-center lg:hidden"
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

      {/* The under-lg menu panel: transform lives ONLY here, driven by the
          open class — nothing else ever writes this element's transform. */}
      <div
        ref={panelRef}
        id="experience-menu"
        aria-hidden={!open}
        className="experience-menu pointer-events-auto fixed inset-0 z-50 flex flex-col justify-between bg-[#101116] px-[clamp(1.25rem,5vw,3rem)] pt-24 pb-10 text-[#f2f4f6] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden"
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
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="border-b border-white/12 py-5"
            >
              <span
                className="text-[2rem]"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                {label}
              </span>
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              openEnquiry()
            }}
            className="mt-8 w-full rounded-full bg-[#f2f4f6] py-4 text-center text-[0.95rem] font-medium text-[#101116]"
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
