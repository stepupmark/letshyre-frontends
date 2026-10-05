import { useTranslation } from "@workspace/i18n/react"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useEffect, useId } from "react"
import { useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { LoadError } from "@/components/query-state"
import { UnlockPanel } from "@/features/candidate-unlock"
import { isJobId, jobQuery, jobsQuery } from "@/features/employer-jobs"
import { MatchList, matchesQuery } from "@/features/job-matches"
import { namespaces } from "@/lib/i18n"
import { buttonLink } from "@/lib/button-link"

export const handle = { crumb: "candidatePool" } as const

export const clientMiddleware = [namespaces(["jobs", "matches", "unlock"])]

const JOB = "jobId"
const APPLIED = "applied"
// a new list starts unfiltered, with no one open
const RESET = ["band", "candidate"]

export default function CandidatePoolPage() {
  const { t } = useTranslation(["unlock", "common"])
  const pickerId = useId()
  const [search, setSearch] = useSearchParams()
  const raw = search.get(JOB) ?? undefined
  const jobId = isJobId(raw) ? raw : undefined
  const applied = search.get(APPLIED) === "1"
  const jobs = useQuery(jobsQuery({ page: 1, tab: "open" }))
  const open = jobs.data?.results ?? []
  const listed = open.find((job) => job.id === jobId)
  // a shared link can point at a job that isn't on the first page
  const linked = useQuery({
    ...jobQuery(jobId ?? ""),
    enabled: Boolean(jobId) && jobs.isSuccess && !listed,
  })
  const selected = listed ?? linked.data
  const matches = useQuery({
    ...matchesQuery(jobId ?? "", applied),
    enabled: Boolean(jobId),
  })

  const firstId = open[0]?.id
  useEffect(() => {
    if (!jobId && firstId)
      setSearch(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(JOB, firstId)
          return next
        },
        { replace: true }
      )
  }, [jobId, firstId, setSearch])

  const choose = (key: string, value: string | null) => {
    setSearch(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        for (const name of RESET) next.delete(name)
        return next
      },
      { replace: true, preventScrollReset: true }
    )
  }

  const items = [
    ...open.map((job) => ({ value: job.id, label: job.title ?? job.id })),
    ...(selected && !listed
      ? [{ value: selected.id, label: selected.title ?? selected.id }]
      : []),
  ]
  const data = matches.data

  return (
    <div className="flex flex-col gap-6">
      <title>{`${t("pool.title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("pool.title")} description={t("pool.lead")} />

      {jobs.isError ? (
        <LoadError
          onRetry={() => void jobs.refetch()}
          retrying={jobs.isRefetching}
        />
      ) : jobs.isPending ? (
        <Skeleton className="h-9 w-full max-w-sm" />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("pool.noJobsTitle")}
          description={t("pool.noJobsBody")}
          action={
            <AppLink to="/employer/post-job" className={buttonLink()}>
              <Plus />
              {t("pool.postJob")}
            </AppLink>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex w-full max-w-sm flex-col gap-2">
              <Label htmlFor={pickerId}>{t("pool.job")}</Label>
              <Select
                items={items}
                value={jobId ?? null}
                onValueChange={(value) => {
                  choose(JOB, value)
                }}
              >
                <SelectTrigger id={pickerId} className="w-full">
                  <SelectValue placeholder={t("pool.chooseJob")} />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs
              value={applied ? APPLIED : JOB}
              onValueChange={(value) => {
                choose(APPLIED, value === APPLIED ? "1" : null)
              }}
            >
              <TabsList className="max-w-full overflow-x-auto">
                <TabsTrigger value={JOB}>{t("pool.matched")}</TabsTrigger>
                <TabsTrigger value={APPLIED}>{t("pool.applied")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {data?.total_candidates != null &&
            data.matched_candidates_count != null && (
              <p className="text-sm text-muted-foreground tabular-nums">
                {t("pool.summary", {
                  matched: data.matched_candidates_count,
                  total: data.total_candidates,
                })}
              </p>
            )}

          {jobId && (
            <MatchList
              key={`${jobId}:${String(applied)}`}
              jobId={jobId}
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
                  title={t("pool.emptyTitle")}
                  description={
                    applied ? t("pool.emptyApplied") : t("pool.emptyBody")
                  }
                />
              }
            />
          )}
        </>
      )}
    </div>
  )
}
