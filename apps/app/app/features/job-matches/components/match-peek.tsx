import { useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { ScoreBand } from "@/components/score-band"
import { duration, ease } from "@/lib/motion"

import { matchScore } from "../lib/job-matches"
import type { Match } from "../schemas/job-matches.schema"

export function MatchPeek({
  match,
  actions,
}: {
  match: Match
  actions?: (match: Match) => ReactNode
}) {
  const { t } = useTranslation("matches")
  const ai = match.ai_match
  const years = ai?.years_experience

  return (
    <m.div
      key={match.candidate_id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <ScoreBand score={matchScore(match)} />
        {years != null && (
          <span className="text-muted-foreground tabular-nums">
            {t("peek.experience", { count: Math.round(years) })}
          </span>
        )}
      </div>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-semibold">{t("peek.why")}</h3>
        <p className="text-pretty">{ai?.rationale ?? t("peek.noReason")}</p>
        <p className="text-xs text-pretty text-muted-foreground">
          {t("peek.whyNote")}
        </p>
      </section>

      {actions ? actions(match) : <Interviews match={match} />}

      {(ai?.role_match_score != null || ai?.skills_match_score != null) && (
        <section className="flex flex-col gap-3">
          <Fit score={ai.role_match_score} label={t("peek.role")} />
          <Fit score={ai.skills_match_score} label={t("peek.skills")} />
        </section>
      )}

      {Boolean(ai?.matched_skills?.length) ||
      Boolean(ai?.missing_skills?.length) ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <Skills title={t("peek.has")} skills={ai?.matched_skills} />
          <Skills
            title={t("peek.missing")}
            skills={ai?.missing_skills}
            none={t("peek.noneMissing")}
          />
        </section>
      ) : null}
    </m.div>
  )
}

function Interviews({ match }: { match: Match }) {
  const { t } = useTranslation("matches")
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t("peek.interviews")}</h3>
      {match.interview_attempts?.length ? (
        <ul className="flex flex-col divide-y rounded-lg border">
          {match.interview_attempts.map((attempt, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <span className="min-w-0 truncate">{attempt.role}</span>
              {attempt.overall_score != null && (
                <ScoreBand score={attempt.overall_score} of="interview" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{t("peek.noInterviews")}</p>
      )}
    </section>
  )
}

function Fit({
  score,
  label,
}: {
  score: number | null | undefined
  label: string
}) {
  if (score == null) return null
  const width = Math.min(100, Math.max(0, score))
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">{label}</span>
        <ScoreBand score={score} />
      </div>
      <span
        aria-hidden="true"
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <span className="block h-full" style={{ width: `${width}%` }}>
          <m.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration.slow, ease }}
            className="block h-full origin-left rounded-full bg-brand rtl:origin-right"
          />
        </span>
      </span>
    </div>
  )
}

function Skills({
  title,
  skills,
  none,
}: {
  title: string
  skills: string[] | null | undefined
  none?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      {skills?.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill}>
              <Badge variant="secondary">{skill}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{none ?? "—"}</p>
      )}
    </div>
  )
}
