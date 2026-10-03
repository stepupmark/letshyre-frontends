import { Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  EducationPanel as SharedEducationPanel,
  SkillsPanel as SharedSkillsPanel,
  ProjectsPanel as SharedProjectsPanel,
  ExperiencePanel as SharedExperiencePanel,
  DocumentsPanel as SharedDocumentsPanel,
  EmptyState,
  EntryCard,
  EntryList,
} from "@/features/candidate-profile/components/SectionPanels";

export function EducationPanel({ items }) {
  const { t } = useTranslation("employerCandidates");
  return (
    <SharedEducationPanel
      items={items}
      emptyMessage={t("candidateProfile.empty.education")}
      fallbackInstitution="—"
    />
  );
}

export function SkillsPanel({ items }) {
  const { t } = useTranslation("employerCandidates");
  return <SharedSkillsPanel items={items} emptyMessage={t("candidateProfile.empty.skills")} />;
}

export function ProjectsPanel({ items }) {
  const { t } = useTranslation("employerCandidates");
  return (
    <SharedProjectsPanel
      items={items}
      emptyMessage={t("candidateProfile.empty.projects")}
      fallbackTitle={t("candidateProfile.untitledProject")}
    />
  );
}

export function ExperiencePanel({ items }) {
  const { t } = useTranslation("employerCandidates");
  return (
    <SharedExperiencePanel
      items={items}
      emptyMessage={t("candidateProfile.empty.experience")}
      fallbackRole="—"
    />
  );
}

export function CertificationsPanel({ items }) {
  const { t } = useTranslation("employerCandidates");
  if (!items.length)
    return <EmptyState message={t("candidateProfile.empty.certifications")} />;
  return (
    <EntryList>
      {items.map((cert, i) => (
        <EntryCard
          key={i}
          icon={Award}
          title={
            typeof cert === "string"
              ? cert
              : cert.name || t("candidateProfile.certificationFallback")
          }
          subtitle={cert.issuer}
        />
      ))}
    </EntryList>
  );
}

export function DocumentsPanel({ profile }) {
  const { t } = useTranslation("employerCandidates");
  const docs = [
    { href: profile.resume, label: t("candidateProfile.resume") },
    { href: profile.notice_period_prof, label: t("candidateProfile.noticeProof") },
  ];
  return (
    <SharedDocumentsPanel docs={docs} emptyMessage={t("candidateProfile.empty.documents")} />
  );
}
