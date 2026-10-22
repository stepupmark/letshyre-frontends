import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"
import { FindJobs } from "@/features/candidate-jobs"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "findJobs" } as const

export const clientMiddleware = [namespaces(["candidateJobs"])]

export default function FindJobsPage() {
  const { t } = useTranslation("candidateJobs")
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("find.title")} description={t("find.lead")} />
      <FindJobs />
    </div>
  )
}
