import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { useRef, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router"

import { StepTransition } from "./motion/step-transition"

export interface WizardStep {
  id: string
  title: string
  content: ReactNode
  /** Runs on Continue; return false to stay (show the errors in the step). */
  validate?: () => boolean | Promise<boolean>
}

/**
 * Multi-step form. The step lives in the URL (?step=), so back and refresh keep
 * the place; the caller keeps the draft with lib/draft.
 */
export function Wizard({
  steps,
  onFinish,
  pending = false,
}: {
  steps: WizardStep[]
  onFinish: () => void | Promise<void>
  pending?: boolean
}) {
  const { t } = useTranslation("common")
  const dir = dirFor(useLocale())
  const [params, setParams] = useSearchParams()
  const [direction, setDirection] = useState<1 | -1>(1)
  const moved = useRef(false)

  const index = Math.max(
    0,
    steps.findIndex((s) => s.id === params.get("step"))
  )
  const step = steps[index]
  const last = index === steps.length - 1

  if (!step) return null

  const goTo = (next: number) => {
    const target = steps[next]
    if (!target) return
    moved.current = true
    setDirection(next > index ? 1 : -1)
    setParams(
      (prev) => {
        const search = new URLSearchParams(prev)
        search.set("step", target.id)
        return search
      },
      { preventScrollReset: true }
    )
  }

  const onContinue = async () => {
    if (step.validate && !(await step.validate())) return
    if (last) await onFinish()
    else goTo(index + 1)
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground tabular-nums">
          {t("wizard.step", { current: index + 1, total: steps.length })}
        </p>
        <Progress
          value={((index + 1) / steps.length) * 100}
          aria-label={t("wizard.step", {
            current: index + 1,
            total: steps.length,
          })}
        />
      </div>

      <StepTransition step={step.id} direction={direction} dir={dir}>
        <div className="flex flex-col gap-6">
          <h2
            // the new step mounts after the old one animates out
            ref={(el) => {
              if (el && moved.current) el.focus()
            }}
            tabIndex={-1}
            className="text-lg font-semibold outline-none"
          >
            {step.title}
          </h2>
          {step.content}
        </div>
      </StepTransition>

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t bg-background px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:p-0">
        {index > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              goTo(index - 1)
            }}
          >
            {t("wizard.back")}
          </Button>
        )}
        <Button
          className="ms-auto"
          onClick={() => void onContinue()}
          disabled={pending}
        >
          {last ? t("wizard.finish") : t("wizard.next")}
        </Button>
      </div>
    </div>
  )
}
