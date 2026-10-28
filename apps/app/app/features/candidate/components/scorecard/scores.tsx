import { useTranslation } from "@workspace/i18n/react"
import { MessageSquareQuote } from "lucide-react"
import * as m from "motion/react-m"

import { Meter } from "@/components/meter"
import { ScoreBand } from "@/components/score-band"
import { duration, ease } from "@/lib/motion"

import { scoredSections } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"
import { SubHeading } from "./sub-heading"

const METRICS = [
  ["clarity", "clarity"],
  ["relevance", "relevance"],
  ["confidence", "confidence"],
  ["depth_of_thought", "depth"],
  ["key_concept_coverage", "keyConcept"],
] as const

type Match = NonNullable<Scorecard["ai_match"]>

export function JobFit({ match }: { match: Match }) {
  const { t } = useTranslation("scorecard")

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="flex flex-col gap-4">
        {match.ai_matching_score !== null && (
          <ScoreBand score={match.ai_matching_score} />
        )}
        <ul className="flex flex-col gap-3">
          <Meter
            label={t("match.overall")}
            value={match.ai_matching_score ?? 0}
          />
          <Meter
            label={t("match.role")}
            value={match.role_match_score ?? 0}
            index={1}
          />
          <Meter
            label={t("match.skills")}
            value={match.skills_match_score ?? 0}
            index={2}
          />
        </ul>
      </div>
      {match.rationale && (
        <div className="flex flex-col gap-3 text-sm">
          <SubHeading icon={MessageSquareQuote}>{t("match.why")}</SubHeading>
          <p className="max-w-prose text-pretty">{match.rationale}</p>
        </div>
      )}
    </div>
  )
}

export function Communication({ report }: { report: Scorecard }) {
  const { t } = useTranslation("scorecard")
  const metrics = report.category_scores?.comm_metrics

  return (
    <ul className="flex max-w-2xl flex-col gap-3">
      {METRICS.map(([field, key], i) => (
        <Meter
          key={key}
          label={t(`metrics.${key}`)}
          value={metrics?.[field] ?? 0}
          index={i}
        />
      ))}
    </ul>
  )
}

export function QuestionTypes({ report }: { report: Scorecard }) {
  const { t } = useTranslation("scorecard")
  const summary = report.category_scores?.section_summary

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
      {scoredSections(report).map((key, i) => {
        const section = summary?.[key]
        const score = Math.min(100, Math.max(0, section?.section_score ?? 0))
        return (
          <li
            key={key}
            className="flex flex-col gap-3 rounded-xl border p-4 transition-[translate,border-color] hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {t(`types.${key}`)}
            </span>
            <span className="text-2xl font-semibold tracking-tight text-brand-text tabular-nums">
              {score}
            </span>
            <span className="h-1 overflow-hidden rounded-full bg-muted print:border">
              <span className="block h-full" style={{ width: `${score}%` }}>
                <m.span
                  className="block h-full origin-left rounded-full bg-brand rtl:origin-right print:transform-none!"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: duration.slow,
                    ease,
                    delay: i * 0.04,
                  }}
                />
              </span>
            </span>
            {/* spoken and written answers are scored, not marked right or wrong */}
            {key !== "audio" && key !== "typing" && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {t("types.correct", {
                  correct: section?.correct ?? 0,
                  count: section?.count ?? 0,
                })}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
