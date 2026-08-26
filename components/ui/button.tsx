import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * The only UI primitive this site keeps from the component library it was
 * scaffolded with.
 *
 * Retuned for the graphite ground: there are no `dark:` rules any more,
 * because there is no user-toggled theme to switch on. Light chapters
 * re-point the tokens under them (`[data-chapter="paper"]`), so a single set
 * of token-based classes renders correctly on both grounds — which is the
 * whole reason the chapter mechanism is an attribute on an ancestor rather
 * than a class on each component.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-quint)] outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        /** The one CTA treatment on the page. */
        brand: "bg-brand text-brand-foreground hover:bg-brand-strong",
        /** The secondary action — a hairline, never a second filled button. */
        quiet:
          "border-border-strong/55 text-foreground hover:border-border-strong hover:bg-foreground/[0.06]",
        outline:
          "border-border bg-transparent hover:border-border-strong hover:bg-foreground/[0.06]",
        ghost: "hover:bg-foreground/[0.07] hover:text-foreground",
        link: "rounded-none text-foreground underline-offset-4 hover:underline",
        destructive:
          "bg-destructive/12 text-destructive hover:bg-destructive/20",
      },
      size: {
        default: "h-9 gap-1.5 px-4 text-small",
        sm: "h-8 gap-1.5 px-3.5 text-caption",
        lg: "h-11 gap-2 px-5 text-small",
        xl: "h-13 gap-2.5 px-7 text-[0.9375rem]",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
