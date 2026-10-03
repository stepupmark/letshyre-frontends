import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Sparkles,
  FolderGit2,
  Briefcase,
  Award,
  FileText,
} from "lucide-react";
import { ProfileSectionsView } from "@/features/candidate-profile/components/ProfileSectionsView";
import {
  EducationPanel,
  SkillsPanel,
  ProjectsPanel,
  ExperiencePanel,
  CertificationsPanel,
  DocumentsPanel,
} from "@/features/employer/components/candidate-profile-view/CandidateSectionContent";

// Certifications is only offered when present; every other section renders its
// own empty state.
const buildSections = (profile, t) => {
  const sections = [
    {
      key: "education",
      label: t("candidateProfile.sections.education"),
      icon: GraduationCap,
      panel: <EducationPanel items={profile.education} />,
    },
    {
      key: "skills",
      label: t("candidateProfile.sections.skills"),
      icon: Sparkles,
      panel: <SkillsPanel items={profile.skills} />,
    },
    {
      key: "projects",
      label: t("candidateProfile.sections.projects"),
      icon: FolderGit2,
      panel: <ProjectsPanel items={profile.projects} />,
    },
    {
      key: "experience",
      label: t("candidateProfile.sections.experience"),
      icon: Briefcase,
      panel: <ExperiencePanel items={profile.experience} />,
    },
  ];

  if (profile.certifications.length > 0) {
    sections.push({
      key: "certifications",
      label: t("candidateProfile.sections.certifications"),
      icon: Award,
      panel: <CertificationsPanel items={profile.certifications} />,
    });
  }

  sections.push({
    key: "documents",
    label: t("candidateProfile.sections.documents"),
    icon: FileText,
    panel: <DocumentsPanel profile={profile} />,
  });

  return sections;
};

export function CandidateSections({ profile }) {
  const { t } = useTranslation("employerCandidates");
  return (
    <ProfileSectionsView
      sections={buildSections(profile, t)}
      tablistLabel={t("candidateProfile.sectionsLabel")}
    />
  );
}

export default CandidateSections;
