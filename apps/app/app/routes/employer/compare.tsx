import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQueries } from "@tanstack/react-query"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { LoadError } from "@/components/query-state"
import {
  compareIds,
  CompareView,
  unlockedScorecardQuery,
} from "@/features/candidate"
import { useDelayed } from "@/hooks/use-delayed"
import { buttonLink } from "@/lib/button-link"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "unlocked" } as const

export const clientMiddleware = [namespaces(["scorecard"])]

export default function ComparePage() {
  const { t } = useTranslation(["scorecard", "common"])
  const [search] = useSearchParams()
  const ids = compareIds(search.get("ids"))
  const enough = ids.length >= 2
  const queries = useQueries({
    queries: ids.map((id) => ({
      ...unlockedScorecardQuery(id),
      enabled: enough,
    })),
  })
  const pending = enough && queries.some((q) => q.isPending)
  const skeleton = useDelayed(pending)
  const failed = queries.some((q) => q.isError)

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("compare.title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("compare.title")} description={t("compare.lead")} />

      {!enough ? (
        <EmptyState
          title={t("compare.tooFewTitle")}
          description={t("compare.tooFewBody")}
          action={
            <AppLink
              to={href("/employer/candidates/unlocked")}
              className={buttonLink({ variant: "outline" })}
            >
              {t("compare.back")}
            </AppLink>
          }
        />
      ) : failed ? (
        <LoadError
          onRetry={() => {
            for (const q of queries) if (q.isError) void q.refetch()
          }}
          retrying={queries.some((q) => q.isRefetching)}
        />
      ) : pending ? (
        skeleton && <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <CompareView
          items={ids.flatMap((id, i) => {
            const report = queries[i]?.data
            return report ? [{ id, report }] : []
          })}
        />
      )}
    </div>
  )
}
