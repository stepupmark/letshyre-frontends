import { useTranslation } from "react-i18next";
import { UserRound, GraduationCap, Sparkles, FolderGit2, Briefcase, Award, Link2, FileText } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ReportSection } from "@/features/scorecard-sharing/components/ReportSection";
import { SkillsList } from "@/features/scorecard-sharing/components/profile/SkillsList";
import { EducationList } from "@/features/scorecard-sharing/components/profile/EducationList";
import { ExperienceList } from "@/features/scorecard-sharing/components/profile/ExperienceList";
import { ProjectsList } from "@/features/scorecard-sharing/components/profile/ProjectsList";
import { CertificationsList } from "@/features/scorecard-sharing/components/profile/CertificationsList";
import { PortfolioLinks } from "@/features/scorecard-sharing/components/profile/PortfolioLinks";
import { ResumeLink } from "@/features/scorecard-sharing/components/profile/ResumeLink";

/**
 * The candidate's full profile as a multi-open accordion. Skills and
 * experience open by default since those are what most readers scan for
 * first; the rest is a click away rather than an unbroken scroll.
 */
export function CandidateProfile({ profile }) {
  const { t } = useTranslation("sharedScorecard");

  const groups = [
    { key: "skills", icon: Sparkles, label: t("profile.sections.skills"), content: <SkillsList skills={profile.skills} /> },
    { key: "experience", icon: Briefcase, label: t("profile.sections.experience"), content: <ExperienceList items={profile.experience} /> },
    { key: "education", icon: GraduationCap, label: t("profile.sections.education"), content: <EducationList items={profile.education} /> },
    { key: "projects", icon: FolderGit2, label: t("profile.sections.projects"), content: <ProjectsList items={profile.projects} /> },
    {
      key: "certifications",
      icon: Award,
      label: t("profile.sections.certifications"),
      content: (
        <CertificationsList
          items={profile.certifications}
          emptyMessage={t("profile.empty.certifications")}
          fallbackLabel={t("profile.certificationFallback")}
        />
      ),
    },
    {
      key: "accomplishments",
      icon: Award,
      label: t("profile.sections.accomplishments"),
      content: (
        <CertificationsList
          items={profile.accomplishments}
          emptyMessage={t("profile.empty.accomplishments")}
          fallbackLabel={t("profile.accomplishmentFallback")}
        />
      ),
    },
    { key: "portfolio", icon: Link2, label: t("profile.sections.portfolio"), content: <PortfolioLinks links={profile.portfolioLinks} /> },
    { key: "resume", icon: FileText, label: t("profile.sections.resume"), content: <ResumeLink url={profile.resume} /> },
  ];

  return (
    <ReportSection id="profile" icon={UserRound} title={t("profile.heading")}>
      <Accordion type="multiple" defaultValue={["skills", "experience"]} className="flex flex-col">
        {groups.map(({ key, icon, label, content }) => {
          const Icon = icon;
          return (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-sm font-semibold text-text-main hover:no-underline">
                <span className="inline-flex items-center gap-2.5">
                  <Icon size={17} strokeWidth={2} className="text-brand-600" aria-hidden="true" />
                  {label}
                </span>
              </AccordionTrigger>
              <AccordionContent>{content}</AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </ReportSection>
  );
}

export default CandidateProfile;
