import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check, X } from "lucide-react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

import { stepsOf, type Stage, type StepState } from "../lib/applications"

export function ApplicationStepper({
  stage,
  vertical = false,
  notes,
}: {
  stage: Stage
  vertical?: boolean
  notes?: Partial<Record<Stage, ReactNode>>
}) {
  const { t } = useTranslation("candidateJobs")
  const steps = stepsOf(stage)

  if (vertical)
    return (
      <ol aria-label={t("timeline.label")} className="flex flex-col">
        {steps.map((step, i) => (
          <li
            key={step.stage}
            aria-current={step.state === "now" ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-s-2 top-5 bottom-0 w-px -translate-x-1/2 rtl:translate-x-1/2",
                  steps[i + 1]?.state === "todo"
                    ? "bg-border"
                    : "bg-foreground/30"
                )}
              />
            )}
            <Dot state={step.state} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <StepLabel state={step.state}>
                {t(`status.${step.stage}`)}
              </StepLabel>
              {notes?.[step.stage] && (
                <span className="text-sm text-pretty text-muted-foreground">
                  {notes[step.stage]}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    )

  return (
    <ol
      aria-label={t("timeline.label")}
      className="flex items-center gap-2 text-xs"
    >
      {steps.map((step, i) => (
        <li
          key={step.stage}
          aria-current={step.state === "now" ? "step" : undefined}
          className={cn("flex min-w-0 items-center gap-2", i > 0 && "flex-1")}
        >
          {i > 0 && <Line reached={step.state !== "todo"} index={i} />}
          <Dot state={step.state} />
          <span
            className={cn(
              "whitespace-nowrap",
              (step.state === "done" || step.state === "todo") &&
                "max-sm:sr-only"
            )}
          >
            <StepLabel state={step.state}>
              {t(`status.${step.stage}`)}
            </StepLabel>
          </span>
        </li>
      ))}
    </ol>
  )
}

function Line({ reached, index }: { reached: boolean; index: number }) {
  if (!reached)
    return <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-border" />
  return (
    <m.span
      aria-hidden="true"
      className="h-px min-w-4 flex-1 origin-left bg-foreground/40 rtl:origin-right"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: duration.slow, ease, delay: index * 0.06 }}
    />
  )
}

function Dot({ state }: { state: StepState }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-4 shrink-0 place-items-center rounded-full border [&_svg]:size-2.5",
        state === "done" && "border-foreground/40 text-foreground",
        state === "now" && "border-primary bg-primary text-primary-foreground",
        state === "stopped" &&
          "border-muted-foreground/50 bg-muted text-muted-foreground",
        state === "todo" && "border-border bg-background"
      )}
    >
      {state === "done" && <Check strokeWidth={3} />}
      {state === "stopped" && <X strokeWidth={3} />}
      {state === "now" && <span className="size-1.5 rounded-full bg-current" />}
    </span>
  )
}

function StepLabel({
  state,
  children,
}: {
  state: StepState
  children: ReactNode
}) {
  const { t } = useTranslation("candidateJobs")
  return (
    <span
      className={cn(
        "font-medium",
        state === "todo" && "font-normal text-muted-foreground"
      )}
    >
      {children}
      {state === "done" && (
        <span className="sr-only"> {t("timeline.done")}</span>
      )}
    </span>
  )
}
