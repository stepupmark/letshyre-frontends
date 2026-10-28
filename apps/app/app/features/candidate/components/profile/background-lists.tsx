import { useLocale } from "@workspace/i18n/react"
import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  FolderGit2,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

import { durationOf, titleOf } from "../../lib/profile-format"

type Text = string | null | undefined
export interface Job {
  role?: Text
  company?: Text
  duration?: Text
  description?: Text
}
export interface School {
  institution?: Text
  degree?: Text
  duration?: Text
}
export interface Project {
  title?: Text
  name?: Text
  description?: Text
}
type Named = Parameters<typeof titleOf>[0]

const keyOf = (...parts: Text[]) => parts.filter(Boolean).join("|")

function Row({
  icon: Icon,
  index,
  rail = false,
  title,
  subtitle,
  meta,
  children,
}: {
  icon: LucideIcon
  index: number
  rail?: boolean
  title: string
  subtitle?: Text
  meta?: Text
  children?: ReactNode
}) {
  return (
    <m.li
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: duration.slow,
        ease,
        delay: Math.min(index, 6) * 0.04,
      }}
      className="group/row relative flex gap-4 pb-7 last:pb-0 print:transform-none! print:opacity-100!"
    >
      {rail && (
        <m.span
          aria-hidden="true"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: duration.slow, ease, delay: 0.12 }}
          className="absolute inset-s-5.5 top-13 bottom-1.5 w-px origin-top bg-border group-last/row:hidden print:transform-none!"
        />
      )}
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand-muted text-brand-text transition-transform group-hover/row:scale-105 motion-reduce:transition-none [&_svg]:size-5"
      >
        <Icon />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
        <p className="text-base font-semibold text-pretty">{title}</p>
        {subtitle && (
          <p className="text-sm font-medium text-pretty text-brand-text">
            {subtitle}
          </p>
        )}
        {meta && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
            <CalendarDays aria-hidden="true" />
            {meta}
          </p>
        )}
        {children}
      </div>
    </m.li>
  )
}

export function JobList({ jobs }: { jobs: Job[] }) {
  const locale = useLocale()
  return (
    <ol className="flex flex-col">
      {jobs.map((job, i) => (
        <Row
          key={keyOf(job.role, job.company, job.duration)}
          icon={BriefcaseBusiness}
          index={i}
          rail
          title={job.role ?? "—"}
          subtitle={job.company}
          meta={durationOf(job.duration, locale)}
        >
          {job.description && (
            <p className="mt-2 max-w-prose text-sm text-pretty text-muted-foreground">
              {job.description}
            </p>
          )}
        </Row>
      ))}
    </ol>
  )
}

export function SchoolList({ schools }: { schools: School[] }) {
  const locale = useLocale()
  return (
    <ol className="flex flex-col">
      {schools.map((school, i) => (
        <Row
          key={keyOf(school.institution, school.degree, school.duration)}
          icon={GraduationCap}
          index={i}
          rail
          title={school.institution ?? "—"}
          subtitle={school.degree}
          meta={durationOf(school.duration, locale)}
        />
      ))}
    </ol>
  )
}

export function ProjectList({
  projects,
  untitled,
}: {
  projects: Project[]
  untitled: string
}) {
  return (
    <ul className="flex flex-col">
      {projects.map((project, i) => {
        const title = project.title ?? project.name
        return (
          <Row
            key={keyOf(title, project.description)}
            icon={FolderGit2}
            index={i}
            title={title ?? untitled}
          >
            {project.description && (
              <p className="mt-1 max-w-prose text-sm text-pretty text-muted-foreground">
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
    <ul className="flex flex-col">
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
        <m.li
          key={skill}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: duration.base,
            ease,
            delay: Math.min(i, 10) * 0.03,
          }}
          className="print:transform-none! print:opacity-100!"
        >
          <span className="inline-flex items-center rounded-lg border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand-text">
            {skill}
          </span>
        </m.li>
      ))}
    </ul>
  )
}
