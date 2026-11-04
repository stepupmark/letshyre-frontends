import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Heading } from "./heading"

export function Step({
  id,
  step,
  eyebrow,
  title,
  accent,
  body,
  points,
  actions,
  scene,
  wide,
}: {
  id: string
  step: number
  eyebrow: string
  title: string
  accent: string
  body: string
  points: readonly string[]
  actions?: ReactNode
  scene: ReactNode
  wide?: boolean
}) {
  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "slide-in flex flex-col overflow-hidden rounded-3xl border bg-card",
        wide
          ? "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
          : "lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-0"
      )}
    >
      <div className="flex flex-col p-6 sm:p-10">
        <p className="flex items-center gap-3 text-sm font-medium">
          <span className="flex size-7 items-center justify-center rounded-full border text-xs text-muted-foreground tabular-nums">
            {step}
          </span>
          <span className="text-brand-text">{eyebrow}</span>
        </p>
        <Heading
          as="h3"
          id={`${id}-title`}
          title={title}
          accent={accent}
          className="mt-6"
        />
        <p className="mt-4 text-pretty text-muted-foreground">{body}</p>
        <Points items={points} className="mt-6" />
        {actions && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {actions}
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex flex-1 items-center border-t bg-muted/50 p-4 sm:p-8",
          wide && "lg:border-s lg:border-t-0"
        )}
      >
        <div className="reveal w-full">{scene}</div>
      </div>
    </article>
  )
}

export function Points({
  items,
  className,
}: {
  items: readonly string[]
  className?: string
}) {
  return (
    <ul className={cn("flex flex-col gap-2.5 text-sm", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-pretty">
          <CheckIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-brand-text"
          />
          {item}
        </li>
      ))}
    </ul>
  )
}
