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
        <p className="mb-4 text-sm font-medium tracking-wide text-brand-text">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="flex flex-col">
        <span className="font-display text-4xl leading-none tracking-tight text-balance sm:text-5xl">
          {title}
        </span>
        <span className="font-script text-5xl leading-[1.2] text-brand-text sm:text-6xl">
          {accent}
        </span>
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-lg text-pretty text-muted-foreground",
            center && "max-w-md"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
