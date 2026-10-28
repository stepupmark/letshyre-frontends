import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useId } from "react"

import { AnimatedNumber } from "@/components/animated-number"

import { bandCounts } from "../lib/job-matches"
import { matchesQuery } from "../queries/job-matches.queries"

export function PoolOverview({
  jobId,
  appliedOnly,
}: {
  jobId: string
  appliedOnly: boolean
}) {
  const { t } = useTranslation("matches")
  const query = useQuery(matchesQuery(jobId, appliedOnly))
  const data = query.data
  const counts = data && bandCounts(data.matches)
  const matched = data?.matched_candidates_count ?? counts?.all ?? 0
  const total = data?.total_candidates

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {data && total != null ? t("overview.summary", { matched, total }) : ""}
      </p>
      {query.isPending ? (
        <OverviewSkeleton />
      ) : !counts || counts.all === 0 ? null : (
        <Overview
          title={appliedOnly ? t("overview.applied") : t("overview.matched")}
          matched={matched}
          total={total}
          top={counts.strong}
        />
      )}
    </>
  )
}

function Overview({
  title,
  matched,
  total,
  top,
}: {
  title: string
  matched: number
  total: number | null | undefined
  top: number
}) {
  const { t } = useTranslation("matches")
  const locale = useLocale()
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 rounded-lg border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-sm text-muted-foreground">
          {title}
        </h2>
        <p className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-brand-text">
            <AnimatedNumber value={matched} locale={locale} from={0} />
          </span>
          {total != null && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {t("overview.ofTotal", { total })}
            </span>
          )}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        <Trans
          t={t}
          i18nKey="overview.top"
          values={{ count: top }}
          components={{
            n: <span className="font-semibold text-brand-text tabular-nums" />,
          }}
        />
      </p>
    </section>
  )
}

function OverviewSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-end justify-between gap-4 rounded-lg border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-4 w-40" />
    </div>
  )
}
