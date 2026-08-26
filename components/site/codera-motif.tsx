import { cn } from "@/lib/utils"

/**
 * The Codera motif.
 *
 * A single forward-pointing chevron — two strokes meeting at a point, angled
 * ahead rather than dipping down. It reads as "next" (terminal prompts, code
 * carets, breadcrumb separators) without spelling out a letter, and it fits
 * a studio that walks clients through a defined process: every use of it is
 * pointing toward the next step. Reused across the site: the node marker on
 * the process timeline, the tick marks along its connecting track, and the
 * small mark that numbers a project or service.
 *
 * Replaces the previous "Webora" motif, whose shape was a literal "W" (a
 * repeating down-up-down-up stroke, and a track that dipped into a matching
 * zigzag). Both the glyph and the track construction below are a deliberate
 * redesign — not a renamed carry-over — chosen together with the new "C"
 * ring used in `logo.tsx` and `app/icon.svg`.
 */

/** The forward chevron, on its own. Used as a node marker and a list bullet. */
export function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 9 12"
      className={cn("h-2.5 w-auto", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1.4 1 7.6 6 1.4 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The x centre of node `index`, as a fraction of the track width.
 *
 * The nodes sit in an equal-width grid, so each one is centred in its own
 * column — not spread edge to edge. The track has to use the same maths or it
 * overshoots the outer nodes and leaves stubs hanging off both ends.
 */
export function nodeCentre(index: number, count: number): number {
  return (index + 0.5) / count
}

/**
 * Builds the timeline's connecting track: a straight baseline between node
 * centres, with a small forward-chevron tick — the same glyph as `Chevron`,
 * just inlined as raw path data — at the midpoint of each segment. All of it
 * lives in one `d` string (SVG allows multiple `M` subpaths in a single
 * `<path>`), so the caller can keep drawing it as one stroke, exactly as
 * before.
 *
 * The old version dipped the line itself into a zigzag vertex between nodes;
 * that read as a repeating "W" once there were several steps in a row, which
 * is exactly the shape this redesign needed to leave behind. Keeping the
 * baseline straight and moving the rhythm into discrete forward ticks reads
 * as progression instead.
 */
export function buildTrackPath(
  count: number,
  width: number,
  baseline: number,
  tickSize = 7
): string {
  const x = (index: number) => nodeCentre(index, count) * width

  if (count < 2) {
    return `M${x(0).toFixed(2)} ${baseline}`
  }

  let path = `M${x(0).toFixed(2)} ${baseline} L${x(count - 1).toFixed(2)} ${baseline}`

  for (let index = 1; index < count; index += 1) {
    const midX = (x(index - 1) + x(index)) / 2
    const left = (midX - tickSize * 0.55).toFixed(2)
    const right = (midX + tickSize * 0.55).toFixed(2)
    const top = (baseline - tickSize).toFixed(2)
    const bottom = (baseline + tickSize).toFixed(2)
    path += ` M${left} ${top} L${right} ${baseline} L${left} ${bottom}`
  }

  return path
}

/** Numbering mark used on project and service indices. */
export function IndexMark({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Chevron className="h-2 text-brand" />
      <span className="tnum text-caption text-muted-foreground">{value}</span>
    </span>
  )
}
