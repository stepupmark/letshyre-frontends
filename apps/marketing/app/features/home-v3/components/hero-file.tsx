import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { BadgeCheckIcon, PlayIcon } from "lucide-react"

import { ScoreRing } from "@/components/art/score-ring"

const QUESTIONS = 8

/** Vyshnavi's file; `slot` leaves room at the top for the photo to land in. */
export function HeroFile({
  progress,
  slot,
}: {
  progress: MotionValue<number>
  slot?: boolean
}) {
  const { t } = useTranslation("homeV3")
  const reveal = useTransform(progress, [0.45, 0.65], [0, 1])
  const rise = useTransform(reveal, [0, 1], ["1rem", "0rem"])
  const fill = useTransform(progress, [0.55, 0.85], [0, 1])

  return (
    <div
      role="img"
      aria-label={t("hero.file.label")}
      className={cn(
        "flex flex-col gap-5 rounded-3xl border bg-card p-5",
        slot && "absolute inset-0"
      )}
    >
      <m.div style={{ opacity: reveal }} className="flex items-start gap-4">
        {slot ? <span className="h-20 w-16 shrink-0" /> : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{t("file.name")}</p>
          <p className="truncate text-sm text-muted-foreground">
            {t("file.role")}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <BadgeCheckIcon className="size-3.5" />
            {t("hero.file.verified")}
          </p>
        </div>
        <ScoreRing
          score={Number(t("file.scoreValue"))}
          caption={t("file.outOf")}
          compact
        />
      </m.div>
      <m.ul style={{ opacity: reveal, y: rise }} className="grid gap-3">
        {t("file.layers", { returnObjects: true }).map((layer) => (
          <Meter key={layer.label} {...layer} fill={fill} />
        ))}
      </m.ul>
      <m.div
        style={{ opacity: reveal, y: rise }}
        className="grid grid-cols-2 gap-4 border-t pt-4 max-lg:hidden"
      >
        <Tags
          title={t("file.strengths")}
          items={t("file.strengthItems", { returnObjects: true })}
          good
        />
        <Tags
          title={t("file.gaps")}
          items={t("file.gapItems", { returnObjects: true })}
        />
      </m.div>
      <m.div
        style={{ opacity: reveal, y: rise }}
        className="mt-auto rounded-2xl border bg-background p-4"
      >
        <p className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
              <PlayIcon className="size-3.5" />
            </span>
            {t("hero.file.recording")}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {t("hero.file.duration")}
          </span>
        </p>
        <span className="mt-3 flex gap-1">
          {Array.from({ length: QUESTIONS }, (_, i) => (
            <span key={i} className="h-1.5 flex-1 rounded-full bg-brand/70" />
          ))}
        </span>
        <p className="mt-3 text-xs font-medium text-success">
          {t("hero.file.verdict")}
        </p>
      </m.div>
    </div>
  )
}

function Meter({
  label,
  value,
  suffix,
  fill,
}: {
  label: string
  value: number
  suffix: string
  fill: MotionValue<number>
}) {
  const scaleX = useTransform(fill, [0, 1], [0, value / 100])

  return (
    <li>
      <p className="flex justify-between text-sm">
        {label}
        <span className="font-semibold tabular-nums">
          {value}
          <span className="font-normal text-muted-foreground">{suffix}</span>
        </span>
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
