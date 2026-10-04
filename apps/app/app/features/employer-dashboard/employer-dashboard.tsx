import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"

import { AppLink } from "@/components/app-link"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { creditsQuery } from "@/lib/credits"

import { AttentionList } from "./attention-list"
import { CreditsCard } from "./credits-card"
import { cardsQuery, teamQuery, type Cards } from "./queries"
import { SetupChecklist } from "./setup-checklist"
import { useAttention } from "./use-attention"

export function EmployerDashboard() {
  const cards = useQuery(cardsQuery())
  const team = useQuery(teamQuery())
  const credits = useQuery(creditsQuery())
  const skeleton = useDelayed(cards.isPending)

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        {cards.data ? (
          <Overview
            cards={cards.data}
            credits={credits.data?.available_credits}
            team={team.isError ? null : team.data?.count}
          />
        ) : cards.isError ? (
          <LoadError
            onRetry={() => void cards.refetch()}
            retrying={cards.isRefetching}
          />
        ) : (
          skeleton && <OverviewSkeleton />
        )}
      </div>
      {credits.isError ? (
        <LoadError
          onRetry={() => void credits.refetch()}
          retrying={credits.isRefetching}
        />
      ) : (
        <CreditsCard
          available={credits.data?.available_credits}
          usedPercent={cards.data?.credits?.usage_percent}
        />
      )}
    </div>
  )
}

function Overview({
  cards,
  credits,
  team,
}: {
  cards: Cards
  credits: number | undefined
  team: number | null | undefined
}) {
  const openJobs = cards.active_jobs ?? 0
  const closedJobs = cards.in_active_jobs ?? 0
  const attention = useAttention({ credits, openJobs, closedJobs })

  return (
    <>
      {/* wait for the team count, so the checklist doesn't flash a done step as to-do */}
      {team !== undefined && (
        <SetupChecklist
          hasJobs={openJobs + closedJobs > 0}
          hasTeam={(team ?? 0) > 0}
        />
      )}
      <AttentionList items={attention} />
      <HiringStats
        openJobs={openJobs}
        closedJobs={closedJobs}
        applications={cards.total_applications ?? 0}
      />
    </>
  )
}

function HiringStats({
  openJobs,
  closedJobs,
  applications,
}: {
  openJobs: number
  closedJobs: number
  applications: number
}) {
  const { t } = useTranslation("dashboard")
  const locale = useLocale()
  const format = new Intl.NumberFormat(locale)
  const stats = [
    { key: "open", value: openJobs },
    { key: "closed", value: closedJobs },
    { key: "applications", value: applications },
  ] as const

  return (
    <section aria-labelledby="hiring" className="flex flex-col gap-3">
      <h2 id="hiring" className="text-base font-medium">
        {t("stats.heading")}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.key}>
            <AppLink
              to="/employer/view-jobs"
              className="flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <span className="text-2xl font-semibold tabular-nums">
                {format.format(stat.value)}
              </span>
              <span className="text-sm text-muted-foreground">
                {t(`stats.${stat.key}`)}
              </span>
            </AppLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

function OverviewSkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      aria-busy="true"
      aria-label={t("state.loading")}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-48" />
        <div className="flex flex-col divide-y rounded-lg border">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="size-8 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
