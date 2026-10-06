import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Download } from "lucide-react"
import * as m from "motion/react-m"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { QueryState } from "@/components/query-state"
import { ScoreBand } from "@/components/score-band"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"
import { sitePage } from "@/lib/site"

import { ownScorecardsQuery, type ScorecardItem } from "./api"

export function ScorecardList() {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  const query = useQuery(ownScorecardsQuery())

  return (
    <QueryState
      query={query}
      skeleton={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      }
    >
      {(items) =>
        items.length === 0 ? (
          <EmptyState
            title={t("list.emptyTitle")}
            description={t("list.emptyBody")}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href={sitePage(locale, "/download")}
                  className={buttonLink()}
                >
                  <Download />
                  {t("list.download")}
                </a>
                <AppLink
                  to={href("/employee/interview-guide")}
                  className={buttonLink({ variant: "outline" })}
                >
                  {t("list.guide")}
                </AppLink>
              </div>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, i) => (
              <m.li
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: duration.base,
                  ease,
                  delay: Math.min(i, 8) * 0.03,
                }}
              >
                <Card item={item} />
              </m.li>
            ))}
          </ul>
        )
      }
    </QueryState>
  )
}

function Card({ item }: { item: ScorecardItem }) {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  const date = item.created_at ? new Date(item.created_at) : null
  const skills = item.candidate_skills ?? []
  return (
    <article className="relative flex h-full flex-col gap-4 rounded-lg border bg-card p-5 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-xs has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-medium text-pretty first-letter:uppercase">
            {item.category_scores?.candidate_role ?? t("list.interview")}
          </h2>
          {date && !Number.isNaN(date.getTime()) && (
            <p className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                date
              )}
            </p>
          )}
        </div>
        {item.overall_score != null && (
          <ScoreBand score={item.overall_score} of="interview" />
        )}
      </div>
      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <li key={skill}>
              <Badge variant="outline">{skill}</Badge>
            </li>
          ))}
          {skills.length > 3 && (
            <li>
              <Badge variant="ghost" className="text-muted-foreground">
                {t("list.more", { count: skills.length - 3 })}
              </Badge>
            </li>
          )}
        </ul>
      )}
      <AppLink
        to={href("/employee/scorecards/:scorecardId", {
          scorecardId: item.id,
        })}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-lg"
      >
        {t("list.open")}{" "}
        <span className="sr-only">
          {item.category_scores?.candidate_role ?? t("list.interview")}
        </span>
        <ArrowRight className="size-4 rtl:-scale-x-100" />
      </AppLink>
    </article>
  )
}
