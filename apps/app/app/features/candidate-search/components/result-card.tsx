import { safeUrl } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  BriefcaseBusiness,
  GraduationCap,
  LockOpen,
  MapPin,
} from "lucide-react"
import * as m from "motion/react-m"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { ScoreBand } from "@/components/score-band"
import { StatusBadge } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"
import { relativeTime } from "@/lib/relative-time"

import { initials, splitMatch, yearsOf } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"

const SKILLS_SHOWN = 3

export function ResultCard({
  row,
  search,
  onUnlock,
}: {
  row: SearchResult
  search: string
  onUnlock: () => void
}) {
  const { t } = useTranslation("candidateSearch")
  const locale = useLocale()
  const name = row.candidate_name?.trim()
    ? row.candidate_name.trim()
    : t("card.unnamed")
  const photo = safeUrl(row.candidate_profile_photo)
  const role = row.interviewed_role ?? row.current_role
  const years = yearsOf(row.total_experience_years)
  const degree = row.candidate_education?.[0]
  const skills = row.skills_preview ?? []
  const interviews = row.completed_interviews_count ?? 0
  const score = row.interview_score

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-brand/30 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <Avatar className="size-12">
            {photo && <AvatarImage src={photo} alt="" />}
            <AvatarFallback className="bg-brand-muted text-sm font-semibold text-brand-text">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate text-base font-semibold text-brand-text">
              {name}
            </h3>
            {role && (
              <p className="text-sm text-pretty">
                <Highlight text={role} term={search} />
              </p>
            )}
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {row.candidate_location && (
                <li className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {row.candidate_location}
                </li>
              )}
              {years !== null && (
                <li className="flex items-center gap-1.5 tabular-nums">
                  <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
                  {years === "under"
                    ? t("card.underYear")
                    : t("card.years", { count: years })}
                </li>
              )}
              {degree?.degree && (
                <li className="flex min-w-0 items-center gap-1.5">
                  <GraduationCap
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {[degree.degree, degree.institution]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <UnlockAction
          row={row}
          name={name}
          interviews={interviews}
          onUnlock={onUnlock}
        />
      </div>

      <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        {skills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {skills.slice(0, SKILLS_SHOWN).map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
              >
                {skill}
              </li>
            ))}
            {skills.length > SKILLS_SHOWN && (
              <li className="px-1 py-0.5 text-xs text-muted-foreground tabular-nums">
                {t("card.moreSkills", { count: skills.length - SKILLS_SHOWN })}
              </li>
            )}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:ms-auto">
          {score != null && (
            <span className="flex items-center gap-2">
              <ScoreBand score={score} of="interview" />
              <span
                aria-hidden="true"
                className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
              >
                <m.span
                  className="block h-full origin-left rounded-full bg-brand rtl:origin-right"
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: duration.slow, ease, delay: 0.1 }}
                />
              </span>
            </span>
          )}
          {interviews > 0 && (
            <span className="tabular-nums">
              {t("card.interviews", { count: interviews })}
              {row.last_interview_date &&
                ` · ${t("card.lastInterview", {
                  when: relativeTime(row.last_interview_date, locale),
                })}`}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function Highlight({ text, term }: { text: string; term: string }) {
  const parts = splitMatch(text, term)
  if (!parts) return text
  return (
    <>
      {parts.before}
      <mark className="rounded-sm bg-brand-muted px-0.5 font-medium text-brand-text">
        {parts.match}
      </mark>
      {parts.after}
    </>
  )
}

function UnlockAction({
  row,
  name,
  interviews,
  onUnlock,
}: {
  row: SearchResult
  name: string
  interviews: number
  onUnlock: () => void
}) {
  const { t } = useTranslation("candidateSearch")

  if (!row.already_unlocked)
    return (
      <Button
        className="shrink-0 max-sm:h-11 max-sm:w-full"
        aria-label={t("card.unlockFor", { name })}
        onClick={onUnlock}
      >
        <LockOpen aria-hidden="true" />
        {t("card.unlock")}
      </Button>
    )

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
      <StatusBadge tone="success">{t("card.unlocked")}</StatusBadge>
      <div className="flex flex-wrap gap-2">
        {interviews > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="max-sm:h-11"
            aria-label={t("card.otherInterviewsFor", { name })}
            onClick={onUnlock}
          >
            {t("card.otherInterviews")}
          </Button>
        )}
        <AppLink
          to={href("/employer/candidates/unlocked")}
          className={buttonLink({
            variant: "outline",
            size: "sm",
            className: "max-sm:h-11",
          })}
        >
          {t("card.viewUnlocked")}
        </AppLink>
      </div>
    </div>
  )
}
