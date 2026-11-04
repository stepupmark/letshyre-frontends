import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

export function BandHeading({
  id,
  eyebrow,
  title,
  accent,
  description,
  center,
  stacked,
  className,
}: {
  id: string
  eyebrow?: ReactNode
  title: ReactNode
  accent: ReactNode
  description?: ReactNode
  center?: boolean
  stacked?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col",
        center && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold text-brand-text">{eyebrow}</p>
      )}
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
      >
        {title}{" "}
        <span className={cn("text-brand-text", stacked && "block")}>
          {accent}
        </span>
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-lg text-pretty text-muted-foreground",
            center && "max-w-xl"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
