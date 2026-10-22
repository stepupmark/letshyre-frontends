import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ChevronRight, CornerDownRight } from "lucide-react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"

import { useJobFacts } from "../hooks/use-job-facts"
import { appliedOn, type Stage } from "../lib/applications"
import { companyOf } from "../lib/candidate-jobs"
import { statusOf } from "../lib/job-facts"
import { type Job } from "../schemas/candidate-jobs.schema"
import { ApplicationStepper } from "./application-stepper"
import { ApplicationStatus, CompanyLogo, Highlight } from "./job-parts"

export function NextStep({ stage }: { stage: Stage }) {
  const { t } = useTranslation("candidateJobs")
  const link =
    stage === "Applied"
      ? { to: href("/employee/interview-guide"), label: t("next.guide") }
      : stage === "Rejected"
        ? { to: href("/employee/jobs"), label: t("next.findJobs") }
        : null
  return (
    <p className="flex items-start gap-2 text-sm text-pretty">
      <CornerDownRight
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground rtl:-scale-x-100"
      />
      <span>
        <span className="sr-only">{t("next.label")} </span>
        <span className="text-muted-foreground">{t(`next.${stage}`)}</span>
        {link && (
          <>
            {" "}
            <AppLink
              to={link.to}
              className="relative z-10 font-medium underline-offset-4 hover:underline"
            >
              {link.label}
            </AppLink>
          </>
        )}
      </span>
    </p>
  )
}

export function ApplicationCard({
  job,
  stage,
  query,
  onOpen,
}: {
  job: Job
  stage: Stage
  query: string
  onOpen: () => void
}) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const facts = useJobFacts(job)
  const company = companyOf(job)
  const applied = appliedOn(job, locale)
  const meta = [facts.location, facts.salary].filter(Boolean).join(" · ")
  const status = statusOf(job.status)
  const extra = status === "Hired" || status === "Reserved" ? status : null

  return (
    <article className="group relative flex flex-col gap-4 rounded-lg border bg-card p-4 transition-colors duration-200 hover:border-foreground/25 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:p-5">
      <div className="flex items-start gap-4">
        <CompanyLogo job={job} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight text-pretty">
              <button
                type="button"
                onClick={onOpen}
                className="text-start decoration-foreground/30 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:rounded-lg"
              >
                <Highlight text={job.title ?? t("untitled")} query={query} />
              </button>
            </h3>
            {extra && (
              <span className="shrink-0">
                <ApplicationStatus status={extra} />
              </span>
            )}
          </div>
          {company && (
            <p className="truncate text-sm font-medium text-muted-foreground">
              <Highlight text={company} query={query} />
            </p>
          )}
          {meta && (
            <p className="truncate text-sm text-muted-foreground tabular-nums">
              {meta}
            </p>
          )}
        </div>
      </div>

      <ApplicationStepper stage={stage} />
      <NextStep stage={stage} />

      <div className="flex items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
        {applied && job.applied_at ? (
          <time dateTime={job.applied_at} className="tabular-nums">
            {t("applications.appliedOn", { date: applied })}
          </time>
        ) : (
          <span />
        )}
        <span
          aria-hidden="true"
          className="flex items-center gap-0.5 font-medium text-foreground"
        >
          {t("applications.viewJob")}
          <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}
