import type { VariantProps } from "class-variance-authority"
import type * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * A link that looks like a button.
 *
 * Deliberately a plain `<a>` wearing `buttonVariants`, rather than Base UI's
 * `<Button render={<a />}>`: every CTA on this page navigates, so the anchor
 * is the correct element, it needs none of the button primitive's client-side
 * behaviour, and it keeps middle-click and "open in new tab" working.
 */
type ButtonLinkProps = React.ComponentPropsWithoutRef<"a"> &
  VariantProps<typeof buttonVariants>

export function ButtonLink({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
