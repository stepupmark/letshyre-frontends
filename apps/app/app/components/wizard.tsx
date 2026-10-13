import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router"

import { StepTransition } from "./motion/step-transition"
import { Stepper } from "./stepper"

export interface WizardStep {
  id: string
  title: string
  content: ReactNode
  /** Runs on Continue; return false to stay (show the errors in the step). */
  validate?: () => boolean | Promise<boolean>
  /** Without errors shown; a link to a later step lands on the first incomplete one. */
  isComplete?: () => boolean
}

/**
 * Multi-step form. The step lives in the URL (?step=), so back and refresh keep
 * the place; the caller keeps the draft with lib/draft.
 */
export function Wizard({
  steps,
  onFinish,
  pending = false,
  onStepChange,
}: {
  steps: WizardStep[]
  onFinish: () => void | Promise<void>
  pending?: boolean
  onStepChange?: (id: string) => void
}) {
  const { t } = useTranslation("common")
  const dir = dirFor(useLocale())
  const [params, setParams] = useSearchParams()
  const [direction, setDirection] = useState<1 | -1>(1)
  const moved = useRef(false)

  const requested = Math.max(
    0,
    steps.findIndex((s) => s.id === params.get("step"))
  )
  const blocked = steps.findIndex(
    (s, i) => i < requested && s.isComplete?.() === false
  )
  const index = blocked === -1 ? requested : blocked
  const step = steps[index]
  const last = index === steps.length - 1

  const stepId = step?.id
  useEffect(() => {
    if (stepId) onStepChange?.(stepId)
  }, [stepId, onStepChange])

  // keep the URL on the step actually shown, so a refresh doesn't skip ahead
  const redirected = blocked !== -1 && stepId !== params.get("step")
  useEffect(() => {
    if (!redirected || !stepId) return
    setParams(
      (prev) => {
        const search = new URLSearchParams(prev)
        search.set("step", stepId)
        return search
      },
      { replace: true, preventScrollReset: true }
    )
  }, [redirected, stepId, setParams])

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
      <Stepper
        titles={steps.map((s) => s.title)}
        current={index}
        onSelect={goTo}
      />

      <StepTransition step={step.id} direction={direction} dir={dir}>
        <div className="flex flex-col gap-6">
          <h2
            // the new step mounts after the old one animates out
            ref={(el) => {
              if (el && moved.current) el.focus()
            }}
            tabIndex={-1}
            className="text-xl font-semibold tracking-tight outline-none"
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
