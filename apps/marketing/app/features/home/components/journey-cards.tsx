import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { FileTextIcon, LockIcon, LockOpenIcon, PhoneIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar } from "@/components/art/avatar"
import { ScoreRing } from "@/components/art/score-ring"

import { Tilt } from "./pointer-effects"

export default function JourneyCard({
  index,
  className,
}: {
  index: number
  className?: string
}) {
  const cards = [JobCard, ShortlistCard, InsightsCard, UnlockCard]
  const Card = cards[index]
  return Card ? <Card className={className} /> : null
}

function Frame({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <Tilt className={cn("max-w-sm", className)}>
      <div
        role="img"
        aria-label={label}
        className="rounded-2xl border bg-background p-4"
      >
        {children}
      </div>
    </Tilt>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <FileTextIcon className="size-3.5" />
      {children}
    </p>
  )
}

function JobCard({ className }: { className?: string }) {
  const { t } = useTranslation("home")

  return (
    <Frame label={t("journey.cards.job.label")} className={className}>
      <Kicker>{t("journey.cards.job.kicker")}</Kicker>
      <p className="mt-1 text-sm font-semibold">
        {t("journey.cards.job.title")}
      </p>
      <p className="mt-3 text-xs font-medium text-brand-text">
        {t("journey.cards.job.found")}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {t("journey.cards.job.chips", { returnObjects: true }).map((chip) => (
          <li
            key={chip}
            className="rounded-md bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text"
          >
            {chip}
          </li>
        ))}
      </ul>
    </Frame>
  )
}

function ShortlistCard({ className }: { className?: string }) {
  const { t } = useTranslation("home")
  const people = t("journey.cards.shortlist.people", { returnObjects: true })

  return (
    <Frame label={t("journey.cards.shortlist.label")} className={className}>
      <p className="flex justify-between text-xs text-muted-foreground">
        {t("journey.cards.shortlist.title")}
        <span>{t("journey.cards.shortlist.match")}</span>
      </p>
      <ol className="mt-3 divide-y">
        {people.map((person) => (
          <li key={person.name} className="flex items-center gap-3 py-2">
            <Avatar name={person.name} className="size-8 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {person.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {person.role}
              </span>
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {person.score}
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

function InsightsCard({ className }: { className?: string }) {
  const { t } = useTranslation("home")
  const rows = t("journey.cards.insights.rows", { returnObjects: true })

  return (
    <Frame label={t("journey.cards.insights.label")} className={className}>
      <div className="flex items-center gap-3">
        <ScoreRing
          score={Number(t("journey.cards.insights.score"))}
          caption={t("journey.cards.insights.outOf")}
          compact
        />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {t("journey.cards.insights.kicker")}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">
            {t("journey.cards.unlock.name")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {t("journey.cards.unlock.role")}
          </p>
        </div>
      </div>
      <ul className="mt-3 grid gap-2 border-t pt-3">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 text-xs">
            <span className="w-28 shrink-0 truncate text-muted-foreground">
              {row.label}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                style={{ width: `${row.score}%` }}
                className="block h-full rounded-full bg-brand"
              />
            </span>
            <span className="w-6 text-end font-medium tabular-nums">
              {row.score}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
        <LockIcon className="size-3.5" />
        {t("journey.cards.insights.locked")}
      </p>
    </Frame>
  )
}

function UnlockCard({ className }: { className?: string }) {
  const { t } = useTranslation("home")

  return (
    <Frame label={t("journey.cards.unlock.label")} className={className}>
      <div className="flex items-center gap-3">
        <Avatar
          name={t("journey.cards.unlock.name")}
          className="size-9 text-xs"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {t("journey.cards.unlock.name")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {t("journey.cards.unlock.role")}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text">
          <LockOpenIcon className="size-3" />
          {t("journey.cards.unlock.unlocked")}
        </span>
      </div>
      <p className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-sm">
        <span className="flex items-center gap-2 tabular-nums">
          <PhoneIcon className="size-4 text-muted-foreground" />
          {t("journey.cards.unlock.phone")}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t("journey.cards.unlock.credit")}
        </span>
      </p>
    </Frame>
  )
}
