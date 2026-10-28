import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import * as m from "motion/react-m"
import { useId } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { duration, ease } from "@/lib/motion"

import { bandCounts } from "../lib/job-matches"
import { matchesQuery } from "../queries/job-matches.queries"

const SPLIT = ["strong", "partial", "low"] as const

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
          counts={counts}
        />
      )}
    </>
  )
}

function Overview({
  title,
  matched,
  total,
  counts,
}: {
  title: string
  matched: number
  total: number | null | undefined
  counts: Record<(typeof SPLIT)[number], number>
}) {
  const { t } = useTranslation("matches")
  const locale = useLocale()
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="text-sm text-muted-foreground">
            {title}
          </h2>
          <p className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              <AnimatedNumber value={matched} locale={locale} from={0} />
            </span>
            {total != null && (
              <span className="text-sm text-muted-foreground tabular-nums">
                {t("overview.ofTotal", { total })}
              </span>
            )}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {SPLIT.map((band) => (
            <li key={band} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                data-band={band}
                className="size-2 rounded-full bg-muted-foreground/40 data-[band=partial]:bg-muted-foreground data-[band=strong]:bg-foreground"
              />
              <span className="text-muted-foreground tabular-nums">
                {t(`range.${band}`)}
              </span>
              <span className="font-medium tabular-nums">{counts[band]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="flex h-2 gap-0.5">
        {SPLIT.filter((band) => counts[band] > 0).map((band, i) => (
          <span
            key={band}
            className="block h-full"
            style={{ flexGrow: counts[band], flexBasis: 0 }}
          >
            <m.span
              data-band={band}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: duration.slow, ease, delay: i * 0.08 }}
              className="block h-full origin-left rounded-full bg-muted-foreground/40 data-[band=partial]:bg-muted-foreground data-[band=strong]:bg-foreground rtl:origin-right"
            />
          </span>
        ))}
      </div>
    </section>
  )
}

function OverviewSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  )
}
