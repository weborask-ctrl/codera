import { cn } from "@/lib/utils"

/**
 * Webora logotype: a monochrome W drawn as one continuous stroke, plus the
 * wordmark. Monochrome on purpose — it inherits `currentColor`, so the same
 * component works on white, on the ink chapter and inside the footer without
 * a second colour variant.
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
        viewBox="0 0 22 18"
        className="h-[1.05em] w-auto"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M2 2.6 6.2 15.4 11 6.9 15.8 15.4 20 2.6"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {wordmark ? (
        <span className="text-[1.0625rem] font-semibold tracking-[-0.03em]">
          Webora
        </span>
      ) : null}
    </span>
  )
}
