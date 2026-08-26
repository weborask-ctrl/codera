import { cn } from "@/lib/utils"

/**
 * Codera logotype: an open ring — a geometric "C", not a typographic one —
 * plus the wordmark. Monochrome on purpose — it inherits `currentColor`, so
 * the same component works on white, on the ink chapter and inside the
 * footer without a second colour variant.
 *
 * The ring is a single stroked arc built from an SVG arc command (large-arc,
 * counter-sweep) rather than a font glyph, which is what keeps it reading as
 * a mark rather than as a letter someone forgot to close. It replaces the
 * studio's original mark (tied to an earlier name), which was a literal
 * stylised "W" — a different silhouette entirely, not a relabelling of the
 * old one.
 */
export function Logo({
  className,
  wordmark = true,
}: {
  className?: string
  wordmark?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 24 24"
        className="h-[1.15em] w-auto"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M18.36 5.64 A9 9 0 1 0 18.36 18.36"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {wordmark ? (
        <span className="text-[1.0625rem] font-semibold tracking-[-0.03em]">
          Codera
        </span>
      ) : null}
    </span>
  )
}
