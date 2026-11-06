import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useSearchParams } from "react-router"

import { StepTransition } from "./motion/step-transition"
import { Stepper } from "./stepper"

export interface WizardStep {
  id: string
  /** Stepper label, and the heading unless `heading` is set. */
  title: string
  heading?: string
  description?: ReactNode
  content: ReactNode
  /** Shown beside the content from `lg` up, in a `wide` wizard. */
  aside?: ReactNode
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
  finishLabel,
  wide = false,
}: {
  steps: WizardStep[]
  /** Throw to stay on the last step; the caller reports what failed. */
  onFinish: () => void | Promise<void>
  pending?: boolean
  onStepChange?: (id: string) => void
  finishLabel?: ReactNode
  /** content uses the page width; the stepper stays form width */
  wide?: boolean
}) {
  const { t } = useTranslation("common")
  const dir = dirFor(useLocale())
  const [params, setParams] = useSearchParams()
  const [direction, setDirection] = useState<1 | -1>(1)
  const moved = useRef(false)
  const focused = useRef<string | null>(null)

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
    if (!last) {
      goTo(index + 1)
      return
    }
    try {
      await onFinish()
    } catch {
      // the caller has shown what failed; stay so nothing is lost
    }
  }

  const aside = wide ? step.aside : undefined

  return (
    <div
      data-wide={wide}
      className="group/wizard flex max-w-xl flex-col gap-6 data-[wide=true]:max-w-6xl"
    >
      <div className="max-w-xl">
        <Stepper
          titles={steps.map((s) => s.title)}
          current={index}
          onSelect={goTo}
        />
      </div>

      <div
        className={cn(
          aside &&
            "grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
        )}
      >
        <div className="min-w-0">
          <StepTransition step={step.id} direction={direction} dir={dir}>
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  // the new step mounts after the old one animates out; focus it once per step
                  ref={(el) => {
                    if (!el || !moved.current || focused.current === step.id)
                      return
                    focused.current = step.id
                    el.focus()
                  }}
                  tabIndex={-1}
                  className="text-xl font-semibold tracking-tight text-balance outline-none"
                >
                  {step.heading ?? step.title}
                </h2>
                {step.description && (
                  <p className="mt-1 text-sm text-pretty text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
              {step.content}
            </div>
          </StepTransition>
        </div>
        {aside && <div className="min-w-0 lg:sticky lg:top-20">{aside}</div>}
      </div>

      {/* --gutter is the page's side padding, set by the shell */}
      <div
        className={cn(
          "sticky bottom-0 z-10 -mx-(--gutter) flex items-center gap-2 border-t bg-background px-(--gutter) py-3",
          wide ? "sm:mx-0 sm:px-0" : "sm:static sm:mx-0 sm:border-0 sm:p-0"
        )}
      >
        {index > 0 && (
          <Button
            variant="outline"
            className="max-md:h-11"
            onClick={() => {
              goTo(index - 1)
            }}
          >
            {t("wizard.back")}
          </Button>
        )}
        <Button
          className="ms-auto max-md:h-11"
          onClick={() => void onContinue()}
          disabled={pending}
        >
          {last ? (finishLabel ?? t("wizard.finish")) : t("wizard.next")}
        </Button>
      </div>
    </div>
  )
}
