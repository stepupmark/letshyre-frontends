import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { EmployerDashboard } from "@/features/employer-dashboard"
import { namespaces } from "@/lib/i18n"

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
          <AppLink to="/employer/post-job" className={buttonVariants()}>
            <Plus />
            {t("postJob")}
          </AppLink>
        }
      />
      <EmployerDashboard />
    </div>
  )
}
