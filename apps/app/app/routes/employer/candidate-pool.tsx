import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { LockOpen, Plus } from "lucide-react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { GuideLink } from "@/components/guide-link"
import { PageHeader } from "@/components/page-header"
import { LoadError } from "@/components/query-state"
import { UnlockPanel } from "@/features/candidate-unlock"
import { EmptyJobsArt, JobPicker, useJobParam } from "@/features/employer-jobs"
import {
  MatchList,
  NoMatchesArt,
  PoolOverview,
  PoolSkeleton,
  ScopeTabs,
} from "@/features/job-matches"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

export const handle = { crumb: "candidatePool" } as const

export const clientMiddleware = [namespaces(["jobs", "matches", "unlock"])]

const APPLIED = "applied"
// a new list starts unfiltered, with no one open
const RESET = ["band", "candidate"]

export default function CandidatePoolPage() {
  const { t } = useTranslation(["unlock", "common"])
  const [search, setSearch] = useSearchParams()
  const job = useJobParam(RESET)
  const applied = search.get(APPLIED) === "1"

  const setApplied = (next: boolean) => {
    setSearch(
      (prev) => {
        const params = new URLSearchParams(prev)
        if (next) params.set(APPLIED, "1")
        else params.delete(APPLIED)
        for (const name of RESET) params.delete(name)
        return params
      },
      { replace: true, preventScrollReset: true }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("pool.title")} · ${t("common:appName")}`}</title>
      <PageHeader
        title={t("pool.title")}
        description={t("pool.lead")}
        actions={
          <AppLink
            to={href("/employer/candidates/unlocked")}
            className={buttonLink({ variant: "outline" })}
          >
            <LockOpen />
            {t("list.title")}
          </AppLink>
        }
      />

      {job.jobs.isError ? (
        <LoadError
          title={t("pool.jobsFailed")}
          onRetry={() => void job.jobs.refetch()}
          retrying={job.jobs.isRefetching}
        />
      ) : job.pending ? (
        <PoolSkeleton />
      ) : job.choices.length === 0 && !job.missing ? (
        <EmptyState
          art={<EmptyJobsArt />}
          title={t("pool.noJobsTitle")}
          description={t("pool.noJobsBody")}
          action={
            <div className="flex flex-col items-center gap-3">
              <AppLink to={href("/employer/jobs/new")} className={buttonLink()}>
                <Plus />
                {t("pool.postJob")}
              </AppLink>
              <GuideLink chapter="post" />
            </div>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <JobPicker
              label={t("pool.job")}
              placeholder={t("pool.chooseJob")}
              choices={job.choices}
              value={job.missing ? undefined : job.jobId}
              onChange={job.choose}
            />
            <ScopeTabs applied={applied} onChange={setApplied} />
          </div>

          {job.missing ? (
            <EmptyState
              title={t("pool.missingTitle")}
              description={t("pool.missingBody")}
              action={
                job.firstOpen && (
                  <Button
                    onClick={() => {
                      if (job.firstOpen) job.choose(job.firstOpen)
                    }}
                  >
                    {t("pool.firstOpen")}
                  </Button>
                )
              }
            />
          ) : (
            job.jobId && (
              <>
                <PoolOverview jobId={job.jobId} appliedOnly={applied} />
                <MatchList
                  key={`${job.jobId}:${String(applied)}`}
                  jobId={job.jobId}
                  appliedOnly={applied}
                  actions={(match) => (
                    <UnlockPanel
                      candidateId={match.candidate_id}
                      name={match.candidate_name ?? ""}
                      matchedRole={match.ai_match?.role_applied}
                    />
                  )}
                  empty={
                    <EmptyState
                      art={<NoMatchesArt />}
                      title={t("pool.emptyTitle")}
                      description={
                        applied ? t("pool.emptyApplied") : t("pool.emptyBody")
                      }
                      action={<GuideLink chapter="pool" />}
                    />
                  }
                />
              </>
            )
          )}
        </>
      )}
    </div>
  )
}
