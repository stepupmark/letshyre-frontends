import { Trans, useFormat, useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { LightbulbIcon } from "lucide-react"

import { useGuideLinks } from "../hooks/use-guide-links"
import {
  hasTip,
  PHASES,
  PRIVACY_ANCHOR,
  STEP_ANCHORS,
  type StepId,
  type TipStepId,
} from "../lib/sections"
import { StepScreen } from "./art/step-screens"

const STEPS = PHASES.flatMap((phase) => phase.steps)

// numbering runs on across phases
const PHASE_START = PHASES.map((_, i) =>
  PHASES.slice(0, i).reduce((count, phase) => count + phase.steps.length, 0)
)

/** Index of the step being read; past the last one once the reader reaches the privacy note. */
function readingIndex(active?: string) {
  if (active === PRIVACY_ANCHOR) return STEPS.length
  return STEPS.findIndex((id) => STEP_ANCHORS[id] === active)
}

function Tip({ id }: { id: TipStepId }) {
  const { t } = useTranslation("interview")

  return (
    <div className="flex max-w-xl items-start gap-3 rounded-xl bg-brand-muted/60 px-4 py-3 text-sm">
      <LightbulbIcon
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-brand-text"
      />
      <p>
        <strong className="me-1.5 font-semibold">{t("tip")}</strong>
        {t(`steps.${id}.tip`)}
      </p>
    </div>
  )
}

export function InterviewSteps({ active }: { active?: string }) {
  const { t } = useTranslation("interview")
  const format = useFormat()
  const links = useGuideLinks()
  const reading = readingIndex(active)

  return (
    <div className="flex flex-col gap-14">
      {PHASES.map((phase, p) => {
        const start = PHASE_START[p] ?? 0
        const steps: readonly StepId[] = phase.steps

        return (
          <section key={phase.id} aria-labelledby={`phase-${phase.id}`}>
            <h2
              id={`phase-${phase.id}`}
              className="text-2xl font-semibold tracking-tight"
            >
              {t(`phases.${phase.id}`)}
            </h2>
            <ol start={start + 1} className="mt-8 flex flex-col">
              {steps.map((id, i) => {
                const index = start + i
                const done = index < reading
                const current = index === reading
                const last = i === steps.length - 1

                return (
                  <li
                    key={id}
                    id={STEP_ANCHORS[id]}
                    className="group/step flex scroll-mt-24 gap-4 sm:gap-6"
                  >
                    <div aria-hidden className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full border text-sm font-semibold tabular-nums transition-colors duration-300",
                          current &&
                            "border-transparent bg-primary text-primary-foreground ring-4 ring-brand/15",
                          done &&
                            "border-transparent bg-brand-muted text-brand-text"
                        )}
                      >
                        {format.number(index + 1)}
                      </span>
                      {!last && (
                        <span className="relative mt-2 w-px flex-1 bg-border">
                          <span
                            className={cn(
                              "absolute inset-0 origin-top bg-brand/60 transition-[scale] duration-500 ease-out motion-reduce:transition-none",
                              done ? "scale-y-100" : "scale-y-0"
                            )}
                          />
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "grid min-w-0 flex-1 gap-5 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-8",
                        !last && "pb-12"
                      )}
                    >
                      <div className="flex flex-col gap-2 pt-1">
                        <h3 className="text-lg font-semibold tracking-tight">
                          {t(`steps.${id}.title`)}
                        </h3>
                        <p className="max-w-xl text-pretty text-muted-foreground">
                          <Trans
                            t={t}
                            i18nKey={`steps.${id}.desc`}
                            components={links}
                          />
                        </p>
                        {hasTip(id) && (
                          <div className="mt-2">
                            <Tip id={id} />
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-80 self-start rounded-2xl border bg-muted/40 p-3 transition-colors duration-300 group-hover/step:border-brand/40",
                          current && "border-brand/40"
                        )}
                      >
                        <StepScreen step={id} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
