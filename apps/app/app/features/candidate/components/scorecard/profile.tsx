import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import {
  Award,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  FolderGit2,
  GraduationCap,
  Link2,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"

import { skillsOf, titleOf } from "../../lib/profile-format"
import { hasItems } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"
import {
  AwardList,
  JobList,
  ProjectList,
  SchoolList,
  SkillList,
} from "../profile/background-lists"
import { SubHeading } from "./sub-heading"

const linkText = (href: string) => {
  const url = new URL(href)
  return url.host + url.pathname.replace(/\/$/, "")
}

export function Profile({ report }: { report: Scorecard }) {
  const { t } = useTranslation(["scorecard", "common"])
  const skills = skillsOf(report.candidate_skills)
  const links = (report.candidate_portfolio_links ?? [])
    .map((link) => safeUrl(link))
    .filter((url): url is string => url !== null)
  const resume = safeUrl(report.candidate_resume)
  const awards = [
    ...(report.candidate_certifications ?? []),
    ...(report.candidate_accomplishments ?? []),
  ].filter((item) => titleOf(item).title)
  const hasLinks = links.length > 0 || resume !== null

  if (
    skills.length === 0 &&
    !hasItems(report.candidate_education) &&
    !hasItems(report.candidate_experience) &&
    !hasItems(report.candidate_projects) &&
    awards.length === 0 &&
    !hasLinks
  )
    return <p className="text-sm text-muted-foreground">{t("profile.empty")}</p>

  return (
    <div className="flex flex-col divide-y rounded-2xl border">
      {skills.length > 0 && (
        <Group icon={Sparkles} title={t("profile.skills")}>
          <SkillList
            skills={skills}
            limit={12}
            labels={{
              more: t("profile.more", { count: skills.length - 12 }),
              less: t("profile.showLess"),
              all: t("profile.showAll"),
            }}
          />
        </Group>
      )}
      {hasItems(report.candidate_education) && (
        <Group icon={GraduationCap} title={t("profile.education")}>
          <SchoolList schools={report.candidate_education} />
        </Group>
      )}
      {hasItems(report.candidate_experience) && (
        <Group icon={BriefcaseBusiness} title={t("profile.experience")}>
          <JobList jobs={report.candidate_experience} />
        </Group>
      )}
      {hasItems(report.candidate_projects) && (
        <Group icon={FolderGit2} title={t("profile.projects")}>
          <ProjectList
            projects={report.candidate_projects}
            untitled={t("profile.untitled")}
          />
        </Group>
      )}
      {(awards.length > 0 || hasLinks) && (
        <div className="grid divide-y md:auto-cols-fr md:grid-flow-col md:divide-x md:divide-y-0">
          {awards.length > 0 && (
            <Group icon={Award} title={t("profile.awards")}>
              <AwardList awards={awards} />
            </Group>
          )}
          {hasLinks && (
            <Group icon={Link2} title={t("profile.links")}>
              <ul className="flex flex-col gap-1 text-sm">
                {resume && (
                  <li>
                    <OutLink
                      href={resume}
                      icon={FileText}
                      newTab={t("common:empty.newTab")}
                    >
                      {t("profile.resume")}
                    </OutLink>
                  </li>
                )}
                {links.map((href) => (
                  <li key={href}>
                    <OutLink
                      href={href}
                      icon={ExternalLink}
                      newTab={t("common:empty.newTab")}
                    >
                      {linkText(href)}
                    </OutLink>
                  </li>
                ))}
              </ul>
            </Group>
          )}
        </div>
      )}
    </div>
  )
}

function Group({
  icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <SubHeading icon={icon}>{title}</SubHeading>
      {children}
    </div>
  )
}

function OutLink({
  href,
  icon: Icon,
  newTab,
  children,
}: {
  href: string
  icon: LucideIcon
  newTab: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-sm text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"
    >
      <Icon aria-hidden="true" />
      <span className="truncate">{children}</span>
      <span className="sr-only">{newTab}</span>
    </a>
  )
}
