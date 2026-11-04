import { useTranslation } from "@workspace/i18n/react"
import { useTransform } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"

import { Container } from "@/components/section"

import { Photo, type PhotoName } from "./photo"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"
import { stageWindow } from "./stage-window"

const PHOTOS: PhotoName[] = [
  "home-v3/resume-pile",
  "home-v3/live-interview",
  "home-v3/team-review",
]

export function Proof() {
  const titleId = useId()

  return (
    <ScrollScene screens={3.5} aria-labelledby={titleId}>
      <ProofStage titleId={titleId} />
    </ScrollScene>
  )
}

function useStages() {
  const { t } = useTranslation("homeV3")
  return t("proof.stages", { returnObjects: true })
}

function ProofStage({ titleId }: { titleId: string }) {
  const { t } = useTranslation("homeV3")
  const { still } = useScene()
  const stages = useStages()

  if (still) return <StillProof titleId={titleId} />

  return (
    <div className="relative grid h-full place-items-center">
      {stages.map((stage, i) => (
        <Backdrop
          key={stage.label}
          index={i}
          total={stages.length}
          name={PHOTOS[i]}
          alt={stage.photo}
        />
      ))}
      <div aria-hidden className="absolute inset-0 bg-background/80" />
      <Container className="relative pt-16 text-center">
        <p className="text-sm font-semibold text-brand-text">
          {t("proof.eyebrow")}
        </p>
        <ProofTitle id={titleId} />
        <div className="mx-auto mt-10 grid max-w-xl">
          {stages.map((stage, i) => (
            <Caption
              key={stage.label}
              index={i}
              total={stages.length}
              label={stage.label}
              body={stage.body}
            />
          ))}
        </div>
        <Ticks total={stages.length} />
      </Container>
    </div>
  )
}

function ProofTitle({ id }: { id: string }) {
  const { t } = useTranslation("homeV3")
  const { progress } = useScene()
  const strike = useTransform(progress, [0.3, 0.4], [0, 1])
  const reveal = useTransform(progress, [0.63, 0.73], [0, 1])
  const rise = useTransform(progress, [0.63, 0.73], ["0.5em", "0em"])

  return (
    <h2
      id={id}
      className="mx-auto mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
    >
      {t("proof.title")}{" "}
      <span className="relative inline-block">
        {t("proof.claims")}
        <m.span
          aria-hidden
          style={{ scaleX: strike }}
          className="absolute inset-x-0 top-1/2 h-1 bg-foreground ltr:origin-left rtl:origin-right"
        />
      </span>{" "}
      <m.span
        style={{ opacity: reveal, y: rise }}
        className="block text-brand-text"
      >
        {t("proof.interview")} {t("proof.shows")}
      </m.span>
    </h2>
  )
}

function Backdrop({
  index,
  total,
  name,
  alt,
}: {
  index: number
  total: number
  name: PhotoName | undefined
  alt: string
}) {
  const { progress } = useScene()
  const { input, output } = stageWindow(index, total)
  const opacity = useTransform(progress, input, output)
  const scale = useTransform(
    progress,
    [index / total, (index + 1) / total],
    [1.08, 1]
  )

  if (!name) return null

  return (
    <m.div style={{ opacity, scale }} className="absolute inset-0">
      <Photo name={name} alt={alt} sizes="100vw" className="size-full" />
    </m.div>
  )
}

function Caption({
  index,
  total,
  label,
  body,
}: {
  index: number
  total: number
  label: string
  body: string
}) {
  const { progress } = useScene()
  const { input, output } = stageWindow(index, total)
  const opacity = useTransform(progress, input, output)
  const y = useTransform(opacity, [0, 1], ["1rem", "0rem"])

  return (
    <m.div style={{ opacity, y }} className="col-start-1 row-start-1">
      <p className="text-sm font-semibold tabular-nums">
        <span className="text-brand-text">{`0${index + 1}`}</span>
        <span className="text-muted-foreground"> · </span>
        {label}
      </p>
      <p className="mt-2 text-lg text-pretty">{body}</p>
    </m.div>
  )
}

function Ticks({ total }: { total: number }) {
  const { progress } = useScene()

  return (
    <div aria-hidden className="mx-auto mt-10 flex w-40 gap-2">
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
  progress: ReturnType<typeof useScene>["progress"]
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

function StillProof({ titleId }: { titleId: string }) {
  const { t } = useTranslation("homeV3")
  const stages = useStages()

  return (
    <Container className="py-16 sm:py-24">
      <p className="text-sm font-semibold text-brand-text">
        {t("proof.eyebrow")}
      </p>
      <h2
        id={titleId}
        className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
      >
        {t("proof.title")} {t("proof.claims")}{" "}
        <span className="block text-brand-text">
          {t("proof.interview")} {t("proof.shows")}
        </span>
      </h2>
      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {stages.map((stage, i) => (
          <li key={stage.label}>
            {PHOTOS[i] ? (
              <Photo
                name={PHOTOS[i]}
                alt={stage.photo}
                sizes="(min-width: 48rem) 33vw, 100vw"
                className="aspect-3/2 rounded-2xl border"
              />
            ) : null}
            <p className="mt-4 text-sm font-semibold">{stage.label}</p>
            <p className="mt-1 text-pretty text-muted-foreground">
              {stage.body}
            </p>
          </li>
        ))}
      </ol>
    </Container>
  )
}
