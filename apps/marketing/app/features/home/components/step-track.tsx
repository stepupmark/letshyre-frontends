import { cn } from "@workspace/ui/lib/utils"
import type { LucideIcon } from "lucide-react"

import { twoDigit } from "../lib/format"

export interface Step {
  title: string
  body: string
}

/** Numbered steps joined by a line: down the page on small screens, across it on wide ones. */
export function StepTrack({
  steps,
  icons,
  note,
}: {
  steps: Step[]
  icons: LucideIcon[]
  note: { text: string; step: number }
}) {
  return (
    <ol className="grid gap-10 xl:grid-cols-5 xl:gap-6">
      {steps.map((step, index) => {
        const Icon = icons[index]
        const last = index === steps.length - 1
        return (
          <li
            key={step.title}
            className="slide-in relative flex gap-5 xl:flex-col"
          >
            {!last && (
              <>
                <span
                  aria-hidden
                  className="absolute inset-s-5 top-13 -bottom-8 w-px bg-border xl:hidden"
                />
                <span
                  aria-hidden
                  className="grow-in absolute inset-s-13 -inset-e-4 top-5 h-px bg-brand/40 max-xl:hidden"
                />
              </>
            )}
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full border",
                last
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-brand-text"
              )}
            >
              {Icon && <Icon aria-hidden className="size-5" />}
            </span>
            <div className="flex flex-col">
              <span
                aria-hidden
                className="text-xs font-semibold text-muted-foreground tabular-nums"
              >
                {twoDigit(index + 1)}
              </span>
              <h3 className="mt-1 font-semibold text-balance">{step.title}</h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                {step.body}
              </p>
              {index === note.step && (
                <p className="mt-3 inline-flex w-fit rounded-full border border-brand/30 bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-text">
                  {note.text}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
