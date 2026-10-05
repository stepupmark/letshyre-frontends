import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { Briefcase, Building2, Clock, IndianRupee, MapPin } from "lucide-react"
import type { ReactNode } from "react"

import { safeUrl } from "@/lib/safe-url"

import { companyOf, logoOf, type Job } from "./api"

const humanize = (value: string) =>
  value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())

// "6-10", "6-10 LPA" and "6 - 10 lpa" all read as "6–10 LPA"
const salaryOf = (raw: string) =>
  `${raw
    .replace(/\s*lpa$/i, "")
    .replace(/\s*-\s*/, "–")
    .trim()} LPA`

const experienceOf = (raw: string | number) =>
  String(raw)
    .replace(/\s*(years?|yrs?)$/i, "")
    .replace(/\s*-\s*/, "–")
    .trim()

export function CompanyLogo({
  job,
  size = "md",
}: {
  job: Job
  size?: "md" | "lg"
}) {
  const { t } = useTranslation("candidateJobs")
  const company = companyOf(job) ?? t("company")
  const logo = safeUrl(logoOf(job))
  return (
    <Avatar
      className={cn(
        "rounded-lg after:rounded-lg",
        size === "lg" ? "size-14" : "size-10"
      )}
    >
      {logo && (
        <AvatarImage src={logo} alt="" className="rounded-lg object-contain" />
      )}
      <AvatarFallback className="rounded-lg text-xs text-foreground">
        {company.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

/** Where, how long, how much: only the facts the job actually has. */
export function JobFacts({ job, className }: { job: Job; className?: string }) {
  const { t } = useTranslation("candidateJobs")
  const facts: { key: string; icon: ReactNode; label: string }[] = []
  if (job.location)
    facts.push({ key: "place", icon: <MapPin />, label: job.location })
  if (job.experience_required != null && job.experience_required !== "") {
    const years = experienceOf(job.experience_required)
    facts.push({
      key: "years",
      icon: <Briefcase />,
      label: years === "0" ? t("facts.fresher") : t("facts.years", { years }),
    })
  }
  if (job.salary_range)
    facts.push({
      key: "pay",
      icon: <IndianRupee />,
      label: salaryOf(job.salary_range),
    })
  if (job.employment_type)
    facts.push({
      key: "type",
      icon: <Clock />,
      label: t(`types.${job.employment_type}`, {
        defaultValue: humanize(job.employment_type),
      }),
    })
  if (job.industry_type)
    facts.push({
      key: "industry",
      icon: <Building2 />,
      label: job.industry_type,
    })

  if (facts.length === 0) return null
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground",
        className
      )}
    >
      {facts.map((fact) => (
        <li
          key={fact.key}
          className="flex items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:shrink-0"
          dir={fact.key === "pay" ? "ltr" : undefined}
        >
          {fact.icon}
          {fact.label}
        </li>
      ))}
    </ul>
  )
}

export function SkillList({ skills, max }: { skills: string[]; max?: number }) {
  const { t } = useTranslation("candidateJobs")
  const shown = max ? skills.slice(0, max) : skills
  const rest = skills.length - shown.length
  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((skill) => (
        <li key={skill}>
          <Badge variant="outline">{skill}</Badge>
        </li>
      ))}
      {rest > 0 && (
        <li>
          <Badge variant="ghost" className="text-muted-foreground">
            {t("moreSkills", { count: rest })}
          </Badge>
        </li>
      )}
    </ul>
  )
}

/** Everything about a job, for the side panel. */
export function JobDetail({ job }: { job: Job }) {
  const { t } = useTranslation("candidateJobs")
  const skills = job.skills_required ?? []
  return (
    <div
      key={job.id}
      className="flex animate-in flex-col gap-6 duration-200 fade-in motion-reduce:animate-none"
    >
      <JobFacts job={job} className="flex-col" />
      {skills.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">{t("detail.skills")}</h3>
          <SkillList skills={skills} />
        </section>
      )}
      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{t("detail.about")}</h3>
        <p className="text-pretty whitespace-pre-line text-muted-foreground">
          {job.description?.trim()
            ? job.description
            : t("detail.noDescription")}
        </p>
      </section>
    </div>
  )
}
