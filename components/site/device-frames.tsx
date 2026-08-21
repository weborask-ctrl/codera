import type * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Device frames.
 *
 * The previews inside them are real, rendered markup — not screenshots — so
 * they stay sharp at any density, cost no image bytes and never block paint.
 * Each frame's screen is a CSS container and every preview sizes itself in
 * `cqw`, so one preview renders correctly at 1100px in the hero and at 340px
 * inside a project card.
 *
 * A static preview is an illustration: pass `label` and the screen is exposed
 * as a single `role="img"` node with a Slovak description, while the markup
 * underneath is hidden rather than read out as fake navigation. Omit `label`
 * when the screen contains real controls (the before/after comparison) and
 * handle the labelling there instead.
 *
 * Previews must never use heading elements. A picture of a headline is not a
 * heading in *this* document: `<h1>` inside them would give the page seven H1s
 * and a broken outline for anything reading the HTML rather than the
 * accessibility tree — search engines included.
 */

type BrowserFrameProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> & {
  /** Shown in the address bar. Concept domains only — never a real client. */
  url: string
  label?: string
  /** Aspect ratio of the screen area, e.g. "16 / 10". */
  ratio?: string
  children: React.ReactNode
}

export function BrowserFrame({
  url,
  label,
  ratio = "16 / 10",
  className,
  children,
  ...props
}: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[0.875rem] border border-hairline bg-card shadow-[var(--shadow-frame)]",
        className
      )}
      {...props}
    >
      <div className="flex h-9 items-center gap-2 border-b border-hairline bg-surface px-3">
        <div aria-hidden="true" className="flex gap-1.5">
          <span className="size-2 rounded-full bg-border-strong/55" />
          <span className="size-2 rounded-full bg-border-strong/55" />
          <span className="size-2 rounded-full bg-border-strong/55" />
        </div>
        <div className="mx-auto flex h-5 max-w-[16rem] min-w-0 flex-1 items-center justify-center rounded-full bg-background px-2.5">
          <span className="truncate text-[0.6875rem] leading-none text-muted-foreground">
            {url}
          </span>
        </div>
        <div aria-hidden="true" className="w-[3.25rem]" />
      </div>
      <div
        className="@container relative isolate overflow-hidden bg-background"
        style={{ aspectRatio: ratio }}
      >
        {label ? <Screen label={label}>{children}</Screen> : children}
      </div>
    </div>
  )
}

type PhoneFrameProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> & {
  label: string
  children: React.ReactNode
}

export function PhoneFrame({
  label,
  className,
  children,
  ...props
}: PhoneFrameProps) {
  return (
    <div
      className={cn(
        "rounded-[2.25rem] border border-hairline bg-card p-[0.4rem] shadow-[var(--shadow-frame)]",
        className
      )}
      {...props}
    >
      <div
        className="@container relative isolate overflow-hidden rounded-[1.9rem] bg-background"
        style={{ aspectRatio: "9 / 19" }}
      >
        <div
          aria-hidden="true"
          className="absolute top-[1.6%] left-1/2 z-10 h-[2.6%] w-[24%] -translate-x-1/2 rounded-full bg-[#111]/85"
        />
        <Screen label={label}>{children}</Screen>
      </div>
    </div>
  )
}

function Screen({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div role="img" aria-label={label} className="absolute inset-0">
      <div aria-hidden="true" className="absolute inset-0">
        {children}
      </div>
    </div>
  )
}
