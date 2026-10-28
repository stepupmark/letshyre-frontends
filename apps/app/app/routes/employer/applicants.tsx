import { useTranslation } from "@workspace/i18n/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { BackLink } from "@/components/back-link"
import { EmptyState } from "@/components/empty-state"
import { UnlockPanel } from "@/features/candidate-unlock"
import { isJobId, jobQuery } from "@/features/employer-jobs"
import { MATCHES_KEY, MatchList, matchesQuery } from "@/features/job-matches"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

import type { Route } from "./+types/applicants"

export const handle = { crumb: "jobs" } as const

export const clientMiddleware = [namespaces(["jobs", "matches", "unlock"])]

export default function ApplicantsPage({ params }: Route.ComponentProps) {
  const { t } = useTranslation(["matches", "jobs", "common"])
  const queryClient = useQueryClient()
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
        <BackLink to={href("/employer/jobs/:jobId", { jobId })}>
          {job.data?.title ?? t("jobs:detail.back")}
        </BackLink>
        <div className="flex flex-col gap-1">
          <h1
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight text-balance text-brand-text outline-none"
          >
            {t("applicants.title")}
          </h1>
          <p className="min-h-5 text-sm text-muted-foreground tabular-nums">
            {count === undefined
              ? null
              : count
                ? t("applicants.lead", { count })
                : t("applicants.leadEmpty")}
          </p>
        </div>
      </div>
      <MatchList
        jobId={jobId}
        appliedOnly
        actions={(match) => (
          <UnlockPanel
            candidateId={match.candidate_id}
            name={match.candidate_name ?? ""}
            matchedRole={match.ai_match?.role_applied}
            onUnlocked={() =>
              queryClient.invalidateQueries({ queryKey: MATCHES_KEY })
            }
          />
        )}
        empty={
          <EmptyState
            title={t("applicants.emptyTitle")}
            description={t("applicants.emptyBody")}
            action={
              <AppLink
                to={`${href("/employer/candidates")}?jobId=${jobId}`}
                className={buttonLink({ variant: "outline" })}
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
