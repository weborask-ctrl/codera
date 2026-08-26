"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { ArcTick, Logo } from "@/components/site/arc"
import { ButtonLink } from "@/components/site/button-link"
import { Magnetic } from "@/components/site/magnetic"
import { EASE, gsap, prefersReducedMotion } from "@/lib/motion"
import { navItems, primaryCta, siteConfig, telHref } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * Navigation.
 *
 * Two navigations, one visible at a time, because they are answering
 * different questions. On a wide screen the links are simply *there* —
 * pointing at four places, one click away, no gesture to learn. Below `lg`
 * there is no room for that, so the menu becomes a scene of its own and gets
 * to be the one immersive piece of chrome on the site.
 *
 * The overlay's choreography is adapted from React Bits' `StaggeredMenu`:
 * graphite pre-layers sliding in ahead of the panel, items rising from below
 * with a slight rotation, indices fading in behind them, and the toggle's
 * plus-to-cross morph. The component itself is not used — its panel keeps its
 * links in the tab order while closed, has no Escape handling and no focus
 * containment, and reaching this site's accessibility floor from there meant
 * rewriting it rather than configuring it. The motion is theirs; the markup,
 * the tokens and the keyboard behaviour are this project's.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [onPaper, setOnPaper] = useState(false)
  const [open, setOpen] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const hasOpened = useRef(false)

  /* The bar only becomes chrome once there is something to sit on top of. */
  useEffect(() => {
    let frame = 0

    const onScroll = () => {
      if (frame) {
        return
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0
        setScrolled(window.scrollY > 12)
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

  /**
   * The bar inverts over light chapters.
   *
   * A zero-height band just under the bar, rather than a percentage of each
   * chapter: chapters here are taller than the viewport, and a threshold-based
   * observer would flip late or not at all on those.
   */
  useEffect(() => {
    const chapters = document.querySelectorAll<HTMLElement>(
      '[data-chapter="paper"]'
    )
    if (chapters.length === 0 || typeof IntersectionObserver === "undefined") {
      return
    }

    const overlapping = new Set<Element>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            overlapping.add(entry.target)
          } else {
            overlapping.delete(entry.target)
          }
        }
        setOnPaper(overlapping.size > 0)
      },
      { rootMargin: "-68px 0px -100% 0px", threshold: 0 }
    )

    for (const chapter of chapters) {
      observer.observe(chapter)
    }

    return () => observer.disconnect()
  }, [])

  /* Escape closes, and the page underneath must not scroll behind the panel. */
  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  /* The overlay timeline. Rebuilt per transition so an interrupted open and a
     close never end up tweening the same elements in opposite directions. */
  useEffect(() => {
    const panel = panelRef.current
    const layers = layersRef.current
    if (!panel || !layers) {
      return
    }

    const slabs = Array.from(layers.children)
    const items = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-menu-item]")
    )
    const tail = panel.querySelector<HTMLElement>("[data-menu-tail]")

    if (prefersReducedMotion()) {
      /* No slide, no stagger — the panel is simply present or absent. Its
         `hidden` attribute already handles that, so nothing to animate. */
      gsap.set([panel, ...slabs], { xPercent: 0 })
      gsap.set(items, { yPercent: 0, rotate: 0, opacity: 1 })
      return
    }

    /* First run is the closed state on mount: park everything off-screen with
       a `set`, never a tween, or the panel slides out on page load. */
    if (!open && !hasOpened.current) {
      gsap.set([panel, ...slabs], { xPercent: 100 })
      return
    }

    const timeline = gsap.timeline()

    if (open) {
      hasOpened.current = true
      gsap.set(items, { yPercent: 135, rotate: 6, opacity: 1 })
      if (tail) {
        gsap.set(tail, { opacity: 0, y: 18 })
      }

      slabs.forEach((slab, index) => {
        timeline.fromTo(
          slab,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.5, ease: EASE.quint },
          index * 0.07
        )
      })

      timeline
        .fromTo(
          panel,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.62, ease: EASE.quint },
          slabs.length * 0.07
        )
        .to(
          items,
          {
            yPercent: 0,
            rotate: 0,
            duration: 0.95,
            ease: EASE.quint,
            stagger: 0.075,
          },
          slabs.length * 0.07 + 0.12
        )

      if (tail) {
        timeline.to(
          tail,
          { opacity: 1, y: 0, duration: 0.5, ease: EASE.expo },
          "-=0.45"
        )
      }
    } else {
      timeline.to([panel, ...slabs], {
        xPercent: 100,
        duration: 0.38,
        ease: "power3.in",
      })
    }

    return () => {
      timeline.kill()
    }
  }, [open])

  /* Focus follows the panel: into it on open, back to the toggle on close. */
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) {
      panelRef.current
        ?.querySelector<HTMLElement>("a, button")
        ?.focus({ preventScroll: true })
    } else if (wasOpen.current) {
      toggleRef.current?.focus({ preventScroll: true })
    }
    wasOpen.current = open
  }, [open])

  const close = useCallback(() => setOpen(false), [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        onPaper && !open && "text-[oklch(0.19_0.004_250)]",
        scrolled && !open
          ? "material-chrome border-b border-hairline bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent"
      )}
      data-chapter={onPaper && !open ? "paper" : undefined}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-8">
        {/* biome-ignore lint/a11y/useValidAnchor: this is a real navigation to
            a real target (`#top`); the handler only dismisses the overlay that
            would otherwise still be covering the page on arrival. */}
        <a
          href="#top"
          onClick={close}
          className="rounded-sm text-foreground transition-opacity duration-300 hover:opacity-65"
        >
          <Logo />
          <span className="sr-only">Codera — domov</span>
        </a>

        <nav aria-label="Hlavná navigácia" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group/link relative inline-flex h-9 items-center text-small text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {item.label}
                  {/* The underline is a segment of the mark's circle, so even
                      a hover state is cut from the logo. */}
                  <ArcTick
                    className="absolute inset-x-0 bottom-0 h-1.5 w-full origin-center scale-x-0 text-brand opacity-0 transition-[transform,opacity] duration-400 ease-[var(--ease-out-quint)] group-hover/link:scale-x-100 group-hover/link:opacity-100"
                    startAngle={-24}
                    sweep={48}
                    weight={1.6}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Magnetic className="hidden sm:inline-flex">
            <ButtonLink href={primaryCta.href} variant="brand" size="sm">
              {primaryCta.label}
            </ButtonLink>
          </Magnetic>

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="codera-menu"
            aria-label={open ? "Zavrieť menu" : "Otvoriť menu"}
            onClick={() => setOpen((value) => !value)}
            className="relative z-10 inline-flex h-10 items-center gap-2.5 rounded-full pl-1 text-foreground lg:hidden"
          >
            <span className="label" aria-hidden="true">
              {open ? "Zavrieť" : "Menu"}
            </span>
            <span
              aria-hidden="true"
              className="relative block size-3.5 shrink-0"
            >
              <span className="absolute top-1/2 left-0 block h-px w-full -translate-y-1/2 bg-current" />
              <span
                className={cn(
                  "absolute top-1/2 left-0 block h-px w-full -translate-y-1/2 bg-current transition-transform duration-400 ease-[var(--ease-out-quint)]",
                  open ? "rotate-0" : "rotate-90"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Graphite pre-layers. They lead the panel in by a frame or two, which
          is what gives the overlay depth instead of a single flat slide. */}
      <div
        ref={layersRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 right-0 -z-10 w-full lg:hidden"
      >
        <div className="absolute inset-0 translate-x-full bg-surface-2" />
        <div className="absolute inset-0 translate-x-full bg-surface" />
      </div>

      {/* `inert`, not `hidden`: the panel has to stay in the layout long
          enough to slide back out, but nothing inside it may be tabbable or
          reachable by a screen reader while it is off-screen. `hidden` would
          cut the close animation off at frame one. */}
      <div
        id="codera-menu"
        ref={panelRef}
        inert={!open}
        className={cn(
          "grain fixed inset-0 z-0 flex translate-x-full flex-col justify-between overflow-y-auto bg-background px-[clamp(1.25rem,4vw,3.5rem)] pt-[6.5rem] pb-10 lg:hidden",
          !open && "pointer-events-none"
        )}
      >
        <nav aria-label="Menu">
          <ul className="relative z-10 flex flex-col">
            {navItems.map((item, index) => (
              <li
                key={item.href}
                className="overflow-hidden border-b border-hairline"
              >
                <a
                  data-menu-item
                  href={item.href}
                  onClick={close}
                  className="flex items-baseline gap-4 py-4 text-h1 tracking-[-0.04em] text-foreground"
                >
                  <span className="label tnum text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-menu-tail className="relative z-10 mt-10 flex flex-col gap-5">
          <ButtonLink
            href={primaryCta.href}
            variant="brand"
            size="xl"
            onClick={close}
            className="w-full"
          >
            {primaryCta.label}
          </ButtonLink>
          <div className="flex flex-col gap-1.5 text-small">
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {siteConfig.email}
            </a>
            <a
              href={telHref}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {siteConfig.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
