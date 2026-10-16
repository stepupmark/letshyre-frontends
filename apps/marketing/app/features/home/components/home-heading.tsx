import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

export function HomeHeading({
  id,
  eyebrow,
  title,
  accent,
  description,
  center,
  className,
}: {
  id: string
  eyebrow?: ReactNode
  title: ReactNode
  accent: ReactNode
  description?: ReactNode
  center?: boolean
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
        {title} <span className="text-brand-text">{accent}</span>
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
