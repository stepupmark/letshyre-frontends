import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { UnlockPanel } from "@/features/candidate-unlock"
import { isJobId, jobQuery } from "@/features/employer-jobs"
import { MatchList, matchesQuery } from "@/features/job-matches"
import { namespaces } from "@/lib/i18n"

import type { Route } from "./+types/applicants"

export const handle = { crumb: "jobs" } as const

export const clientMiddleware = [namespaces(["jobs", "matches", "unlock"])]

export default function ApplicantsPage({ params }: Route.ComponentProps) {
  const { t } = useTranslation(["matches", "jobs", "common"])
  const { jobId } = params
  const valid = isJobId(jobId)
  const job = useQuery({ ...jobQuery(jobId), enabled: valid })
  const matches = useQuery({ ...matchesQuery(jobId, true), enabled: valid })
  const count = matches.data?.matches.length

  if (!valid)
    return (
      <EmptyState
        title={t("jobs:detail.notFoundTitle")}
        description={t("jobs:detail.notFoundBody")}
      />
    )

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("applicants.title")} · ${job.data?.title ?? ""} · ${t("common:appName")}`}</title>
      <div className="flex flex-col gap-3">
        <AppLink
          to={`/employer/view-jobs/${jobId}`}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {job.data?.title ?? t("jobs:detail.back")}
        </AppLink>
        <PageHeader
          title={t("applicants.title")}
          description={
            count === undefined
              ? undefined
              : count
                ? t("applicants.lead", { count })
                : t("applicants.leadEmpty")
          }
        />
      </div>
      <MatchList
        jobId={jobId}
        appliedOnly
        actions={(match) => (
          <UnlockPanel
            candidateId={match.candidate_id}
            name={match.candidate_name ?? ""}
            matchedRole={match.ai_match?.role_applied}
          />
        )}
        empty={
          <EmptyState
            title={t("applicants.emptyTitle")}
            description={t("applicants.emptyBody")}
            action={
              <AppLink
                to={`/employer/candidate-pool?jobId=${jobId}`}
                className={buttonVariants({ variant: "outline" })}
              >
                {t("applicants.pool")}
              </AppLink>
            }
          />
        }
      />
    </div>
  )
}
