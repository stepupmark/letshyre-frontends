import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"

import { ScoreRing } from "@/components/art/score-ring"
import { Container } from "@/components/section"

import { Photo } from "./photo"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"

// question, then each line of the answer, then the scorecard, in that order of the scroll
const ANSWER_FROM = 0.12
const LINE_GAP = 0.12
const SCORE_FROM = 0.55

export function Interview() {
  const titleId = useId()

  return (
    <ScrollScene screens={2} pinFrom="lg" aria-labelledby={titleId}>
      <Container className="grid gap-12 py-16 sm:py-24 lg:h-full lg:grid-cols-5 lg:items-center lg:gap-16 lg:py-0 lg:pt-16">
        <InterviewCopy titleId={titleId} />
        <Transcript />
      </Container>
    </ScrollScene>
  )
}

function InterviewCopy({ titleId }: { titleId: string }) {
  const { t } = useTranslation("homeV3")

  return (
    <div className="lg:col-span-2">
      <p className="text-sm font-semibold text-brand-text">
        {t("interview.eyebrow")}
      </p>
      <h2
        id={titleId}
        className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
      >
        {t("interview.title")}
      </h2>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground sm:text-lg">
        {t("interview.body")}
      </p>
    </div>
  )
}

function Transcript() {
  const { t } = useTranslation("homeV3")
  const { progress } = useScene()
  const answer = t("interview.answer", { returnObjects: true })

  return (
    <figure className="rounded-3xl border bg-card p-5 sm:p-6 lg:col-span-3">
      <div className="flex items-center gap-3 border-b pb-4">
        <Photo
          name="home-v3/candidate"
          alt=""
          sizes="2.5rem"
          portrait
          className="size-10 shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {t("interview.session")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("interview.progress")} · {t("interview.duration")}
          </p>
        </div>
      </div>
      <dl className="mt-5 grid gap-4">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            {t("interview.asked")}
          </dt>
          <dd className="mt-1 text-lg font-medium text-pretty">
            {t("interview.question")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            {t("interview.answered")}
          </dt>
          <dd className="mt-1 grid gap-2 text-pretty">
            {answer.map((line, i) => (
              <Line
                key={line}
                text={line}
                from={ANSWER_FROM + i * LINE_GAP}
                progress={progress}
              />
            ))}
          </dd>
        </div>
      </dl>
      <Scorecard progress={progress} />
      <figcaption className="mt-5 text-xs text-muted-foreground">
        {t("interview.sample")}
      </figcaption>
    </figure>
  )
}

function Line({
  text,
  from,
  progress,
}: {
  text: string
  from: number
  progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, [from, from + 0.08], [0, 1])
  const y = useTransform(opacity, [0, 1], ["0.5rem", "0rem"])

  return (
    <m.span style={{ opacity, y }} className="block">
      {text}
    </m.span>
  )
}

function Scorecard({ progress }: { progress: MotionValue<number> }) {
  const { t } = useTranslation("homeV3")
  const opacity = useTransform(progress, [SCORE_FROM, SCORE_FROM + 0.1], [0, 1])
  const fill = useTransform(progress, [SCORE_FROM + 0.05, 0.9], [0, 1])

  return (
    <m.section
      style={{ opacity }}
      aria-label={t("interview.scorecard")}
      className="mt-6 grid gap-5 rounded-2xl border bg-background p-4 sm:grid-cols-5"
    >
      <div className="flex items-center gap-3 sm:col-span-2 sm:flex-col sm:items-start">
        <ScoreRing
          score={Number(t("interview.score"))}
          caption={t("interview.outOf")}
          compact
        />
        <div>
          <p className="text-sm font-semibold">{t("interview.overall")}</p>
          <p className="mt-1 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            {t("interview.verdict")}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:col-span-3">
        <ul className="grid gap-3">
          {t("interview.skills", { returnObjects: true }).map((skill) => (
            <Skill key={skill.label} {...skill} fill={fill} />
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <Tags
            title={t("interview.strengths")}
            items={t("interview.strengthItems", { returnObjects: true })}
            good
          />
          <Tags
            title={t("interview.gaps")}
            items={t("interview.gapItems", { returnObjects: true })}
          />
        </div>
      </div>
    </m.section>
  )
}

function Skill({
  label,
  value,
  fill,
}: {
  label: string
  value: number
  fill: MotionValue<number>
}) {
  const scaleX = useTransform(fill, [0, 1], [0, value / 100])

  return (
    <li>
      <p className="flex justify-between gap-3 text-sm">
        {label}
        <span className="font-semibold tabular-nums">{value}</span>
      </p>
      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
        <m.span
          style={{ scaleX }}
          className="block h-full rounded-full bg-brand ltr:origin-left rtl:origin-right"
        />
      </span>
    </li>
  )
}

function Tags({
  title,
  items,
  good,
}: {
  title: string
  items: string[]
  good?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium",
              good ? "bg-success/10 text-success" : "bg-muted"
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
