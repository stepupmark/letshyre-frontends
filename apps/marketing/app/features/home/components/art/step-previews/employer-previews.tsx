import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowDownIcon,
  CheckIcon,
  FileTextIcon,
  LockIcon,
  LockOpenIcon,
  MailIcon,
  PhoneIcon,
  SparklesIcon,
} from "lucide-react"

import { Avatar } from "@/components/art/avatar"
import { wait } from "@/components/art/delay"
import { Meter } from "@/components/art/meter"
import { ScoreRing } from "@/components/art/score-ring"

const RANKED = [
  { match: 92, pool: false },
  { match: 88, pool: false },
  { match: 85, pool: true },
]
const REVIEW = [
  { score: 86, match: 92, interview: 84 },
  { score: 79, match: 88, interview: 71 },
]

export function PostPreview() {
  const { t } = useTranslation("home")
  const chips = t("how.preview.employers.post.chips", { returnObjects: true })

  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="flex items-center gap-2 font-semibold">
        <FileTextIcon className="size-4 text-muted-foreground" />
        {t("how.preview.employers.post.title")}
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
        <span className="h-1.5 w-11/12 rounded-full bg-muted" />
        <span className="h-1.5 w-4/5 rounded-full bg-muted" />
        <span className="h-1.5 w-2/3 rounded-full bg-muted" />
      </div>
      <p className="mt-4 flex items-center gap-1.5 border-t pt-3 text-xs font-medium text-brand-text">
        <SparklesIcon className="size-3.5" />
        {t("how.preview.employers.post.found")}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {chips.map((chip, index) => (
          <li
            key={chip}
            className="pop rounded-full border border-brand/30 bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-text"
            style={wait(150 + index * 120)}
          >
            {chip}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RankedPreview() {
  const { t } = useTranslation("home")
  const people = t("how.preview.employers.ranked.people", {
    returnObjects: true,
  })

  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs text-muted-foreground">
        {t("how.preview.employers.ranked.summary")}
      </p>
      <ol className="mt-3 flex flex-col gap-3">
        {people.map((name, index) => {
          const row = RANKED[index] ?? { match: 0, pool: false }
          return (
            <li
              key={name}
              className="rise flex items-center gap-3 text-sm"
              style={wait(index * 120)}
            >
              <span className="w-3 text-xs text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <Avatar name={name} className="size-8 text-xs" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{name}</span>
                  {row.pool && (
                    <span className="shrink-0 rounded-full bg-brand-muted px-1.5 text-xs text-brand-text">
                      {t("how.preview.employers.ranked.pool")}
                    </span>
                  )}
                </span>
                <svg
                  viewBox="0 0 100 4"
                  preserveAspectRatio="none"
                  className="mt-1.5 block h-1.5 w-full rtl:-scale-x-100"
                >
                  <rect width="100" height="4" rx="2" className="fill-muted" />
                  <rect
                    width={row.match}
                    height="4"
                    rx="2"
                    className="bar-in fill-brand"
                  />
                </svg>
              </span>
              <span className="font-semibold tabular-nums">{`${row.match}%`}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function ReviewPreview() {
  const { t } = useTranslation("home")
  const people = t("how.preview.employers.review.people", {
    returnObjects: true,
  })

  return (
    <div className="grid grid-cols-2 gap-3">
      {people.map((name, index) => {
        const card = REVIEW[index] ?? { score: 0, match: 0, interview: 0 }
        return (
          <div
            key={name}
            className={cn(
              "rounded-xl border bg-background p-3",
              index === 0 && "border-brand/40"
            )}
          >
            <div className="flex items-center gap-2">
              <Avatar name={name} className="size-7 text-xs" />
              <p className="truncate text-sm font-semibold">{name}</p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <ScoreRing score={card.score} compact className="size-12" />
              <p className="text-xs text-muted-foreground">
                {t("how.preview.employers.review.score")}
              </p>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Meter
                label={t("how.preview.employers.review.match")}
                value={card.match}
                text={`${card.match}%`}
                animate
              />
              <Meter
                label={t("how.preview.employers.review.interview")}
                value={card.interview}
                animate
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function UnlockPreview() {
  const { t } = useTranslation("home")
  const name = t("how.preview.employers.unlock.name")

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-full items-center gap-3 rounded-xl border bg-background p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <LockIcon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block h-2.5 w-28 rounded-full bg-foreground/15" />
          <span className="mt-1.5 block text-xs text-muted-foreground">
            {t("how.preview.employers.unlock.locked")}
          </span>
        </span>
        <span className="font-semibold text-muted-foreground tabular-nums">
          {86}
        </span>
      </div>
      <ArrowDownIcon className="pop size-4 text-brand-text" style={wait(200)} />
      <div
        className="rise flex w-full items-start gap-3 rounded-xl border border-brand/30 bg-brand-muted/50 p-3"
        style={wait(350)}
      >
        <Avatar name={name} className="size-9 text-xs" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <LockOpenIcon className="size-3.5 text-brand-text" />
            {name}
            <span className="ms-auto tabular-nums">{86}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 text-xs">
            <span className="text-muted-foreground">
              {t("how.preview.employers.unlock.includes")}
            </span>
            <span className="font-semibold text-brand-text">
              {t("how.preview.employers.unlock.cost")}
            </span>
          </span>
        </span>
      </div>
    </div>
  )
}

export function HirePreview() {
  const { t } = useTranslation("home")
  const name = t("how.preview.employers.hire.name")

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} className="size-10" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-semibold">
            {name}
            <CheckIcon className="size-4 text-success" />
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {t("how.preview.employers.hire.role")}
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2 border-t pt-3 text-sm">
        <li className="rise flex items-center gap-2" style={wait(100)}>
          <MailIcon className="size-4 text-muted-foreground" />
          {t("how.preview.employers.hire.email")}
        </li>
        <li className="rise flex items-center gap-2" style={wait(200)}>
          <PhoneIcon className="size-4 text-muted-foreground" />
          <span dir="ltr">{t("how.preview.employers.hire.phone")}</span>
        </li>
      </ul>
      <span
        className="pop mt-4 inline-flex rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        style={wait(350)}
      >
        {t("how.preview.employers.hire.reach")}
      </span>
    </div>
  )
}
