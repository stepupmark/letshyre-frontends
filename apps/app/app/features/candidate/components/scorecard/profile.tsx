import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { ExternalLink, FileText } from "lucide-react"
import type { ReactNode } from "react"

import { hasItems } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"

type Named =
  | string
  | { name?: string | null; title?: string | null; issuer?: string | null }

const named = (item: Named) =>
  typeof item === "string"
    ? { title: item, issuer: null }
    : { title: item.name ?? item.title ?? "", issuer: item.issuer ?? null }

const linkText = (href: string) => {
  const url = new URL(href)
  return url.host + url.pathname.replace(/\/$/, "")
}

export function Profile({ report }: { report: Scorecard }) {
  const { t } = useTranslation("scorecard")
  const links = (report.candidate_portfolio_links ?? [])
    .map((link) => safeUrl(link))
    .filter((url): url is string => url !== null)
  const resume = safeUrl(report.candidate_resume)
  const awards = [
    ...(report.candidate_certifications ?? []),
    ...(report.candidate_accomplishments ?? []),
  ]
    .map(named)
    .filter((item) => item.title)

  const empty =
    !hasItems(report.candidate_skills) &&
    !hasItems(report.candidate_experience) &&
    !hasItems(report.candidate_education) &&
    !hasItems(report.candidate_projects) &&
    awards.length === 0 &&
    links.length === 0 &&
    !resume

  if (empty)
    return <p className="text-sm text-muted-foreground">{t("profile.empty")}</p>

  return (
    <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
      {hasItems(report.candidate_skills) && (
        <Group title={t("profile.skills")} wide>
          <ul className="flex flex-wrap gap-1.5">
            {report.candidate_skills.map((skill) => (
              <li key={skill}>
                <Badge variant="outline" className="h-7 px-2.5">
                  {skill}
                </Badge>
              </li>
            ))}
          </ul>
        </Group>
      )}
      {hasItems(report.candidate_experience) && (
        <Group title={t("profile.experience")}>
          <Timeline>
            {report.candidate_experience.map((job, i) => (
              <Entry
                key={i}
                title={job.role ?? "—"}
                meta={[job.company, job.duration].filter(Boolean).join(" · ")}
                body={job.description}
              />
            ))}
          </Timeline>
        </Group>
      )}
      {hasItems(report.candidate_education) && (
        <Group title={t("profile.education")}>
          <Timeline>
            {report.candidate_education.map((school, i) => (
              <Entry
                key={i}
                title={school.institution ?? "—"}
                meta={[school.degree, school.duration]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </Timeline>
        </Group>
      )}
      {hasItems(report.candidate_projects) && (
        <Group title={t("profile.projects")}>
          <ul className="flex flex-col gap-4">
            {report.candidate_projects.map((project, i) => (
              <Entry
                key={i}
                title={project.title ?? project.name ?? t("profile.untitled")}
                body={project.description}
              />
            ))}
          </ul>
        </Group>
      )}
      {awards.length > 0 && (
        <Group title={t("profile.awards")}>
          <ul className="flex flex-col gap-2 text-sm">
            {awards.map((award, i) => (
              <li key={i}>
                <span className="font-medium">{award.title}</span>
                {award.issuer && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {award.issuer}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Group>
      )}
      {(links.length > 0 || resume) && (
        <Group title={t("profile.links")}>
          <ul className="flex flex-col gap-1 text-sm">
            {resume && (
              <li>
                <OutLink href={resume} icon={<FileText />}>
                  {t("profile.resume")}
                </OutLink>
              </li>
            )}
            {links.map((href) => (
              <li key={href}>
                <OutLink href={href} icon={<ExternalLink />}>
                  {linkText(href)}
                </OutLink>
              </li>
            ))}
          </ul>
        </Group>
      )}
    </div>
  )
}

function Group({
  title,
  wide = false,
  children,
}: {
  title: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-3", wide && "md:col-span-2")}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}

function Timeline({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-4 border-s ps-4">{children}</ul>
}

function Entry({
  title,
  meta,
  body,
}: {
  title: string
  meta?: string
  body?: string | null
}) {
  return (
    <li className="flex flex-col gap-0.5 text-sm">
      <span className="font-medium">{title}</span>
      {meta && <span className="text-muted-foreground">{meta}</span>}
      {body && (
        <p className="mt-1 max-w-prose text-pretty text-muted-foreground">
          {body}
        </p>
      )}
    </li>
  )
}

function OutLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-sm text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"
    >
      {icon}
      <span className="truncate">{children}</span>
    </a>
  )
}
