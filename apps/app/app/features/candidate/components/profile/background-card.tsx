import { useTranslation } from "@workspace/i18n/react"
import {
  Award,
  BriefcaseBusiness,
  FileText,
  FolderGit2,
  GraduationCap,
  Sparkles,
} from "lucide-react"

import { skillsOf } from "../../lib/profile-format"
import type { Profile } from "../../schemas/candidate.schema"
import {
  AwardList,
  JobList,
  ProjectList,
  SchoolList,
  SkillList,
} from "./background-lists"
import { BackgroundTabs, type BackgroundTab } from "./background-tabs"
import { DocumentList, type Doc } from "./documents"

/** Read-only tabs; a kind the candidate hasn't filled in gets no tab. */
export function BackgroundCard({
  jobs,
  schools,
  projects,
  skills,
  awards,
  docs,
  empty,
}: {
  jobs: Profile["candidate_experience"]
  schools: Profile["candidate_education"]
  projects: Profile["candidate_projects"]
  skills: Profile["candidate_skills"]
  awards: Profile["candidate_certifications"]
  docs: Doc[]
  empty: string
}) {
  const { t } = useTranslation("candidate")
  const names = skillsOf(skills)
  const certificates = (awards ?? []).filter(Boolean)

  const tabs: BackgroundTab[] = [
    {
      key: "experience",
      label: t("profile.work"),
      icon: BriefcaseBusiness,
      count: jobs?.length ?? 0,
      content: <JobList jobs={jobs ?? []} />,
    },
    {
      key: "education",
      label: t("profile.education"),
      icon: GraduationCap,
      count: schools?.length ?? 0,
      content: <SchoolList schools={schools ?? []} />,
    },
    {
      key: "skills",
      label: t("profile.skills"),
      icon: Sparkles,
      count: names.length,
      content: <SkillList skills={names} />,
    },
    {
      key: "projects",
      label: t("profile.projects"),
      icon: FolderGit2,
      count: projects?.length ?? 0,
      content: <ProjectList projects={projects ?? []} />,
    },
    {
      key: "awards",
      label: t("profile.awards"),
      icon: Award,
      count: certificates.length,
      content: <AwardList awards={certificates} />,
    },
    {
      key: "documents",
      label: t("profile.documents"),
      icon: FileText,
      count: docs.length,
      content: <DocumentList docs={docs} />,
    },
  ].filter((tab) => tab.count > 0)

  if (tabs.length === 0)
    return (
      <p className="rounded-lg border p-6 text-sm text-muted-foreground">
        {empty}
      </p>
    )

  return <BackgroundTabs label={t("profile.background")} tabs={tabs} />
}
