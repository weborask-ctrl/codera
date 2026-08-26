"use client"

import { Dialog } from "@base-ui/react/dialog"
import { useCallback, useEffect, useState } from "react"

import { ButtonLink } from "@/components/site/button-link"
import { Logo } from "@/components/site/logo"
import { navItems, primaryCta } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * Sticky navigation.
 *
 * Two pieces of state, both cheap:
 *  - `scrolled` swaps the transparent bar for a translucent one, so the nav
 *    only becomes chrome once there is content to sit on top of.
 *  - `overInk` flips the bar's own tokens dark while the one dark chapter is
 *    passing underneath, which keeps the logo and links legible without a
 *    second colour system.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [overInk, setOverInk] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let frame = 0

    const onScroll = () => {
      if (frame) {
        return
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setScrolled(window.scrollY > 8)
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-nav-tone="ink"]')
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") {
      return
    }

    // A zero-height band just below the header: height-independent, so it also
    // works for chapters taller than the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setOverInk(entry.isIntersecting)
        }
      },
      { rootMargin: "-72px 0px -100% 0px", threshold: 0 }
    )

    for (const section of sections) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300",
        overInk && "dark",
        scrolled
          ? "material-chrome border-b border-hairline bg-background/72 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-page flex h-[4.25rem] items-center justify-between gap-6">
        <a
          href="#top"
          className="rounded-sm text-foreground transition-opacity hover:opacity-70"
        >
          <Logo />
          <span className="sr-only">Codera — domov</span>
        </a>

        <nav aria-label="Hlavná navigácia" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group/link relative inline-flex h-9 items-center rounded-sm px-3 text-small text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-1 h-px origin-center scale-x-0 bg-foreground/40 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover/link:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink
            href={primaryCta.href}
            variant="brand"
            className="hidden rounded-full sm:inline-flex"
          >
            Nezáväzná konzultácia
          </ButtonLink>

          <Dialog.Root
            open={menuOpen}
            onOpenChange={(open) => setMenuOpen(open)}
          >
            <Dialog.Trigger
              render={
                <button
                  type="button"
                  aria-label="Otvoriť menu"
                  className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
                />
              }
            >
              <span aria-hidden="true" className="flex flex-col gap-[5px]">
                <span className="block h-px w-5 bg-current" />
                <span className="block h-px w-5 bg-current" />
              </span>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
              <Dialog.Popup className="fixed inset-x-0 top-0 z-50 origin-top border-b border-hairline bg-background p-6 pb-8 shadow-[var(--shadow-lift)] transition-[opacity,transform] duration-300 ease-[var(--ease-out-quint)] data-[ending-style]:-translate-y-3 data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-3 data-[starting-style]:opacity-0">
                <div className="flex h-[2.25rem] items-center justify-between">
                  <Dialog.Title className="text-eyebrow text-muted-foreground uppercase">
                    Menu
                  </Dialog.Title>
                  <Dialog.Close
                    render={
                      <button
                        type="button"
                        aria-label="Zavrieť menu"
                        className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                      />
                    }
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="size-5"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m5 5 10 10M15 5 5 15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Dialog.Close>
                </div>

                <nav aria-label="Mobilná navigácia" className="mt-4">
                  <ul className="flex flex-col">
                    {navItems.map((item) => (
                      <li key={item.href} className="border-t border-hairline">
                        <a
                          href={item.href}
                          onClick={closeMenu}
                          className="flex h-14 items-center text-h4 text-foreground"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <ButtonLink
                  href={primaryCta.href}
                  variant="brand"
                  size="xl"
                  onClick={closeMenu}
                  className="mt-6 w-full rounded-full"
                >
                  Nezáväzná konzultácia
                </ButtonLink>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  )
}
