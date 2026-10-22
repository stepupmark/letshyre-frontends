import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { LoadError, RefreshNote } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { creditsQuery } from "@/lib/credits"

import { attentionOf, type Review } from "../lib/employer-dashboard"
import { cardsQuery, teamQuery } from "../queries/employer-dashboard.queries"
import { AttentionList } from "./attention-list"
import { CreditsCard } from "./credits-card"
import { SummarySkeleton } from "./dashboard-skeleton"
import { HiringSummary } from "./hiring-summary"
import { SetupChecklist } from "./setup-checklist"

export function EmployerDashboard({
  review,
  recent,
}: {
  review: Review | undefined
  recent?: ReactNode
}) {
  const { t } = useTranslation("dashboard")
  const cards = useQuery(cardsQuery())
  const team = useQuery(teamQuery())
  const credits = useQuery(creditsQuery())
  const skeleton = useDelayed(cards.isPending)
  const data = cards.data
  const openJobs = data?.active_jobs ?? 0
  const closedJobs = data?.in_active_jobs ?? 0
  const attention = data
    ? attentionOf({
        credits: credits.data?.available_credits,
        openJobs,
        closedJobs,
      })
    : []

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-8">
        {data && cards.isError && (
          <RefreshNote
            onRetry={() => void cards.refetch()}
            retrying={cards.isFetching}
          />
        )}
        {/* wait for the team count, so a done step doesn't flash as to-do */}
        {data && team.isFetched && (
          <SetupChecklist
            hasJobs={openJobs + closedJobs > 0}
            hasTeam={(team.data?.count ?? 0) > 0}
            review={review}
          />
        )}
        <AttentionList
          items={attention}
          credits={credits.data?.available_credits}
          closedJobs={closedJobs}
        />
        {data ? (
          <HiringSummary
            openJobs={openJobs}
            closedJobs={closedJobs}
            applications={data.total_applications ?? 0}
            caughtUp={attention.length === 0}
          />
        ) : cards.isError ? (
          <LoadError
            title={t("stats.errorTitle")}
            body={t("stats.errorBody")}
            onRetry={() => void cards.refetch()}
            retrying={cards.isFetching}
          />
        ) : (
          skeleton && <SummarySkeleton />
        )}
        {recent}
      </div>
      <div className="lg:sticky lg:top-20">
        <CreditsCard
          credits={credits}
          usedPercent={data?.credits?.usage_percent}
        />
      </div>
    </div>
  )
}
