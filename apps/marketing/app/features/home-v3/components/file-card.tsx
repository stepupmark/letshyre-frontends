import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { CheckIcon, LockIcon, LockOpenIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar } from "@/components/art/avatar"
import { ScoreRing } from "@/components/art/score-ring"

import { useScene } from "./scene-context"

// each layer arrives in its own slice of the scene, then the file unlocks
const ARRIVALS = [0.05, 0.18, 0.31, 0.44]
const UNLOCK = [0.66, 0.74]

export function FileCard() {
  const { t } = useTranslation("homeV3")
  const { progress } = useScene()

  return (
    <figure
      aria-label={t("file.label")}
      className="mx-auto grid w-full max-w-md gap-3"
    >
      <Layer progress={progress} at={ARRIVALS[0]} from={-1}>
        <div className="flex items-center gap-3">
          <Avatar name={t("file.name")} className="size-11 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{t("file.name")}</p>
            <p className="truncate text-sm text-muted-foreground">
              {t("file.role")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-end text-xs text-muted-foreground max-sm:hidden">
              {t("file.score")}
            </span>
            <ScoreRing
              score={Number(t("file.scoreValue"))}
              caption={t("file.outOf")}
              compact
            />
          </div>
        </div>
      </Layer>
      <Layer progress={progress} at={ARRIVALS[1]} from={1}>
        <ul className="grid gap-3">
          {t("file.layers", { returnObjects: true }).map((layer) => (
            <Meter key={layer.label} {...layer} progress={progress} />
          ))}
        </ul>
      </Layer>
      <Layer progress={progress} at={ARRIVALS[2]} from={-1}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Chips
            title={t("file.strengths")}
            items={t("file.strengthItems", { returnObjects: true })}
            tone="good"
          />
          <Chips
            title={t("file.gaps")}
            items={t("file.gapItems", { returnObjects: true })}
            tone="probe"
          />
        </div>
      </Layer>
      <Layer progress={progress} at={ARRIVALS[3]} from={1}>
        <Locked progress={progress} />
      </Layer>
    </figure>
  )
}

function Layer({
  progress,
  at,
  from,
  children,
}: {
  progress: MotionValue<number>
  at: number | undefined
  from: 1 | -1
  children: ReactNode
}) {
  const start = at ?? 0
  const opacity = useTransform(progress, [start, start + 0.08], [0, 1])
  const x = useTransform(
    progress,
    [start, start + 0.12],
    [`${from * 3}rem`, "0rem"]
  )
  const rotate = useTransform(progress, [start, start + 0.12], [from * 2, 0])

  return (
    <m.div
      style={{ opacity, x, rotate }}
      className="rounded-2xl border bg-card p-4"
    >
      {children}
    </m.div>
  )
}

function Meter({
  label,
  value,
  suffix,
  progress,
}: {
  label: string
  value: number
  suffix: string
  progress: MotionValue<number>
}) {
  const fill = useTransform(progress, [0.2, 0.4], [0, value / 100])

  return (
    <li>
      <p className="flex justify-between text-sm">
        {label}
        <span className="font-semibold tabular-nums">
          {value}
          <span className="font-normal text-muted-foreground">{suffix}</span>
        </span>
      </p>
      <span
        aria-hidden
        className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <m.span
          style={{ scaleX: fill }}
          className="block h-full rounded-full bg-brand ltr:origin-left rtl:origin-right"
        />
      </span>
    </li>
  )
}

function Chips({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: "good" | "probe"
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={
              tone === "good"
                ? "rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                : "rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Locked({ progress }: { progress: MotionValue<number> }) {
  const { t } = useTranslation("homeV3")
  const open = useTransform(progress, UNLOCK, [0, 1])
  const shut = useTransform(open, [0, 1], [1, 0])
  const dim = useTransform(open, [0, 1], [0.55, 1])

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{t("file.included")}</p>
        <span className="grid text-xs font-medium">
          <m.span
            style={{ opacity: shut }}
            className="col-start-1 row-start-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground"
          >
            <LockIcon aria-hidden className="size-3" />
            {t("file.unlock")}
          </m.span>
          <m.span
            style={{ opacity: open }}
            className="col-start-1 row-start-1 inline-flex items-center gap-1 justify-self-end rounded-full bg-brand-muted px-2 py-0.5 text-brand-text"
          >
            <LockOpenIcon aria-hidden className="size-3" />
            {t("file.unlocked")}
          </m.span>
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {t("file.lockedItems", { returnObjects: true }).map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <span className="grid size-4 shrink-0 text-muted-foreground">
              <m.span
                style={{ opacity: shut }}
                className="col-start-1 row-start-1"
              >
                <LockIcon aria-hidden className="size-4" />
              </m.span>
              <m.span
                style={{ opacity: open }}
                className="col-start-1 row-start-1 text-success"
              >
                <CheckIcon aria-hidden className="size-4" />
              </m.span>
            </span>
            <m.span style={{ opacity: dim }}>{item}</m.span>
          </li>
        ))}
      </ul>
    </div>
  )
}
