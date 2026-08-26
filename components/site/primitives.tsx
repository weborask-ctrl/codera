import type * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Layout primitives.
 *
 * Every section on the page is built from these three, so vertical rhythm and
 * horizontal gutters stay identical everywhere instead of being re-guessed
 * section by section.
 */

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  /**
   * `paper` is a light chapter. It re-points every colour token underneath it
   * rather than adding light-mode classes to each component inside, so the
   * same markup renders correctly on either ground — and the navigation bar
   * detects it by the attribute alone and inverts itself while it passes.
   */
  tone?: "default" | "surface" | "paper"
  size?: "default" | "sm"
}

export function Section({
  className,
  tone = "default",
  size = "default",
  ...props
}: SectionProps) {
  return (
    <section
      data-chapter={tone === "paper" ? "paper" : undefined}
      data-tone-zone=""
      className={cn(
        size === "sm" ? "section-pad-sm" : "section-pad",
        tone === "surface" && "bg-surface",
        tone === "paper" && "bg-background text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function Container({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("container-page", className)} {...props} />
}

type SectionHeaderProps = {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  /** Extra content below the lead, still inside the header's measure rules. */
  afterLead?: React.ReactNode
  /** `id` of the heading, used by `aria-labelledby` on the parent section. */
  headingId?: string
  align?: "start" | "center"
  className?: string
  as?: "h2" | "h3"
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  afterLead,
  headingId,
  align = "start",
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex max-w-[46rem] flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-eyebrow text-brand uppercase">{eyebrow}</p>
      ) : null}
      <Heading id={headingId} className="text-h2 text-balance">
        {title}
      </Heading>
      {lead ? (
        <p className="text-lead max-w-[38rem] text-pretty text-muted-foreground">
          {lead}
        </p>
      ) : null}
      {afterLead}
    </div>
  )
}

/** Thin rule used to separate list rows without drawing a full box. */
export function Hairline({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("h-px bg-hairline", className)} />
}
