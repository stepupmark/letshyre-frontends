import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Sparkles,
  FolderGit2,
  Briefcase,
  FileText,
} from "lucide-react";
import { ProfileSectionsView } from "@/features/candidate-profile/components/ProfileSectionsView";
import {
  EducationPanel,
  SkillsPanel,
  ProjectsPanel,
  ExperiencePanel,
  DocumentsPanel,
} from "@/features/employee/components/profile-view/SectionContent";

// Items are already normalized to arrays by the parent.
const buildSections = (profile, t) => [
  {
    key: "education",
    label: t("profile.sections.education"),
    icon: GraduationCap,
    panel: <EducationPanel items={profile.education} />,
  },
  {
    key: "skills",
    label: t("profile.sections.skills"),
    icon: Sparkles,
    panel: <SkillsPanel items={profile.skills} />,
  },
  {
    key: "projects",
    label: t("profile.sections.projects"),
    icon: FolderGit2,
    panel: <ProjectsPanel items={profile.projects} />,
  },
  {
    key: "experience",
    label: t("profile.sections.experience"),
    icon: Briefcase,
    panel: <ExperiencePanel items={profile.experience} />,
  },
  {
    key: "documents",
    label: t("profile.sections.documents"),
    icon: FileText,
    panel: <DocumentsPanel profile={profile} />,
  },
];

export function ProfileSections({ profile }) {
  const { t } = useTranslation("employee");
  return (
    <ProfileSectionsView
      sections={buildSections(profile, t)}
      tablistLabel={t("profile.sections.tablistAria")}
    />
  );
}

export default ProfileSections;
