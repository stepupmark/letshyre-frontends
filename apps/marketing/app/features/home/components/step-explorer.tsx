import { useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { ArrowRightIcon } from "lucide-react"
import { lazy, Suspense } from "react"

import { useHydrated } from "@/hooks/use-hydrated"

// decorative, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const StepPreview = lazy(() => import("./art/step-previews/step-preview"))

export interface Step {
  title: string
  body: string
}

export type Side = "employers" | "professionals"

interface Bridge {
  step: number
  label: string
  onFollow: () => void
}

/** One side's steps as a vertical tab list, with a panel that shows the chosen step's screen. */
export function StepExplorer({
  side,
  label,
  steps,
  note,
  bridge,
  active,
  onActive,
}: {
  side: Side
  label: string
  steps: Step[]
  note: { text: string; step: number }
  bridge: Bridge
  active: number
  onActive: (step: number) => void
}) {
  const { t } = useTranslation("home")
  const hydrated = useHydrated()

  return (
    <Tabs
      orientation="vertical"
      value={active}
      onValueChange={(value) => {
        onActive(value as number)
      }}
      className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10"
    >
      <TabsList
        aria-label={label}
        className="h-auto! w-full items-stretch gap-1 bg-transparent p-0"
      >
        {steps.map((step, index) => (
          <TabsTrigger
            key={step.title}
            value={index}
            id={`how-${side}-step-${index + 1}`}
            className="group/step h-auto flex-none items-start gap-3 rounded-xl p-3 text-start text-base whitespace-normal text-muted-foreground max-lg:py-2 data-active:bg-brand-muted data-active:text-brand-text group-data-[variant=default]/tabs-list:data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-brand-muted dark:data-active:text-brand-text"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold tabular-nums group-data-active/step:border-primary group-data-active/step:bg-primary group-data-active/step:text-primary-foreground">
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-1 pt-1">
              <span className="font-semibold text-balance">{step.title}</span>
              {index === note.step && (
                <span className="w-fit rounded-full border border-brand/30 bg-background px-2 py-0.5 text-xs font-medium text-brand-text">
                  {note.text}
                </span>
              )}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {steps.map((step, index) => (
        <TabsContent
          key={step.title}
          value={index}
          keepMounted
          className="swap-in flex flex-col rounded-2xl border bg-card p-5 text-base sm:p-6"
        >
          <p className="text-xs font-medium text-muted-foreground tabular-nums">
            {t("how.nav.step", { n: index + 1, total: steps.length })}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {step.title}
          </h3>
          <p className="mt-2 max-w-prose text-pretty text-muted-foreground">
            {step.body}
          </p>

          <div className="mt-5 flex min-h-55 flex-col justify-center">
            {hydrated && index === active && (
              <Suspense>
                <StepPreview side={side} index={index} />
              </Suspense>
            )}
          </div>

          {index === bridge.step && (
            <button
              type="button"
              onClick={bridge.onFollow}
              className="group/link mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/30 bg-brand-muted px-3 py-1.5 text-sm font-medium text-brand-text outline-none hover:border-brand/60 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {bridge.label}
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/link:-translate-x-0.5"
              />
            </button>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
