import { useTranslation } from "react-i18next";
import {
  EducationPanel as SharedEducationPanel,
  SkillsPanel as SharedSkillsPanel,
  ProjectsPanel as SharedProjectsPanel,
  ExperiencePanel as SharedExperiencePanel,
  DocumentsPanel as SharedDocumentsPanel,
} from "@/features/candidate-profile/components/SectionPanels";

export function EducationPanel({ items }) {
  const { t } = useTranslation("employee");
  return (
    <SharedEducationPanel
      items={items}
      emptyMessage={t("profile.empty.education")}
      fallbackInstitution={t("profile.dash")}
    />
  );
}

export function SkillsPanel({ items }) {
  const { t } = useTranslation("employee");
  return <SharedSkillsPanel items={items} emptyMessage={t("profile.empty.skills")} />;
}

export function ProjectsPanel({ items }) {
  const { t } = useTranslation("employee");
  return (
    <SharedProjectsPanel
      items={items}
      emptyMessage={t("profile.empty.projects")}
      fallbackTitle={t("profile.untitledProject")}
    />
  );
}

export function ExperiencePanel({ items }) {
  const { t } = useTranslation("employee");
  return (
    <SharedExperiencePanel
      items={items}
      emptyMessage={t("profile.empty.experience")}
      fallbackRole={t("profile.dash")}
    />
  );
}

export function DocumentsPanel({ profile }) {
  const { t } = useTranslation("employee");
  const docs = [
    { href: profile.resume, label: t("profile.docs.resume") },
    { href: profile.experience_letter, label: t("profile.docs.experienceLetter") },
    { href: profile.resignation_letter, label: t("profile.docs.resignationLetter") },
    { href: profile.notice_period_prof, label: t("profile.docs.noticePeriodProof") },
    { href: profile.present_offer, label: t("profile.docs.presentOffer") },
  ];
  return <SharedDocumentsPanel docs={docs} emptyMessage={t("profile.empty.documents")} />;
}
