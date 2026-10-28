import { useTranslation } from "@workspace/i18n/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { Check, ChevronDown, Minus } from "lucide-react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

import type { Match } from "../schemas/job-matches.schema"
import { MatchBreakdown } from "./match-breakdown"

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

  return (
    <m.div
      key={match.candidate_id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
      className="flex flex-col text-sm"
    >
      <div className="flex min-w-0 flex-col gap-4 p-4">
        <section className="flex flex-col gap-3 rounded-lg border p-3">
          <MatchBreakdown match={match} />
          {years != null && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {t("peek.experience", { count: Math.round(years) })}
            </p>
          )}
        </section>

        <Collapsible className="flex flex-col gap-2">
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-md text-start font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            {t("peek.why")}
            <ChevronDown
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-180 motion-reduce:transition-none"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2">
            <p className="rounded-lg bg-muted px-3 py-2.5 text-pretty">
              {ai?.rationale ?? t("peek.noReason")}
            </p>
            <p className="text-xs text-pretty text-muted-foreground">
              {t("peek.whyNote")}
            </p>
          </CollapsibleContent>
        </Collapsible>

        {Boolean(ai?.matched_skills?.length) ||
        Boolean(ai?.missing_skills?.length) ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <Skills title={t("peek.has")} skills={ai?.matched_skills} has />
            <Skills
              title={t("peek.missing")}
              skills={ai?.missing_skills}
              none={t("peek.noneMissing")}
            />
          </section>
        ) : (
          <p className="text-muted-foreground">{t("peek.noSkills")}</p>
        )}
      </div>

      <aside className="px-4 pb-4">{actions(match)}</aside>
    </m.div>
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
              className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium"
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
