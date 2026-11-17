import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { clamp, useMotionValueEvent, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { ArrowRightIcon } from "lucide-react"
import { lazy, type MouseEvent, Suspense, useId, useState } from "react"

import { Container } from "@/components/section"
import { useHydrated } from "@/hooks/use-hydrated"
import { twoDigit } from "@/lib/two-digit"

import { type PhotoName } from "../lib/photos"
import { Photo } from "./photo"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"

// illustration only, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const JourneyCard = lazy(() => import("./journey-cards"))

// the track holds still for the first and last 8% of the scene, so each end gets a beat on screen
const TRACK_START = 0.08
const TRACK_SPAN = 0.84

const trackAt = (p: number) => clamp(0, 1, (p - TRACK_START) / TRACK_SPAN)

const PHOTOS: PhotoName[] = [
  "home/post-a-job",
  "home/shortlist",
  "home/review-interview",
  "home/reach-out",
]

export function Journey() {
  const titleId = useId()

  return (
    <ScrollScene screens={2} aria-labelledby={titleId}>
      <JourneyStage titleId={titleId} />
    </ScrollScene>
  )
}

function JourneyStage({ titleId }: { titleId: string }) {
  const { t } = useTranslation("home")
  const { progress, still } = useScene()
  const hydrated = useHydrated()
  const steps = t("journey.steps", { returnObjects: true })
  // the track ends with its last panel flush to the viewport edge; in RTL it runs rightwards
  const sign = dirFor(useLocale()) === "rtl" ? -1 : 1
  const x = useTransform(progress, (p) => {
    const at = trackAt(p) * sign
    return `calc(${-at * 100}% + ${at * 100}vw)`
  })

  return (
    <div className="pin:pt-8 pin:pb-10 flex h-full flex-col py-12">
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
      {/* pinned it is a sideways track; everywhere else a vertical timeline */}
      <div className="mt-8 min-h-0 flex-1">
        <m.ol
          style={still ? undefined : { x }}
          className="unpin:mx-auto unpin:h-auto unpin:w-full unpin:max-w-6xl unpin:flex-col unpin:gap-0 unpin:transform-none! flex h-full w-max gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8"
        >
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="unpin:reveal unpin:relative unpin:w-full! unpin:gap-4 unpin:rounded-none unpin:border-0 unpin:bg-transparent unpin:p-0! unpin:ps-12! unpin:pb-10! unpin:last:pb-0! grid w-[85vw] gap-6 rounded-3xl border bg-card p-4 sm:w-[min(36rem,80vw)] sm:p-6 sm:max-lg:grid-cols-2 sm:max-lg:items-center sm:max-lg:gap-8 lg:w-[min(72rem,85vw)] lg:grid-cols-5 lg:items-center lg:gap-10"
            >
              <span
                aria-hidden
                className="pin:hidden absolute inset-s-0 top-0 grid size-8 place-items-center rounded-full border bg-background text-sm font-semibold tabular-nums"
              >
                {i + 1}
                <span className="reach absolute -inset-px grid place-items-center rounded-full bg-primary text-primary-foreground">
                  {i + 1}
                </span>
              </span>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="pin:hidden absolute inset-s-4 top-10 bottom-0 w-px bg-border"
                >
                  <span className="rail-fill block size-full bg-primary" />
                </span>
              ) : null}
              {PHOTOS[i] ? (
                <Photo
                  name={PHOTOS[i]}
                  alt={step.photo}
                  sizes="(min-width: 64rem) 40rem, (min-width: 40rem) 50vw, 100vw"
                  className="unpin:border aspect-video rounded-2xl lg:col-span-3"
                />
              ) : null}
              <div className="unpin:order-first flex flex-col justify-center lg:col-span-2">
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
                    <JourneyCard index={i} className="unpin:hidden mt-8" />
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

// where the track rests with step `index` of `total` in view
const stepProgress = (index: number, total: number) =>
  TRACK_START + TRACK_SPAN * (index / Math.max(total - 1, 1))

function Rail({ labels }: { labels: string[] }) {
  const { t } = useTranslation("home")
  const { progress } = useScene()
  const [active, setActive] = useState(0)
  const fill = useTransform(
    progress,
    [TRACK_START, TRACK_START + TRACK_SPAN],
    [0, 1]
  )
  const hint = useTransform(progress, [0.06, 0.18], [1, 0])

  useMotionValueEvent(progress, "change", (p) => {
    setActive(Math.round(trackAt(p) * (labels.length - 1)))
  })

  const jump = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    const section = event.currentTarget.closest("section")
    if (!section) return
    const top = section.getBoundingClientRect().top + window.scrollY
    const span = section.offsetHeight - window.innerHeight
    window.scrollTo({
      top: top + span * stepProgress(index, labels.length),
      behavior: "smooth",
    })
  }

  return (
    <div className="mt-8 max-lg:hidden">
      <div aria-hidden className="h-px bg-border">
        <m.div
          style={{ scaleX: fill }}
          className="h-px bg-foreground ltr:origin-left rtl:origin-right"
        />
      </div>
      <ol className="mt-2 grid grid-cols-4 gap-4 text-sm tabular-nums">
        {labels.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              aria-label={t("journey.jump", { n: i + 1, title: label })}
              aria-current={i === active ? "step" : undefined}
              onClick={(event) => {
                jump(event, i)
              }}
              className="-ms-2 rounded-md p-2 text-start text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=step]:font-medium aria-[current=step]:text-foreground motion-reduce:transition-none"
            >
              <span className="text-foreground">{twoDigit(i + 1)}</span> {label}
            </button>
          </li>
        ))}
      </ol>
      <m.p
        aria-hidden
        style={{ opacity: hint }}
        className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        {t("journey.hint")}
        <ArrowRightIcon className="size-3.5 rtl:-scale-x-100" />
      </m.p>
    </div>
  )
}
