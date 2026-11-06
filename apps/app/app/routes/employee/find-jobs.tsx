import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"

import { PageHeader } from "@/components/page-header"
import { ownScorecardsQuery } from "@/features/candidate"
import { FindJobs } from "@/features/candidate-jobs"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "findJobs" } as const

export const clientMiddleware = [namespaces(["candidateJobs"])]

export default function FindJobsPage() {
  const { t } = useTranslation("candidateJobs")
  // stale at once, so coming back from the desktop app re-checks for a new interview
  const scorecards = useQuery({ ...ownScorecardsQuery(), staleTime: 0 })
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("find.title")} description={t("find.lead")} />
      <FindJobs
        interviews={scorecards.data?.length}
        onRecheck={() => void scorecards.refetch()}
      />
    </div>
  )
}
