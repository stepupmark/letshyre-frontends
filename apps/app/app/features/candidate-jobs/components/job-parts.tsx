import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import {
  BriefcaseBusiness,
  Layers,
  MapPin,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { StatusBadge, type Tone } from "@/components/status-badge"
import { safeUrl } from "@/lib/safe-url"

import { useJobFacts } from "../hooks/use-job-facts"
import { companyOf, logoOf } from "../lib/candidate-jobs"
import { statusOf, type Status } from "../lib/job-facts"
import { matches, termsOf } from "../lib/match"
import { type Job } from "../schemas/candidate-jobs.schema"

const STATUS_TONE: Record<Status, Tone> = {
  Applied: "info",
  Shortlisted: "info",
  Reserved: "neutral",
  Selected: "success",
  Hired: "success",
  Rejected: "neutral",
}

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
        "shrink-0 rounded-lg border after:rounded-lg after:border-0",
        size === "lg" ? "size-14" : "size-11"
      )}
    >
      {logo && (
        <AvatarImage
          src={logo}
          alt=""
          className="rounded-lg bg-background object-contain p-1"
        />
      )}
      <AvatarFallback className="rounded-lg bg-muted text-sm font-medium text-foreground">
        {company.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export function ApplicationStatus({ status }: { status: string }) {
  const { t } = useTranslation("candidateJobs")
  const known = statusOf(status) ?? "Applied"
  return (
    <StatusBadge tone={STATUS_TONE[known]}>{t(`status.${known}`)}</StatusBadge>
  )
}

export function JobFacts({ job, className }: { job: Job; className?: string }) {
  const facts = useJobFacts(job)
  const items: { key: string; icon: LucideIcon; label: string | null }[] = [
    { key: "years", icon: BriefcaseBusiness, label: facts.experience },
    { key: "pay", icon: Wallet, label: facts.salary },
    { key: "place", icon: MapPin, label: facts.location },
    { key: "type", icon: Layers, label: facts.type },
  ]
  const shown = items.filter((item) => item.label)
  if (shown.length === 0) return null
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground",
        className
      )}
    >
      {shown.map(({ key, icon: Icon, label }) => (
        <li
          key={key}
          className="flex min-w-0 items-center gap-1.5 tabular-nums"
          dir={key === "pay" ? "ltr" : undefined}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </li>
      ))}
    </ul>
  )
}

export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = termsOf(query)
  if (terms.length === 0) return text
  const pattern = new RegExp(
    `(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  )
  return text.split(pattern).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-xs bg-primary/10 text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function SkillList({
  skills,
  query = "",
  max,
}: {
  skills: string[]
  query?: string
  max?: number
}) {
  const { t } = useTranslation("candidateJobs")
  const sorted = [
    ...skills.filter((skill) => matches(skill, query)),
    ...skills.filter((skill) => !matches(skill, query)),
  ]
  const shown = max ? sorted.slice(0, max) : sorted
  const rest = skills.length - shown.length
  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((skill) => (
        <li
          key={skill}
          className={cn(
            "rounded-md border px-2 py-0.5 text-xs",
            matches(skill, query)
              ? "border-primary/30 bg-primary/5 font-medium text-foreground"
              : "text-muted-foreground"
          )}
        >
          {skill}
        </li>
      ))}
      {rest > 0 && (
        <li className="px-1 py-0.5 text-xs text-muted-foreground tabular-nums">
          {t("moreSkills", { count: rest })}
        </li>
      )}
    </ul>
  )
}
