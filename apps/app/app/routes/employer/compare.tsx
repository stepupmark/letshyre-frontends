import { useTranslation } from "@workspace/i18n/react"
import { useQueries } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { LoadError } from "@/components/query-state"
import {
  compareIds,
  CompareSkeleton,
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
  const failed = queries.length > 0 && queries.every((q) => q.isError)
  const back = (
    <AppLink
      to={href("/employer/candidates/unlocked")}
      className={buttonLink({ variant: "outline" })}
    >
      <ArrowLeft className="rtl:-scale-x-100" />
      {t("compare.back")}
    </AppLink>
  )

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("compare.title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("compare.title")}
        description={t("compare.lead")}
        actions={enough && back}
      />

      {!enough ? (
        <EmptyState
          title={t("compare.tooFewTitle")}
          description={t("compare.tooFewBody")}
          action={back}
        />
      ) : failed ? (
        <LoadError
          title={t("compare.errorTitle")}
          body={t("compare.errorBody")}
          onRetry={() => {
            for (const q of queries) void q.refetch()
          }}
          retrying={queries.some((q) => q.isFetching)}
        />
      ) : pending ? (
        skeleton && <CompareSkeleton count={ids.length} />
      ) : (
        <CompareView
          items={ids.map((id, i) => ({
            id,
            report: queries[i]?.data,
            retry: () => void queries[i]?.refetch(),
            retrying: queries[i]?.isFetching ?? false,
          }))}
        />
      )}
    </div>
  )
}
