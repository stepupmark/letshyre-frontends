import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
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

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      prefetch="intent"
      className={cn(
        "rounded-md text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}
