import { useTranslation } from "@workspace/i18n/react"
import { Check, Minus, Sparkles } from "lucide-react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { ScoreBand } from "@/components/score-band"
import { duration, ease } from "@/lib/motion"

import { bestInterview, matchScore } from "../lib/job-matches"
import type { Match } from "../schemas/job-matches.schema"
import { MatchMeter } from "./match-meter"

export function MatchPeek({
  match,
  actions,
}: {
  match: Match
  actions: (match: Match) => ReactNode
}) {
  const { t } = useTranslation("matches")
  const ai = match.ai_match
  const years = ai?.years_experience
  const taken = match.interview_attempts?.length ?? 0
  const best = bestInterview(match)
  const facts = [
    years != null && t("peek.experience", { count: Math.round(years) }),
    taken > 0 && t("peek.taken", { n: taken }),
  ].filter(Boolean)

  return (
    <m.div
      key={match.candidate_id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
      className="flex flex-col gap-6"
    >
      <section className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ScoreBand score={matchScore(match)} />
          {best != null && <ScoreBand score={best} of="interview" />}
        </div>
        <MatchMeter score={matchScore(match)} className="h-2" />
        {facts.length > 0 && (
          <p className="text-sm text-muted-foreground tabular-nums">
            {facts.join(" · ")}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <Sparkles aria-hidden="true" className="size-4 text-brand-text" />
          {t("peek.why")}
        </h3>
        <p className="rounded-lg bg-muted px-3 py-2.5 text-pretty">
          {ai?.rationale ?? t("peek.noReason")}
        </p>
        <p className="text-xs text-pretty text-muted-foreground">
          {t("peek.whyNote")}
        </p>
      </section>

      {actions(match)}

      {(ai?.role_match_score != null || ai?.skills_match_score != null) && (
        <section className="flex flex-col gap-3">
          <Fit score={ai.role_match_score} label={t("peek.role")} />
          <Fit score={ai.skills_match_score} label={t("peek.skills")} />
        </section>
      )}

      {Boolean(ai?.matched_skills?.length) ||
      Boolean(ai?.missing_skills?.length) ? (
        <section className="grid gap-5 sm:grid-cols-2">
          <Skills title={t("peek.has")} skills={ai?.matched_skills} has />
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

function Fit({
  score,
  label,
}: {
  score: number | null | undefined
  label: string
}) {
  if (score == null) return null
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">{label}</span>
        <ScoreBand score={score} />
      </div>
      <MatchMeter score={score} />
    </div>
  )
}

function Skills({
  title,
  skills,
  none,
  has = false,
}: {
  title: string
  skills: string[] | null | undefined
  none?: string
  has?: boolean
}) {
  const Icon = has ? Check : Minus
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      {skills?.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill, i) => (
            <m.li
              key={skill}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: duration.base, ease, delay: i * 0.03 }}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
            >
              <Icon
                aria-hidden="true"
                data-has={has}
                className="size-3 text-muted-foreground data-[has=true]:text-success"
              />
              {skill}
            </m.li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{none ?? "—"}</p>
      )}
    </div>
  )
}
