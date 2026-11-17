import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"

import { Container } from "@/components/section"

import { type PhotoName } from "../lib/photos"
import { Photo } from "./photo"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"
import { stageWindow } from "./stage-window"

const PHOTOS: PhotoName[] = [
  "home/resume-pile",
  "home/live-interview",
  "home/team-review",
]

export function Proof() {
  const titleId = useId()

  return (
    <ScrollScene screens={2} aria-labelledby={titleId}>
      <ProofStage titleId={titleId} />
    </ScrollScene>
  )
}

// pinned, the captions stack in one cell and the photos in another; everywhere else each stage is a row
function ProofStage({ titleId }: { titleId: string }) {
  const { t } = useTranslation("home")
  const { progress, still } = useScene()
  const stages = t("proof.stages", { returnObjects: true })

  return (
    <Container className="pin:grid pin:h-full pin:grid-cols-9 pin:grid-rows-[1fr_auto_auto_auto_1fr] pin:gap-x-16 pin:py-6 unpin:py-12 unpin:sm:py-20">
      <div className="pin:col-span-4 pin:col-start-1 pin:row-start-2">
        <p className="text-sm font-semibold text-brand-text">
          {t("proof.eyebrow")}
        </p>
        <ProofTitle id={titleId} />
      </div>
      <ol className="pin:contents unpin:mt-12 unpin:grid unpin:gap-10 unpin:lg:grid-cols-3 unpin:lg:gap-6">
        {stages.map((stage, i) => (
          <Stage
            key={stage.label}
            index={i}
            total={stages.length}
            label={stage.label}
            body={stage.body}
            photo={PHOTOS[i]}
            alt={stage.photo}
          />
        ))}
      </ol>
      {still ? null : <Ticks total={stages.length} progress={progress} />}
    </Container>
  )
}

function ProofTitle({ id }: { id: string }) {
  const { t } = useTranslation("home")
  const { progress, still } = useScene()
  const strike = useTransform(progress, [0.3, 0.4], [0, 1])
  const reveal = useTransform(progress, [0.63, 0.73], [0, 1])
  const rise = useTransform(progress, [0.63, 0.73], ["0.5em", "0em"])

  return (
    <h2
      id={id}
      className="pin:mt-5 pin:max-w-none pin:text-5xl pin:xl:text-6xl mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
    >
      {t("proof.title")}{" "}
      <span className="relative inline-block">
        {t("proof.claims")}
        {still ? null : (
          <m.span
            aria-hidden
            style={{ scaleX: strike }}
            className="unpin:hidden absolute inset-x-0 top-1/2 h-1 bg-foreground ltr:origin-left rtl:origin-right"
          />
        )}
      </span>{" "}
      <m.span
        style={still ? undefined : { opacity: reveal, y: rise }}
        className="unpin:opacity-100! unpin:transform-none! block text-brand-text"
      >
        {t("proof.interview")} {t("proof.shows")}
      </m.span>
    </h2>
  )
}

function Stage({
  index,
  total,
  label,
  body,
  photo,
  alt,
}: {
  index: number
  total: number
  label: string
  body: string
  photo: PhotoName | undefined
  alt: string
}) {
  const { progress, still } = useScene()
  const { input, output } = stageWindow(index, total)
  const opacity = useTransform(progress, input, output)
  const y = useTransform(opacity, [0, 1], ["1rem", "0rem"])
  const scale = useTransform(
    progress,
    [index / total, (index + 1) / total],
    [1.08, 1]
  )

  return (
    <li className="pin:contents unpin:reveal unpin:sm:grid unpin:sm:grid-cols-2 unpin:sm:items-center unpin:sm:gap-6 unpin:lg:block">
      {photo ? (
        <m.div
          style={still ? undefined : { opacity }}
          className="pin:col-span-5 pin:col-start-5 pin:row-span-full pin:self-center pin:rounded-3xl unpin:opacity-100! overflow-hidden rounded-2xl border bg-muted"
        >
          <m.div
            style={still ? undefined : { scale }}
            className="unpin:transform-none!"
          >
            <Photo
              name={photo}
              alt={alt}
              sizes="(min-width: 64rem) 40rem, (min-width: 40rem) 50vw, 100vw"
              className="aspect-4/3"
            />
          </m.div>
        </m.div>
      ) : null}
      <m.div
        style={still ? undefined : { opacity, y }}
        className="pin:col-span-4 pin:col-start-1 pin:row-start-3 pin:mt-10 pin:max-w-md unpin:opacity-100! unpin:transform-none! unpin:mt-4 unpin:sm:mt-0 unpin:lg:mt-4"
      >
        <p className="text-sm font-semibold tabular-nums">
          <span className="text-brand-text">{`0${index + 1}`}</span>
          <span className="text-muted-foreground"> · </span>
          {label}
        </p>
        <p className="pin:text-lg pin:text-foreground mt-2 text-pretty text-muted-foreground">
          {body}
        </p>
      </m.div>
    </li>
  )
}

function Ticks({
  total,
  progress,
}: {
  total: number
  progress: MotionValue<number>
}) {
  return (
    <div
      aria-hidden
      className="pin:col-span-4 pin:col-start-1 pin:row-start-4 unpin:hidden mt-10 flex w-40 gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <Tick key={i} index={i} total={total} progress={progress} />
      ))}
    </div>
  )
}

function Tick({
  index,
  total,
  progress,
}: {
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const scaleX = useTransform(
    progress,
    [index / total, (index + 1) / total],
    [0, 1]
  )

  return (
    <span className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/15">
      <m.span
        style={{ scaleX }}
        className="block h-full bg-brand ltr:origin-left rtl:origin-right"
      />
    </span>
  )
}
