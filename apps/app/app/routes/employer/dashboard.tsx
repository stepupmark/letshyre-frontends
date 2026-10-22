import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { EmployerDashboard } from "@/features/employer-dashboard"
import { RecentJobs } from "@/features/employer-jobs"
import { kycStatusQuery } from "@/features/employer-onboarding"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

export const handle = { crumb: "dashboard" } as const

export const clientMiddleware = [namespaces(["dashboard", "jobs"])]

export default function EmployerDashboardPage() {
  const { t } = useTranslation(["dashboard", "common"])
  const review = useQuery(kycStatusQuery())

  return (
    <div className="flex flex-col gap-8">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={
          <AppLink to={href("/employer/jobs/new")} className={buttonLink()}>
            <Plus />
            {t("postJob")}
          </AppLink>
        }
      />
      <EmployerDashboard review={review.data} recent={<RecentJobs />} />
    </div>
  )
}
