import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRightIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Link } from "react-router"

export function CtaLink({
  className,
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      className={cn(buttonVariants({ size: "lg" }), "h-12 px-6", className)}
      {...props}
    >
      {children}
    </a>
  )
}

/** A secondary link with an arrow; tall enough to be an easy target. */
export function TextLink({
  className,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      prefetch="intent"
      className={cn(
        "group/link inline-flex min-h-10 items-center gap-1.5 rounded-md text-sm font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {children}
      <ArrowRightIcon
        aria-hidden
        className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/link:-translate-x-0.5"
      />
    </Link>
  )
}

/** A secondary button that stays on the site. */
export function OutlineLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      prefetch="intent"
      className={cn(
        buttonVariants({ size: "lg", variant: "outline" }),
        "h-12 border-foreground/20 px-6",
        className
      )}
      {...props}
    />
  )
}
