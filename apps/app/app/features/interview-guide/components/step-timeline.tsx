import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Lightbulb } from "lucide-react"
import type { KeyboardEvent } from "react"

import { hasTip, PHASES, STEPS, type StepKey } from "../lib/guide-steps"
import { Scene } from "./scene-panel"

export function StepTimeline({
  active,
  pick,
  register,
}: {
  active: number
  pick: (index: number) => void
  register: (index: number) => (item: HTMLElement | null) => void
}) {
  const { t } = useTranslation("guide")

  // ↑/↓ walk the steps like a list, moving focus and the scene together
  const walk = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key]
    if (!step) return
    const next = index + step
    if (next < 0 || next >= STEPS.length) return
    event.preventDefault()
    document.getElementById(`guide-step-${next}`)?.focus()
    pick(next)
  }

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute inset-y-4 inset-s-[15px] w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--border)_0_6px,transparent_6px_12px)]"
      />
      {PHASES.map((phase) => (
        <section key={phase.id} className="relative pb-4 last:pb-0">
          <h2 className="ms-12 mb-3 text-xs font-semibold text-brand-text">
            {t(`phases.${phase.id}`)}
          </h2>
          <ol
            start={STEPS.indexOf(phase.steps[0]) + 1}
            className="flex flex-col"
          >
            {phase.steps.map((step) => {
              const index = STEPS.indexOf(step)
              return (
                <StepItem
                  key={step}
                  step={step}
                  index={index}
                  current={index === active}
                  ref={register(index)}
                  onPick={() => {
                    pick(index)
                  }}
                  onKeyDown={(event) => {
                    walk(index, event)
                  }}
                />
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

function StepItem({
  step,
  index,
  current,
  ref,
  onPick,
  onKeyDown,
}: {
  step: StepKey
  index: number
  current: boolean
  ref: (item: HTMLElement | null) => void
  onPick: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  const { t } = useTranslation("guide")

  return (
    <li
      ref={ref}
      data-index={index}
      aria-current={current ? "step" : undefined}
      className="relative flex gap-4 pb-6"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative grid size-8 shrink-0 place-items-center rounded-full border bg-card text-sm font-semibold text-muted-foreground tabular-nums transition-[background-color,border-color,color,scale] duration-300 motion-reduce:transition-none",
          current &&
            "text-on-media scale-110 border-brand bg-brand shadow-[0_6px_16px_-6px_var(--brand)]"
        )}
      >
        {index + 1}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
        <h3>
          <button
            id={`guide-step-${index}`}
            type="button"
            onClick={onPick}
            onKeyDown={onKeyDown}
            className={cn(
              "rounded-sm text-start text-base font-semibold tracking-tight text-muted-foreground transition-colors duration-300 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
              current && "text-foreground"
            )}
          >
            {t(`steps.${step}.title`)}
          </button>
        </h3>
        <p
          className={cn(
            "max-w-prose text-sm text-pretty text-muted-foreground"
          )}
        >
          {t(`steps.${step}.body`)}
        </p>
        {hasTip(step) && (
          <p className="flex items-start gap-2 self-start rounded-lg bg-warning/10 px-2.5 py-1.5 text-sm">
            <Lightbulb
              className="mt-0.5 size-3.5 shrink-0 text-warning"
              aria-hidden="true"
            />
            <span>
              <span className="font-medium">{t("tip")}</span>{" "}
              {t(`steps.${step}.tip`)}
            </span>
          </p>
        )}
        <div className="mt-2 max-w-sm lg:hidden">
          <Scene step={step} play={current} />
        </div>
      </div>
    </li>
  )
}
