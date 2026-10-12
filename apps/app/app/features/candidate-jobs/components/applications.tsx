import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import { useQueries, useQuery } from "@tanstack/react-query"
import { Check, X } from "lucide-react"
import { useState } from "react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { DetailSheet } from "@/components/detail-sheet"
import { EmptyState } from "@/components/empty-state"
import { AnimatedList } from "@/components/motion/animated-list"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { useDetailParam } from "@/hooks/use-detail-param"
import { buttonLink } from "@/lib/button-link"
import { relativeTime } from "@/lib/relative-time"

import { applicationsQuery } from "../queries/candidate-jobs.queries"
import { companyOf, STAGES } from "../lib/candidate-jobs"
import { type Job } from "../schemas/candidate-jobs.schema"
import { type Stage } from "../types"
import { CompanyLogo, JobDetail, JobFacts } from "./job-parts"
import { Pager } from "./pager"

const NEXT_STEP: Record<
  Stage,
  { to: string; link: "guide" | "findJobs" } | null
> = {
  Applied: { to: href("/employee/interview-guide"), link: "guide" },
  Shortlisted: null,
  Selected: null,
  Rejected: { to: href("/employee/jobs"), link: "findJobs" },
}

const stageOf = (raw: string | null): Stage =>
  STAGES.find((stage) => stage.toLowerCase() === raw) ?? "Applied"

export function Applications() {
  const { t } = useTranslation("candidateJobs")
  const [params, setParams] = useSearchParams()
  const stage = stageOf(params.get("status"))
  const rawPage = Number.parseInt(params.get("page") ?? "", 10)
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const [openId, setOpenId] = useDetailParam("job")

  const counts = useQueries({
    queries: STAGES.map((item) => applicationsQuery(item, 1)),
  })
  const query = useQuery(applicationsQuery(stage, page))
  const skeleton = useDelayed(query.isPending)

  const go = (next: { stage?: Stage; page?: number }) => {
    setParams(
      (prev) => {
        const search = new URLSearchParams(prev)
        const nextStage = next.stage ?? stage
        if (nextStage === "Applied") search.delete("status")
        else search.set("status", nextStage.toLowerCase())
        if (next.page && next.page > 1) search.set("page", String(next.page))
        else search.delete("page")
        return search
      },
      { preventScrollReset: true }
    )
  }

  const jobs = query.data?.jobs
  const index = jobs?.findIndex((job) => job.id === openId) ?? -1
  const open = index >= 0 ? jobs?.[index] : undefined
  const [last, setLast] = useState(open)
  if (open && open !== last) setLast(open)
  const shown = open ?? last

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={stage}
        onValueChange={(value) => {
          go({ stage: stageOf(String(value).toLowerCase()) })
        }}
      >
        <TabsList className="max-w-full overflow-x-auto">
          {STAGES.map((item, i) => (
            <TabsTrigger key={item} value={item}>
              {t(`stages.${item}`)}
              {counts[i]?.data && (
                <span className="text-muted-foreground tabular-nums">
                  {counts[i].data.total}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {query.isError && !query.data ? (
        <LoadError
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      ) : !jobs ? (
        skeleton && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        )
      ) : jobs.length === 0 ? (
        <EmptyState
          title={t(`empty.${stage}.title`)}
          description={t(`empty.${stage}.body`)}
          action={
            stage === "Applied" ? (
              <AppLink to={href("/employee/jobs")} className={buttonLink()}>
                {t("next.findJobs")}
              </AppLink>
            ) : undefined
          }
        />
      ) : (
        <AnimatedList
          items={jobs}
          getKey={(job) => job.id}
          className={cn(
            "flex flex-col gap-3 transition-opacity",
            query.isPlaceholderData && "opacity-60"
          )}
        >
          {(job) => (
            <ApplicationCard
              job={job}
              stage={stage}
              onOpen={() => {
                setOpenId(job.id)
              }}
            />
          )}
        </AnimatedList>
      )}

      {query.data && (
        <Pager
          page={page}
          hasNext={query.data.hasNext}
          onPage={(next) => {
            go({ page: next })
            window.scrollTo({ top: 0 })
          }}
        />
      )}

      <DetailSheet
        open={Boolean(open)}
        onClose={() => {
          setOpenId(null)
        }}
        title={shown?.title ?? t("untitled")}
        description={shown ? companyOf(shown) : undefined}
      >
        {shown && (
          <>
            <Timeline stage={stage} />
            <JobDetail job={shown} />
          </>
        )}
      </DetailSheet>
    </div>
  )
}

function ApplicationCard({
  job,
  stage,
  onOpen,
}: {
  job: Job
  stage: Stage
  onOpen: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const next = NEXT_STEP[stage]
  return (
    <article className="relative flex flex-col gap-4 rounded-lg border bg-card p-4 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-xs has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:p-5">
      <div className="flex gap-4">
        <CompanyLogo job={job} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="min-w-0">
            <h2 className="font-medium text-pretty">
              <button
                type="button"
                onClick={onOpen}
                className="text-start outline-none after:absolute after:inset-0 after:rounded-lg"
              >
                {job.title ?? t("untitled")}
              </button>
            </h2>
            <p className="text-sm text-muted-foreground">
              {[
                companyOf(job),
                job.created_at &&
                  t("appliedWhen", {
                    when: relativeTime(job.created_at, locale),
                  }),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <JobFacts job={job} />
        </div>
      </div>
      <Timeline stage={stage} />
      <p className="text-sm text-pretty">
        <span className="font-medium">{t("next.label")} </span>
        <span className="text-muted-foreground">{t(`next.${stage}`)}</span>
        {next && (
          <>
            {" "}
            <AppLink
              to={next.to}
              className="relative z-10 font-medium underline-offset-4 hover:underline"
            >
              {t(`next.${next.link}`)}
            </AppLink>
          </>
        )}
      </p>
    </article>
  )
}

/** Where the application is: done steps, the current one, and what's left. */
function Timeline({ stage }: { stage: Stage }) {
  const { t } = useTranslation("candidateJobs")
  const steps: {
    key: string
    label: string
    state: "done" | "now" | "todo" | "stopped"
  }[] =
    stage === "Rejected"
      ? [
          { key: "applied", label: t("stages.Applied"), state: "done" },
          {
            key: "rejected",
            label: t("timeline.notSelected"),
            state: "stopped",
          },
        ]
      : (["Applied", "Shortlisted", "Selected"] as const).map(
          (item, i, all) => {
            const at = (all as readonly Stage[]).indexOf(stage)
            return {
              key: item,
              label: t(`stages.${item}`),
              state: i < at ? "done" : i === at ? "now" : "todo",
            }
          }
        )

  return (
    <ol
      aria-label={t("timeline.label")}
      className="flex items-center gap-2 text-xs"
    >
      {steps.map((step, i) => (
        <li
          key={step.key}
          aria-current={step.state === "now" ? "step" : undefined}
          className="flex min-w-0 items-center gap-2"
        >
          {i > 0 && (
            <span
              aria-hidden="true"
              className={cn(
                "h-px w-4 shrink-0 sm:w-8",
                step.state === "todo" ? "bg-border" : "bg-foreground/40"
              )}
            />
          )}
          <span
            className={cn(
              "flex items-center gap-1.5",
              step.state === "todo" && "text-muted-foreground"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-full border [&_svg]:size-2.5",
                step.state === "done" && "border-foreground/40 text-foreground",
                step.state === "now" &&
                  "border-primary bg-primary text-primary-foreground",
                step.state === "stopped" &&
                  "border-danger bg-danger-muted text-danger"
              )}
            >
              {step.state === "done" && <Check />}
              {step.state === "stopped" && <X />}
              {step.state === "now" && (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
            <span className="truncate">
              {step.label}
              {step.state === "done" && (
                <span className="sr-only"> {t("timeline.done")}</span>
              )}
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}
