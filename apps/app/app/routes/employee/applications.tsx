import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"
import { Applications } from "@/features/candidate-jobs"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "applications" } as const

export const clientMiddleware = [namespaces(["candidateJobs"])]

export default function ApplicationsPage() {
  const { t } = useTranslation(["candidateJobs", "common"])
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("applications.title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("applications.title")}
        description={t("applications.lead")}
      />
      <Applications />
    </div>
  )
}
