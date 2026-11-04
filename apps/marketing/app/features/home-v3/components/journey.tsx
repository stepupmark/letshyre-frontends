import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { clamp, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { lazy, Suspense, useId } from "react"

import { Container } from "@/components/section"
import { useHydrated } from "@/hooks/use-hydrated"

import { Photo, type PhotoName } from "./photo"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"

// illustration only, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const JourneyCard = lazy(() => import("./journey-cards"))

const PHOTOS: PhotoName[] = [
  "home-v2/post-a-job",
  "home-v3/shortlist",
  "home-v2/review-interview",
  "home-v2/reach-out",
]

export function Journey() {
  const titleId = useId()

  return (
    <ScrollScene screens={3} pinFrom="lg" aria-labelledby={titleId}>
      <JourneyStage titleId={titleId} />
    </ScrollScene>
  )
}

function JourneyStage({ titleId }: { titleId: string }) {
  const { t } = useTranslation("homeV3")
  const { progress, still } = useScene()
  const hydrated = useHydrated()
  const steps = t("journey.steps", { returnObjects: true })
  // the track ends with its last panel flush to the viewport edge
  const x = useTransform(progress, (p) => {
    const at = clamp(0, 1, (p - 0.08) / 0.84)
    return `calc(${-at * 100}% + ${at * 100}vw)`
  })

  return (
    <div className="flex h-full flex-col py-16 lg:pt-24 lg:pb-10">
      <Container>
        <p className="text-sm font-semibold text-brand-text">
          {t("journey.eyebrow")}
        </p>
        <h2
          id={titleId}
          className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          {t("journey.title")}
        </h2>
        {still ? null : <Rail labels={steps.map((step) => step.title)} />}
      </Container>
      <div
        role="region"
        aria-label={t("journey.carousel")}
        // only a carousel when still (phones, reduced motion); keyboard users scroll it then
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={still ? 0 : undefined}
        className={cn(
          "mt-8 min-h-0 flex-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-4 max-lg:overflow-x-auto",
          still && "snap-x snap-mandatory scroll-px-4 overflow-x-auto"
        )}
      >
        <m.ol
          style={still ? undefined : { x }}
          className="flex h-full w-max gap-4 px-4 max-lg:transform-none! sm:gap-6 sm:px-6 lg:px-8"
        >
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="grid w-[85vw] snap-start gap-6 rounded-3xl border bg-card p-4 sm:w-[min(36rem,80vw)] sm:p-6 lg:w-[min(64rem,80vw)] lg:grid-cols-5 lg:gap-10"
            >
              {PHOTOS[i] ? (
                <Photo
                  name={PHOTOS[i]}
                  alt={step.photo}
                  sizes="(min-width: 64rem) 26rem, (min-width: 40rem) 36rem, 85vw"
                  portrait
                  className="aspect-4/5 rounded-2xl max-lg:aspect-3/2 lg:col-span-2 lg:aspect-auto lg:h-full"
                />
              ) : null}
              <div className="flex flex-col justify-center lg:col-span-3">
                <p className="text-sm font-semibold text-brand-text tabular-nums">
                  {t("journey.progress", { n: i + 1, total: steps.length })}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-pretty text-muted-foreground sm:text-lg">
                  {step.body}
                </p>
                {hydrated ? (
                  <Suspense>
                    <JourneyCard index={i} className="mt-8 max-sm:hidden" />
                  </Suspense>
                ) : null}
              </div>
            </li>
          ))}
        </m.ol>
      </div>
    </div>
  )
}

function Rail({ labels }: { labels: string[] }) {
  const { progress } = useScene()
  const fill = useTransform(progress, [0.08, 0.92], [0, 1])

  return (
    <div aria-hidden className="mt-8 max-lg:hidden">
      <div className="h-px bg-border">
        <m.div
          style={{ scaleX: fill }}
          className="h-px bg-foreground ltr:origin-left rtl:origin-right"
        />
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-4 text-sm text-muted-foreground tabular-nums">
        {labels.map((label, i) => (
          <li key={label}>
            <span className="text-foreground">{`0${i + 1}`}</span> {label}
          </li>
        ))}
      </ol>
    </div>
  )
}
