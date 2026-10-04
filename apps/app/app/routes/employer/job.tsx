import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { isJobId, JobDetail, jobQuery } from "@/features/employer-jobs"
import { namespaces } from "@/lib/i18n"

import type { Route } from "./+types/job"

export const handle = { crumb: "jobs" } as const

export const clientMiddleware = [namespaces(["jobs"])]

export default function JobPage({ params }: Route.ComponentProps) {
  const { t } = useTranslation(["jobs", "common"])
  const valid = isJobId(params.jobId)
  const job = useQuery({ ...jobQuery(params.jobId), enabled: valid })
  const title = job.data?.title ?? t("list.title")

  return (
    <>
      <title>{`${title} · ${t("common:appName")}`}</title>
      {valid ? (
        <JobDetail jobId={params.jobId} />
      ) : (
        <EmptyState
          title={t("detail.notFoundTitle")}
          description={t("detail.notFoundBody")}
          action={
            <AppLink
              to="/employer/view-jobs"
              className={buttonVariants({ variant: "outline" })}
            >
              {t("detail.back")}
            </AppLink>
          }
        />
      )}
    </>
  )
}
