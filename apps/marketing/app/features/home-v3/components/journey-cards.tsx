import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { FileTextIcon, LockOpenIcon, PhoneIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar } from "@/components/art/avatar"
import { ScoreRing } from "@/components/art/score-ring"

import { Tilt } from "./pointer-effects"

const QUESTIONS = 8
const CURRENT = 4

export default function JourneyCard({
  index,
  className,
}: {
  index: number
  className?: string
}) {
  const cards = [JobCard, ShortlistCard, ScorecardCard, UnlockCard]
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
  const { t } = useTranslation("homeV3")

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
  const { t } = useTranslation("homeV3")
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
                {person.pool ? ` · ${t("journey.cards.shortlist.pool")}` : null}
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

function ScorecardCard({ className }: { className?: string }) {
  const { t } = useTranslation("homeV3")

  return (
    <Frame label={t("journey.cards.scorecard.label")} className={className}>
      <div className="flex items-center gap-3">
        <ScoreRing
          score={Number(t("journey.cards.scorecard.score"))}
          caption={t("journey.cards.scorecard.outOf")}
          compact
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {t("journey.cards.scorecard.kicker")}
          </p>
          <p className="mt-1 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            {t("journey.cards.scorecard.verdict")}
          </p>
        </div>
      </div>
      <div className="mt-3 border-t pt-3">
        <p className="flex justify-between text-xs text-muted-foreground">
          {t("journey.cards.scorecard.question")}
          <span className="tabular-nums">
            {t("journey.cards.scorecard.duration")}
          </span>
        </p>
        <span className="mt-2 flex gap-1">
          {Array.from({ length: QUESTIONS }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < CURRENT
                  ? "bg-brand"
                  : i === CURRENT
                    ? "bg-brand/40"
                    : "bg-muted"
              )}
            />
          ))}
        </span>
      </div>
    </Frame>
  )
}

function UnlockCard({ className }: { className?: string }) {
  const { t } = useTranslation("homeV3")

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
