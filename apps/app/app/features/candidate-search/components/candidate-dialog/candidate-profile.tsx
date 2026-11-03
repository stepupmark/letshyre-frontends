import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { DialogDescription, DialogTitle } from "@workspace/ui/components/dialog"
import { ChevronDown, GraduationCap } from "lucide-react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"
import { relativeTime } from "@/lib/relative-time"

import { nameOf } from "../../lib/result"
import type { SearchResult } from "../../schemas/candidate-search.schema"
import { Facts, PersonAvatar } from "../person"
import { LockedFields } from "./locked-fields"

const [HIDDEN, SHOWN] = ["hidden", "shown"] as const

const SETTLE = {
  hidden: { opacity: 0, y: 4 },
  shown: { opacity: 1, y: 0, transition: { duration: duration.base, ease } },
}

export function CandidateProfile({
  row,
  unlock,
}: {
  row: SearchResult
  unlock: ReactNode
}) {
  const { t } = useTranslation("candidateSearch")
  const locale = useLocale()
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
      variants={{ shown: { transition: { staggerChildren: 0.04 } } }}
      initial={HIDDEN}
      animate={SHOWN}
      className="flex flex-col"
    >
      <m.header
        variants={SETTLE}
        className="flex items-center gap-4 ps-5 pe-12 pt-5 pb-4 sm:ps-6"
      >
        <PersonAvatar row={row} name={name} className="size-16 text-base" />
        <div className="flex min-w-0 flex-col gap-1">
          <DialogTitle className="text-xl font-semibold tracking-tight text-balance text-brand-text">
            {name}
          </DialogTitle>
          {role && (
            <DialogDescription className="text-sm text-pretty text-foreground">
              {t("preview.interviewedFor", { role })}
            </DialogDescription>
          )}
          <Facts
            row={row}
            className="text-xs text-muted-foreground tabular-nums"
          />
        </div>
      </m.header>

      <div className="flex flex-col gap-6 px-5 pt-2 pb-6 sm:px-6">
        {(score != null || interviews > 0) && (
          <Section title={t("preview.interview")}>
            {score != null && (
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                >
                  <m.span
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

        {skills.length > 0 && (
          <Section title={t("preview.skills")}>
            <ul className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border px-2.5 py-0.5 text-xs"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {education.length > 0 && (
          <m.section variants={SETTLE}>
            <Collapsible className="flex flex-col gap-3">
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-md text-start text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
                <span className="flex items-center gap-1.5">
                  {t("preview.education")}
                  <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">
                    {education.length}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-data-panel-open:rotate-180 motion-reduce:transition-none"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none">
                <ol className="flex flex-col divide-y rounded-lg border">
                  {education.map((entry, i) => (
                    <li key={i} className="flex items-start gap-3 p-3">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                      >
                        <GraduationCap className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium text-pretty">
                          {entry.degree ?? entry.institution}
                        </span>
                        {entry.degree && entry.institution && (
                          <span className="text-xs text-pretty text-muted-foreground">
                            {entry.institution}
                          </span>
                        )}
                      </span>
                      {entry.duration && (
                        <span className="shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                          {entry.duration}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </CollapsibleContent>
            </Collapsible>
          </m.section>
        )}

        <Section
          title={
            row.already_unlocked
              ? t("dialog.locked.titleDone")
              : t("dialog.locked.title")
          }
        >
          <LockedFields unlocked={Boolean(row.already_unlocked)} />
          {unlock}
        </Section>
      </div>
    </m.article>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <m.section variants={SETTLE} className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      {children}
    </m.section>
  )
}
