import { useTranslation } from "@workspace/i18n/react"
import { Plus } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { EmployerDashboard } from "@/features/employer-dashboard"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

export const handle = { crumb: "dashboard" } as const

export const clientMiddleware = [namespaces(["dashboard"])]

export default function EmployerDashboardPage() {
  const { t } = useTranslation(["dashboard", "common"])

  return (
    <div className="flex flex-col gap-8">
      <title>{`${t("title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("title")}
        actions={
          <AppLink to={href("/employer/jobs/new")} className={buttonLink()}>
            <Plus />
            {t("postJob")}
          </AppLink>
        }
      />
      <EmployerDashboard />
    </div>
  )
}
