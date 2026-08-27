"use client"

/**
 * Step 5 /05 contact experience: a compact accessible drawer revealed by
 * the primary CTA instead of a huge always-on form (Step 5 §7).
 *
 * - role="dialog" + aria-modal, focus moves in on open, returns on close
 * - Escape, backdrop click and the close button all close it
 * - the form STAYS MOUNTED while closed, so entered data survives an
 *   accidental close (inert + visibility hide it from every modality)
 * - light-theme tokens come from the existing data-chapter="paper" scope,
 *   so the proven EnquiryForm renders correctly on the paper surface
 */

import { useEffect, useRef, useState } from "react"
import { EnquiryForm } from "@/components/site/enquiry-form"
import { ENQUIRY_EVENT } from "./enquiry-bus"

export function ContactDrawer() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onOpen = () => {
      lastFocus.current = document.activeElement as HTMLElement
      setOpen(true)
    }
    window.addEventListener(ENQUIRY_EVENT, onOpen)
    return () => window.removeEventListener(ENQUIRY_EVENT, onOpen)
  }, [])

  const close = () => {
    setOpen(false)
    lastFocus.current?.focus()
  }

  useEffect(() => {
    if (!open) {
      return
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>("input, textarea, button")?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
        return
      }
      if (e.key === "Tab" && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input, textarea, select"
        )
        if (focusables.length === 0) {
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div aria-hidden={!open} {...(!open ? { inert: true } : {})}>
      {/* backdrop */}
      <button
        type="button"
        aria-label="Zavrieť kontakt"
        tabIndex={-1}
        onClick={close}
        className="fixed inset-0 z-50 bg-black/45 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Začať projekt — kontakt"
        data-chapter="paper"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[34rem] flex-col overflow-y-auto bg-[oklch(0.965_0.005_85)] px-[clamp(1.25rem,4vw,2.75rem)] py-8 text-[oklch(0.19_0.004_250)] shadow-[-30px_0_80px_rgba(15,15,20,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 text-[0.68rem] tracking-[0.3em] opacity-55">ZAČAŤ PROJEKT</p>
            <h2 className="text-[1.6rem] leading-tight font-semibold tracking-[-0.02em]">
              Povedzte nám o svojej firme.
            </h2>
            <p className="mt-2 text-[0.85rem] opacity-65">
              Ozveme sa do 24 hodín s ďalším krokom.
            </p>
          </div>
          <button
            type="button"
            aria-label="Zavrieť"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/20"
          >
            <span className="relative block h-4 w-4">
              <span className="absolute top-1/2 left-0 h-[1.4px] w-full rotate-45 bg-current" />
              <span className="absolute top-1/2 left-0 h-[1.4px] w-full -rotate-45 bg-current" />
            </span>
          </button>
        </div>
        <EnquiryForm />
        <p className="mt-6 text-[0.75rem] opacity-55">
          Alebo priamo:{" "}
          <a className="underline underline-offset-4" href="mailto:coderaslovakia@gmail.com">
            coderaslovakia@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}
