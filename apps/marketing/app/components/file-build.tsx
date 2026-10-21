import type { CSSProperties, ReactNode } from "react"

export interface BuildStep {
  title: string
  body: string
  layer: ReactNode
}

/**
 * Steps scroll on the left while one pinned file on the right gains a layer per step.
 * Browsers without scroll timelines show the file complete; phones get each layer under its step.
 */
export function FileBuild({
  id,
  steps,
  head,
  caption,
}: {
  id: string
  steps: BuildStep[]
  head: ReactNode
  caption: string
}) {
  const timeline = (i: number) =>
    i < steps.length ? `--${id}-${i + 1}` : "none"
  const scope = {
    timelineScope: steps.map((_, i) => timeline(i)).join(", "),
  } as CSSProperties
  const at = (i: number) =>
    ({ "--at": timeline(i), "--next": timeline(i + 1) }) as CSSProperties

  return (
    <div
      style={scope}
      className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16"
    >
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <li
            key={step.title}
            style={{ viewTimelineName: timeline(i) }}
            className="flex gap-5 lg:min-h-96"
          >
            <div aria-hidden className="flex flex-col items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold text-brand-text tabular-nums">
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className="relative mt-2 w-px flex-1 bg-border">
                  <span className="fill-down absolute inset-0 bg-brand" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-12 lg:pb-16">
              <h3 className="pt-1.5 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 max-w-md text-pretty text-muted-foreground sm:text-lg">
                {step.body}
              </p>
              <div
                aria-hidden
                className="slide-in mt-6 max-w-md rounded-2xl border bg-card p-4 lg:hidden"
              >
                {step.layer}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <figure
        aria-hidden
        className="max-lg:hidden lg:sticky lg:top-28 lg:self-start"
      >
        <div className="rounded-3xl border bg-card p-5 xl:p-6">
          <div className="flex items-center justify-between gap-4">
            {head}
            <span className="flex gap-1.5">
              {steps.map((step, i) => (
                <span
                  key={step.title}
                  className="relative size-2 rounded-full bg-muted-foreground/20"
                >
                  <span
                    style={at(i)}
                    className="lit-in absolute inset-0 rounded-full bg-brand"
                  />
                </span>
              ))}
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                style={at(i)}
                className="build-in relative rounded-2xl border bg-background p-4"
              >
                {step.layer}
                <span className="settle-shade pointer-events-none absolute inset-0 rounded-2xl bg-background" />
              </div>
            ))}
          </div>
        </div>
        <figcaption className="mt-4 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      </figure>
    </div>
  )
}
