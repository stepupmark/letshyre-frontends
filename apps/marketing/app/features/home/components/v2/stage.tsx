import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps, ReactNode } from "react"

/** A product scene, announced to screen readers as one image described by `label`. */
export function Stage({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div role="img" aria-label={label} className={cn("relative", className)}>
      <div aria-hidden className="relative">
        {children}
      </div>
    </div>
  )
}

/** One piece of product UI inside a scene. */
export function Panel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-xl border bg-card", className)} {...props} />
  )
}

/** A 0–100 bar that fills as it scrolls in. */
export function Bar({ value }: { value: number }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <span
        className="grow-in block h-full origin-left rounded-full bg-brand"
        style={{ width: `${String(value)}%` }}
      />
    </span>
  )
}
