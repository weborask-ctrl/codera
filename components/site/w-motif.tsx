import { cn } from "@/lib/utils"

/**
 * The Webora motif.
 *
 * The wordmark's W is a single stroke that descends, rises, descends and
 * rises again — a path with vertices. That vertex is the one shape reused
 * across the site: as the node marker on the process timeline, as the dip in
 * the timeline's connecting track, and as the small mark that numbers a
 * project. Nothing else borrows it, so it stays a signature rather than
 * decoration.
 */

/** The W's valley, on its own. Used as a node marker and a list bullet. */
export function Vertex({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 9"
      className={cn("h-2 w-auto", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 1.4 6 7.6 11 1.4"
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
 * Builds the timeline's connecting track: a straight run between node centres
 * that dips into a shallow vertex halfway along each segment. Straight enough
 * to keep every label on one baseline, angled enough to read as the W.
 */
export function buildTrackPath(
  count: number,
  width: number,
  baseline: number,
  dip: number
): string {
  const x = (index: number) => nodeCentre(index, count) * width

  if (count < 2) {
    return `M${x(0).toFixed(2)} ${baseline}`
  }

  let path = `M${x(0).toFixed(2)} ${baseline}`

  for (let index = 1; index < count; index += 1) {
    const midX = (x(index - 1) + x(index)) / 2
    path += ` L${midX.toFixed(2)} ${baseline + dip} L${x(index).toFixed(2)} ${baseline}`
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
      <Vertex className="h-1.5 text-brand" />
      <span className="tnum text-caption text-muted-foreground">{value}</span>
    </span>
  )
}
