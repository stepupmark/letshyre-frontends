import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowLeft, Check } from "lucide-react"
import type { ReactNode } from "react"

import { StepTransition } from "@/components/motion/step-transition"

import { AuthHeading } from "./auth-heading"

/** Named stages, back, and the heading for one screen of an auth flow. */
export function StepFrame({
  stepKey,
  direction,
  stages,
  current,
  onBack,
  title,
  description,
  children,
}: {
  stepKey: string
  direction: 1 | -1
  stages: string[]
  current: number
  onBack?: () => void
  title: string
  description?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation("auth")
  const dir = dirFor(useLocale())
  const progress = { current: current + 1, total: stages.length }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            className="-ms-2 w-fit"
            onClick={onBack}
          >
            <ArrowLeft className="rtl:-scale-x-100" />
            {t("back")}
          </Button>
        )}
        <ol aria-label={t("progress")} className="flex items-start">
          {stages.map((label, index) => (
            <Stage
              key={label}
              label={label}
              number={index + 1}
              state={
                index < current
                  ? "done"
                  : index === current
                    ? "current"
                    : "next"
              }
            />
          ))}
        </ol>
        <p
          aria-hidden="true"
          className="text-xs text-muted-foreground sm:hidden"
        >
          {t("stageAnnounce", { ...progress, label: stages[current] })}
        </p>
        <p aria-live="polite" className="sr-only">
          {t("stageAnnounce", { ...progress, label: stages[current] })}
        </p>
      </div>
      <StepTransition step={stepKey} direction={direction} dir={dir}>
        <div className="flex flex-col gap-6">
          <AuthHeading title={title} lead={description} />
          {children}
        </div>
      </StepTransition>
    </div>
  )
}

function Stage({
  label,
  number,
  state,
}: {
  label: string
  number: number
  state: "done" | "current" | "next"
}) {
  return (
    <li
      aria-current={state === "current" ? "step" : undefined}
      className="relative flex flex-1 flex-col items-center gap-2 text-center"
    >
      {number > 1 && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-s-[calc(-50%+1.25rem)] inset-e-[calc(50%+1.25rem)] top-3.5",
            state === "next"
              ? "border-t border-dashed border-border"
              : "grow-x h-0.5 -translate-y-px rounded-full bg-brand rtl:origin-right"
          )}
        />
      )}
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-xs font-medium tabular-nums transition-colors duration-300 motion-reduce:transition-none",
          state === "done" && "bg-primary text-primary-foreground",
          state === "current" &&
            "ring-once bg-brand-muted text-brand-text ring-2 ring-brand",
          state === "next" && "border bg-background text-muted-foreground"
        )}
      >
        {state === "done" ? (
          <Check className="pop size-3.5" strokeWidth={3} aria-hidden="true" />
        ) : (
          number
        )}
      </span>
      <span
        className={cn(
          "text-xs text-balance max-sm:sr-only",
          state === "current"
            ? "font-medium text-foreground"
            : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </li>
  )
}
