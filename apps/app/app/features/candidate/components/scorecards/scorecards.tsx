import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { Download } from "lucide-react"
import { useState } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { LoadError, RefreshNote } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { buttonLink } from "@/lib/button-link"
import { sitePage } from "@/lib/site"

import { historyOf } from "../../lib/scorecards"
import { ownScorecardsQuery } from "../../queries/candidate.queries"
import { LatestScorecard } from "./latest-scorecard"
import { ScorecardRows } from "./scorecard-rows"
import { ScorecardsSkeleton } from "./scorecards-skeleton"

export function Scorecards() {
  const { t } = useTranslation("candidate")
  const query = useQuery(ownScorecardsQuery())
  const skeleton = useDelayed(query.isPending)
  // only animate in when the list arrives, not when coming back to cached data
  const [enter] = useState(query.isPending)

  if (query.data === undefined) {
    if (query.isError)
      return (
        <LoadError
          title={t("list.errorTitle")}
          body={t("list.errorBody")}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      )
    return skeleton ? <ScorecardsSkeleton /> : null
  }

  const [latest, ...earlier] = query.data
  if (!latest) return <ScorecardsEmpty />

  return (
    <div className="flex flex-col gap-8">
      {query.isRefetchError && (
        <RefreshNote
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      )}
      <LatestScorecard
        item={latest}
        history={historyOf(query.data)}
        enter={enter}
      />
      {earlier.length > 0 && <ScorecardRows items={earlier} enter={enter} />}
    </div>
  )
}

function ScorecardsEmpty() {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  return (
    <EmptyState
      title={t("list.emptyTitle")}
      description={t("list.emptyBody")}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <a href={sitePage(locale, "/download")} className={buttonLink()}>
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
  )
}
