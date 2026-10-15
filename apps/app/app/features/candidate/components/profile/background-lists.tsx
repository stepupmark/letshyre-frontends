import { useTranslation } from "@workspace/i18n/react"
import {
  Award,
  BriefcaseBusiness,
  FolderGit2,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"

import { titleOf } from "../../lib/profile-format"
import type { Profile } from "../../schemas/candidate.schema"

export type Job = NonNullable<Profile["candidate_experience"]>[number]
export type School = NonNullable<Profile["candidate_education"]>[number]
export type Project = NonNullable<Profile["candidate_projects"]>[number]
type Named = Parameters<typeof titleOf>[0]

const keyOf = (...parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join("|")

function Row({
  icon: Icon,
  index,
  title,
  subtitle,
  meta,
  children,
}: {
  icon: LucideIcon
  index: number
  title: string
  subtitle?: string | null
  meta?: string | null
  children?: ReactNode
}) {
  return (
    <li
      className="settle flex gap-4"
      style={{ transitionDelay: `${Math.min(index, 6) * 50}ms` }}
    >
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-text [&_svg]:size-5"
      >
        <Icon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <p className="text-base font-semibold text-pretty">{title}</p>
        {subtitle && (
          <p className="text-sm font-medium text-pretty text-brand-text">
            {subtitle}
          </p>
        )}
        {meta && <p className="text-sm text-muted-foreground">{meta}</p>}
        {children}
      </div>
    </li>
  )
}

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <ol className="flex flex-col gap-6">
      {jobs.map((job, i) => (
        <Row
          key={keyOf(job.role, job.company, job.duration)}
          icon={BriefcaseBusiness}
          index={i}
          title={job.role ?? "—"}
          subtitle={job.company}
          meta={job.duration}
        >
          {job.description && (
            <p className="mt-1.5 max-w-prose text-sm text-pretty">
              {job.description}
            </p>
          )}
        </Row>
      ))}
    </ol>
  )
}

export function SchoolList({ schools }: { schools: School[] }) {
  return (
    <ul className="flex flex-col gap-6">
      {schools.map((school, i) => (
        <Row
          key={keyOf(school.institution, school.degree, school.duration)}
          icon={GraduationCap}
          index={i}
          title={school.institution ?? "—"}
          subtitle={school.degree}
          meta={school.duration}
        />
      ))}
    </ul>
  )
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const { t } = useTranslation("candidate")
  return (
    <ul className="flex flex-col gap-6">
      {projects.map((project, i) => {
        const title = project.title ?? project.name
        return (
          <Row
            key={keyOf(title, project.description)}
            icon={FolderGit2}
            index={i}
            title={title ?? t("profile.untitled")}
          >
            {project.description && (
              <p className="max-w-prose text-sm text-pretty text-muted-foreground">
                {project.description}
              </p>
            )}
          </Row>
        )
      })}
    </ul>
  )
}

export function AwardList({ awards }: { awards: Named[] }) {
  return (
    <ul className="flex flex-col gap-6">
      {awards.map(titleOf).map((award, i) => (
        <Row
          key={keyOf(award.title, award.issuer)}
          icon={Award}
          index={i}
          title={award.title}
          subtitle={award.issuer}
        />
      ))}
    </ul>
  )
}

export function SkillList({ skills }: { skills: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {skills.map((skill, i) => (
        <li
          key={skill}
          className="settle"
          style={{ transitionDelay: `${Math.min(i, 10) * 30}ms` }}
        >
          <span className="inline-flex items-center rounded-lg border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand-text">
            {skill}
          </span>
        </li>
      ))}
    </ul>
  )
}
