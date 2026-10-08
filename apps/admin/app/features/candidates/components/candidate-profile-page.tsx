import type { ReactNode } from "react"
import { Link, useParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { DetailList } from "@/components/detail-list"
import { DocumentList } from "@/components/document-viewer"
import { ExternalLink } from "@/components/external-link"
import { ErrorState } from "@/components/feedback/error-state"
import { SensitiveValue } from "@/components/sensitive-value"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Copyable } from "@/components/copyable"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { formatCurrency, formatDate, initials } from "@/lib/format"
import { safeExternalUrl } from "@/lib/safe-url"
import { candidatesQueries } from "../queries/candidates.queries"
import type { CandidateProfile } from "../schemas/candidates.schema"
import { CandidateDecision } from "./candidate-decision"

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

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function Timeline({
  items,
}: {
  items: { key: string; title: ReactNode; meta: ReactNode; body?: ReactNode }[]
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.key}>
          {index > 0 && <Separator className="mb-4" />}
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.meta}</p>
          {item.body && (
            <div className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
              {item.body}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function range(start: unknown, end: unknown) {
  return [start, end || "Present"].filter(Boolean).join(" – ")
}

function Profile({ profile }: { profile: CandidateProfile }) {
  const documents = [
    { label: "Resume", url: profile.resume_url },
    { label: "Resignation letter", url: profile.resignation_letter },
    { label: "Experience letter", url: profile.experience_letter },
    { label: "Current offer letter", url: profile.present_offer },
    { label: "Notice period proof", url: profile.notice_period_prof },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="grid h-fit gap-4 xl:col-span-2">
        <Section title="Experience">
          {profile.experience.length ? (
            <Timeline
              items={profile.experience.map((job, index) => ({
                key: `${job.company}-${index}`,
                title: [job.role, job.company].filter(Boolean).join(" at "),
                meta: range(
                  job.start_date && formatDate(job.start_date),
                  job.end_date && formatDate(job.end_date)
                ),
                body: job.description,
              }))}
            />
          ) : (
            <Empty>No work experience added.</Empty>
          )}
        </Section>

        <Section title="Education">
          {profile.education.length ? (
            <Timeline
              items={profile.education.map((school, index) => ({
                key: `${school.institution}-${index}`,
                title: school.institution || "Institution",
                meta: [
                  [school.degree ?? school.level, school.field ?? school.stream]
                    .filter(Boolean)
                    .join(", "),
                  range(school.start_year, school.end_year),
                  school.percentage && `${school.percentage}%`,
                ]
                  .filter(Boolean)
                  .join(" · "),
              }))}
            />
          ) : (
            <Empty>No education added.</Empty>
          )}
        </Section>

        <Section title="Projects">
          {profile.projects.length ? (
            <Timeline
              items={profile.projects.map((project, index) => ({
                key: `${project.title}-${index}`,
                title: project.title || "Untitled project",
                meta: (
                  <span className="flex flex-wrap gap-3">
                    {project.tech_stack.join(", ")}
                    <ExternalLink
                      href={project.live_url}
                      className="text-brand-text underline-offset-4 hover:underline"
                    >
                      Live
                    </ExternalLink>
                    <ExternalLink
                      href={project.github_url}
                      className="text-brand-text underline-offset-4 hover:underline"
                    >
                      Source
                    </ExternalLink>
                  </span>
                ),
                body: project.description,
              }))}
            />
          ) : (
            <Empty>No projects added.</Empty>
          )}
        </Section>

        {profile.cover_letter && (
          <Section title="Cover letter">
            <p className="text-sm whitespace-pre-line">
              {profile.cover_letter}
            </p>
          </Section>
        )}
      </div>

      <div className="grid h-fit gap-4">
        <Section title="Personal">
          <DetailList
            items={[
              {
                label: "Email",
                value: <Copyable value={profile.email} label="Email" />,
              },
              {
                label: "Phone",
                value: (
                  <Copyable value={profile.phone_number} label="Phone number" />
                ),
              },
              {
                label: "Date of birth",
                value: profile.dob && formatDate(profile.dob),
              },
              { label: "Gender", value: profile.gender },
              { label: "Location", value: profile.location },
              { label: "Address", value: profile.address },
              {
                label: "Aadhaar",
                value: (
                  <SensitiveValue
                    label="Aadhaar"
                    value={profile.aadhar_number}
                  />
                ),
              },
              { label: "Joined", value: formatDate(profile.created_at) },
            ]}
          />
        </Section>

        <Section title="Job preferences">
          <DetailList
            items={[
              { label: "Industry", value: profile.preferred_industry },
              {
                label: "Locations",
                value: profile.preferred_locations.join(", "),
              },
              {
                label: "Current CTC",
                value:
                  profile.current_ctc && formatCurrency(profile.current_ctc),
              },
              {
                label: "Expected CTC",
                value:
                  profile.expected_ctc && formatCurrency(profile.expected_ctc),
              },
              { label: "Notice period", value: profile.notice_period },
              {
                label: "Last company",
                value: profile.present_or_last_working_company,
              },
              {
                label: "Last working day",
                value:
                  profile.last_day_of_working &&
                  formatDate(profile.last_day_of_working),
              },
            ]}
          />
        </Section>

        <Section title="Skills">
          {profile.skills.length ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <Empty>No skills added.</Empty>
          )}
        </Section>

        <Section title="Documents">
          <DocumentList documents={documents} />
        </Section>
      </div>
    </div>
  )
}

export function CandidateProfilePage() {
  const { id = "" } = useParams()
  const profile = useQuery(candidatesQueries.profile(id))
  useDocumentTitle(
    profile.data && `${profile.data.name || "Unnamed candidate"} · Candidates`
  )

  const back = (
    <Button
      variant="ghost"
      size="sm"
      className="-ms-2 mb-4"
      nativeButton={false}
      render={<Link to="/dashboard/candidates" />}
    >
      <ArrowLeft /> Candidates
    </Button>
  )

  if (profile.isError)
    return (
      <>
        {back}
        <ErrorState
          error={profile.error}
          onRetry={() => void profile.refetch()}
        />
      </>
    )

  if (!profile.data)
    return (
      <>
        {back}
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </>
    )

  const data = profile.data

  return (
    <>
      {back}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={safeExternalUrl(data.profile_photo)} alt="" />
            <AvatarFallback>{initials(data.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-brand-text">
              {data.name || "Unnamed candidate"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {[data.role, `${data.profile_completion_score}% complete`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <CandidateDecision profile={data} />
      </div>
      <Profile profile={data} />
    </>
  )
}
