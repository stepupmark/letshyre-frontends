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
  // a finished interview leaves a scorecard; if this fails, Apply stays open
  const scorecards = useQuery(ownScorecardsQuery())
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("find.title")} description={t("find.lead")} />
      <FindJobs
        hasInterview={
          scorecards.isSuccess ? scorecards.data.length > 0 : undefined
        }
      />
    </div>
  )
}
