import { useTranslation } from "@workspace/i18n/react"
import { Plus } from "lucide-react"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { JobsList } from "@/features/employer-jobs"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

export const handle = { crumb: "jobs" } as const

export const clientMiddleware = [namespaces(["jobs"])]

export default function JobsPage() {
  const { t } = useTranslation(["jobs", "common"])
  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("list.title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("list.title")}
        description={t("list.lead")}
        actions={
          <AppLink to="/employer/post-job" className={buttonLink()}>
            <Plus />
            {t("list.postJob")}
          </AppLink>
        }
      />
      <JobsList />
    </div>
  )
}
