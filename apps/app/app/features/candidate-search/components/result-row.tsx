import { useLocale, useTranslation } from "@workspace/i18n/react"
import { BriefcaseBusiness, ChevronRight, MapPin } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import type { KeyboardEvent } from "react"

import { StatusBadge } from "@/components/status-badge"
import { spring } from "@/lib/motion"
import { relativeTime } from "@/lib/relative-time"

import { nameOf, rowKey, tidyPlace, yearsOf } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { Highlight, PersonAvatar } from "./person"

const SKILLS_SHOWN = 3

export function ResultRow({
  row,
  search,
  open,
  viewed,
  onOpen,
  onKeyDown,
}: {
  row: SearchResult
  search: string
  open: boolean
  viewed: boolean
  onOpen: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  const { t } = useTranslation("candidateSearch")
  const locale = useLocale()
  const name = nameOf(row, t("card.unnamed"))
  const role = row.interviewed_role ?? row.current_role
  const place = tidyPlace(row.candidate_location)
  const years = yearsOf(row.total_experience_years)
  const skills = row.skills_preview ?? []
  const interviews = row.completed_interviews_count ?? 0
  const activity = [
    interviews > 0 ? t("card.interviews", { count: interviews }) : null,
    row.last_interview_date
      ? t("card.lastInterview", {
          when: relativeTime(row.last_interview_date, locale),
        })
      : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <button
      type="button"
      data-row={rowKey(row)}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className="group flex min-h-11 w-full cursor-pointer items-center gap-4 rounded-xl border bg-card px-4 py-3 text-start transition-colors outline-none hover:border-foreground/20 hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-expanded:border-brand/40 aria-expanded:bg-brand-muted/30 motion-reduce:transition-none sm:px-5"
    >
      <PersonAvatar
        row={row}
        name={name}
        className="size-14 self-start ring-1 ring-border"
      />

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-base font-semibold tracking-tight decoration-foreground/30 underline-offset-4 group-hover:underline">
            {name}
          </span>
          {row.already_unlocked && (
            <span className="shrink-0 self-center sm:hidden">
              <StatusBadge tone="success">{t("card.unlocked")}</StatusBadge>
            </span>
          )}
          <AnimatePresence initial={false}>
            {viewed && !open && (
              <m.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {t("card.viewed")}
              </m.span>
            )}
          </AnimatePresence>
        </span>

        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {role && (
            <span className="min-w-0 truncate text-foreground/80">
              <Highlight text={role} term={search} />
            </span>
          )}
          {place && (
            <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{place}</span>
            </span>
          )}
          {years !== null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <BriefcaseBusiness
                aria-hidden="true"
                className="size-3.5 shrink-0"
              />
              {years === "under"
                ? t("card.underYear")
                : t("card.years", { count: years })}
            </span>
          )}
        </span>

        {activity && (
          <span className="text-xs text-muted-foreground tabular-nums sm:hidden">
            {activity}
          </span>
        )}

        {skills.length > 0 && (
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            {skills.slice(0, SKILLS_SHOWN).map((skill) => (
              <span
                key={skill}
                className="max-w-40 truncate rounded-md bg-muted px-2 py-0.5 text-xs text-foreground/80 max-sm:nth-3:hidden"
              >
                {skill}
              </span>
            ))}
            {skills.length > SKILLS_SHOWN && (
              <span className="px-1 text-xs text-muted-foreground tabular-nums max-sm:hidden">
                {t("card.moreSkills", { n: skills.length - SKILLS_SHOWN })}
              </span>
            )}
          </span>
        )}
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1.5 text-end max-sm:hidden">
        <AnimatePresence initial={false}>
          {row.already_unlocked && (
            <m.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
            >
              <StatusBadge tone="success">{t("card.unlocked")}</StatusBadge>
            </m.span>
          )}
        </AnimatePresence>
        {activity && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {activity}
          </span>
        )}
      </span>

      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground group-focus-visible:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 rtl:group-focus-visible:-translate-x-0.5"
      />
    </button>
  )
}
