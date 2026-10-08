import type { ReactNode } from "react"
import { Link, useParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, FileText } from "lucide-react"
import { DetailList } from "~/components/detail-list"
import { ExternalLink } from "~/components/external-link"
import { ErrorState } from "~/components/feedback/error-state"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { useDocumentTitle } from "~/hooks/use-document-title"
import { formatDate } from "~/lib/format"
import { jobsQueries } from "../queries/jobs.queries"
import type { JobDetail } from "../schemas/jobs.schema"
import { ApprovalBadge, JobStatusBadge } from "./job-badges"
import { JobReview } from "./job-review"

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function between(
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string
) {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${min}–${max} ${unit}`
  return `${min ?? max} ${unit}`
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  )
}

function Details({ job }: { job: JobDetail }) {
  const place =
    [job.city, job.state, job.country].filter(Boolean).join(", ") ||
    job.location

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="grid h-fit gap-4 xl:col-span-2">
        <Section title="Description">
          <p className="text-sm whitespace-pre-line">
            {job.description || "No description."}
          </p>
          {job.jd_file_url && (
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <ExternalLink
                href={job.jd_file_url}
                fallback={
                  <span className="text-xs text-muted-foreground">
                    Invalid JD link
                  </span>
                }
              >
                <FileText /> Job description file
              </ExternalLink>
            </Button>
          )}
        </Section>
        {job.responsibilities.length > 0 && (
          <Section title="Responsibilities">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        )}
        {job.questions.length > 0 && (
          <Section title="Screening questions">
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {job.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </Section>
        )}
      </div>

      <div className="grid h-fit gap-4">
        <Section title="Overview">
          <DetailList
            items={[
              { label: "Location", value: place },
              {
                label: "Work mode",
                value: job.work_mode && (
                  <span className="capitalize">{job.work_mode}</span>
                ),
              },
              {
                label: "Employment",
                value: job.employment_type && (
                  <span className="capitalize">
                    {job.employment_type.replace(/_/g, " ")}
                  </span>
                ),
              },
              { label: "Industry", value: job.industry_type },
              {
                label: "Salary",
                value:
                  between(job.salary_min_lpa, job.salary_max_lpa, "LPA") ??
                  job.salary_range,
              },
              {
                label: "Experience",
                value:
                  between(
                    job.experience_min_years,
                    job.experience_max_years,
                    "years"
                  ) ?? job.experience_required,
              },
              { label: "Openings", value: job.number_of_openings },
              { label: "Education", value: job.minimum_education },
              { label: "Specialisation", value: job.specialization },
              {
                label: "Apply by",
                value:
                  (job.application_deadline || job.deadline) &&
                  formatDate(job.application_deadline || job.deadline),
              },
            ]}
          />
        </Section>
        {job.skills_required.length > 0 && (
          <Section title="Skills">
            <Tags items={job.skills_required} />
          </Section>
        )}
        {job.keywords.length > 0 && (
          <Section title="Keywords">
            <Tags items={job.keywords} />
          </Section>
        )}
      </div>
    </div>
  )
}

export function JobDetailPage() {
  const { id = "" } = useParams()
  const job = useQuery(jobsQueries.detail(id))
  useDocumentTitle(job.data && `${job.data.title || "Untitled job"} · Jobs`)

  const back = (
    <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
      <Link to="/dashboard/jobs">
        <ArrowLeft /> Jobs
      </Link>
    </Button>
  )

  if (job.isError)
    return (
      <>
        {back}
        <ErrorState error={job.error} onRetry={() => void job.refetch()} />
      </>
    )

  if (!job.data)
    return (
      <>
        {back}
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </>
    )

  const data = job.data

  return (
    <>
      {back}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.title || "Untitled job"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ApprovalBadge status={data.approval} />
            <JobStatusBadge status={data.status} />
            <span>
              Posted {formatDate(data.job_posted_date || data.created_at)}
            </span>
          </div>
        </div>
        <JobReview jobIds={[data.id]} approval={data.approval} />
      </div>
      <Details job={data} />
    </>
  )
}
