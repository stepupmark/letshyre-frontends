import { useLocale, useTranslation } from "@workspace/i18n/react"
import * as m from "motion/react-m"
import { useId, type ReactNode } from "react"

import { ScoreBand } from "@/components/score-band"
import { duration, ease } from "@/lib/motion"
import { relativeTime } from "@/lib/relative-time"

import { nameOf } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { Facts, PersonAvatar } from "./person"

export function ResultPreview({
  row,
  unlock,
}: {
  row: SearchResult
  unlock: ReactNode
}) {
  const { t } = useTranslation("candidateSearch")
  const locale = useLocale()
  const id = useId()
  const name = nameOf(row, t("card.unnamed"))
  const role = row.interviewed_role ?? row.current_role
  const score = row.interview_score
  const interviews = row.completed_interviews_count ?? 0
  const education = (row.candidate_education ?? []).filter(
    (entry) => entry.degree ?? entry.institution
  )
  const skills = row.skills_preview ?? []

  return (
    <m.article
      aria-labelledby={`${id}-name`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.fast, ease }}
      className="flex flex-col"
    >
      <header className="flex items-center gap-4 border-b p-5">
        <PersonAvatar row={row} name={name} className="size-14 text-sm" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2
            id={`${id}-name`}
            className="truncate text-lg font-semibold tracking-tight text-brand-text"
          >
            {name}
          </h2>
          {role && (
            <p className="text-sm text-pretty">
              {t("preview.interviewedFor", { role })}
            </p>
          )}
          <Facts
            row={row}
            className="text-xs text-muted-foreground tabular-nums"
          />
        </div>
      </header>

      <div className="flex flex-col gap-6 p-5">
        {(score != null || interviews > 0) && (
          <Section title={t("preview.interview")}>
            {score != null && (
              <div className="flex items-center gap-3">
                <ScoreBand score={score} of="interview" />
                <span
                  aria-hidden="true"
                  className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                >
                  <m.span
                    key={row.candidate_id}
                    className="block h-full origin-left rounded-full bg-brand rtl:origin-right"
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: duration.slow, ease, delay: 0.08 }}
                  />
                </span>
              </div>
            )}
            {interviews > 0 && (
              <p className="text-sm text-muted-foreground tabular-nums">
                {t("card.interviews", { count: interviews })}
                {row.last_interview_date &&
                  ` · ${t("card.lastInterview", {
                    when: relativeTime(row.last_interview_date, locale),
                  })}`}
              </p>
            )}
          </Section>
        )}

        {education.length > 0 && (
          <Section title={t("preview.education")}>
            <ol className="flex flex-col gap-3">
              {education.map((entry, i) => (
                <li key={i} className="flex flex-col gap-0.5 text-sm">
                  <span className="font-medium">{entry.degree}</span>
                  {entry.institution && (
                    <span className="text-muted-foreground">
                      {entry.institution}
                    </span>
                  )}
                  {entry.duration && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {entry.duration}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {skills.length > 0 && (
          <Section title={t("preview.skills")}>
            <ul className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {unlock}
      </div>
    </m.article>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}
