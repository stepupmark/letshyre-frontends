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
}) {
  return (
    <li
      id={id}
      className="group/step relative grid gap-10 pb-20 last:pb-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:pb-32"
    >
      <span
        aria-hidden
        className="rail-in absolute inset-s-5 top-14 bottom-4 w-px bg-border group-last/step:hidden max-lg:hidden"
      />
      <div className="slide-in flex gap-4 sm:gap-6 lg:sticky lg:top-28 lg:self-start">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background font-medium tabular-nums max-sm:hidden">
          {step}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2.5 text-sm font-medium text-brand-text sm:mt-2.5">
            <span className="flex size-6 items-center justify-center rounded-full border text-xs text-foreground tabular-nums sm:hidden">
              {step}
            </span>
            {eyebrow}
          </p>
          <Heading
            as="h3"
            id={`${id}-title`}
            title={title}
            accent={accent}
            className="mt-4"
          />
          <p className="mt-4 text-pretty text-muted-foreground">{body}</p>
          <Points items={points} className="mt-6" />
          {actions && (
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className="reveal rounded-3xl bg-muted/70 p-4 sm:p-8">{scene}</div>
    </li>
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
