import { ArrowRightIcon } from "lucide-react"
import { type CSSProperties, lazy, Suspense } from "react"

import { SketchWindow } from "@/components/art/sketch-window"
import { useHydrated } from "@/hooks/use-hydrated"

// decorative, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const StepScene = lazy(() => import("./art/step-scenes"))

export interface Step {
  title: string
  body: string
}

interface Bridge {
  step: number
  label: string
  onFollow: () => void
}

/**
 * Steps scroll on the left while each step's screen pins on the right and slides over the last.
 * Every screen spans from its own row to the end of the grid, which is what lets it stay pinned.
 */
export function StepStory({
  side,
  steps,
  note,
  bridge,
}: {
  side: "employers" | "professionals"
  steps: Step[]
  note: { text: string; step: number }
  bridge: Bridge
}) {
  const hydrated = useHydrated()
  const timeline = (step: number) => `--how-${side}-${step}`
  const scope = {
    timelineScope: steps.map((_, i) => timeline(i + 1)).join(", "),
  } as CSSProperties

  return (
    <ol
      style={scope}
      className="grid gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-16 lg:gap-y-0"
    >
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        const place = {
          "--row": index + 1,
          "--span": steps.length - index,
          "--next": timeline(index + 2),
          viewTimelineName: timeline(index + 1),
        } as CSSProperties

        return (
          <li key={step.title} className="contents">
            <div
              id={`how-${side}-${index + 1}`}
              tabIndex={-1}
              style={place}
              className="flex scroll-mt-40 gap-5 outline-none lg:col-start-1 lg:row-start-(--row) lg:min-h-104 lg:pt-8"
            >
              <div aria-hidden className="flex flex-col items-center">
                <span
                  className={
                    last
                      ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground tabular-nums"
                      : "flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold text-brand-text tabular-nums"
                  }
                >
                  {index + 1}
                </span>
                {!last && (
                  <span className="relative mt-2 w-px flex-1 bg-border">
                    <span className="fill-down absolute inset-0 bg-brand" />
                  </span>
                )}
              </div>

              <div className="pb-2 lg:pb-12">
                <h3 className="pt-1.5 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-pretty text-muted-foreground sm:text-lg">
                  {step.body}
                </p>
                {index === note.step && (
                  <p className="mt-4 inline-flex rounded-full border border-brand/30 bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-text">
                    {note.text}
                  </p>
                )}
                {index === bridge.step && (
                  <button
                    type="button"
                    onClick={bridge.onFollow}
                    className="group/link mt-4 flex min-h-10 items-center gap-1.5 rounded-md text-sm font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {bridge.label}
                    <ArrowRightIcon
                      aria-hidden
                      className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/link:-translate-x-0.5"
                    />
                  </button>
                )}
              </div>
            </div>

            <figure
              aria-hidden
              style={place}
              className="reveal w-full max-w-lg ps-15 lg:sticky lg:top-[calc(10rem+(var(--row)-1)*0.75rem)] lg:col-start-2 lg:row-[var(--row)/span_var(--span)] lg:ms-auto lg:self-start lg:ps-0"
            >
              <div className={last ? "relative" : "lg:recede relative"}>
                <SketchWindow>
                  {steps.map((_, dot) => (
                    <rect
                      key={dot}
                      x={196 - (steps.length - 1 - dot) * 9}
                      y={16}
                      width={6}
                      height={6}
                      rx={3}
                      className={
                        dot <= index ? "fill-brand" : "fill-muted-foreground/20"
                      }
                    />
                  ))}
                  {hydrated && (
                    <Suspense>
                      <StepScene side={side} index={index} />
                    </Suspense>
                  )}
                </SketchWindow>
                {!last && (
                  <span className="recede-shade absolute inset-3 rounded-3xl bg-background max-lg:hidden" />
                )}
              </div>
            </figure>
          </li>
        )
      })}
    </ol>
  )
}
