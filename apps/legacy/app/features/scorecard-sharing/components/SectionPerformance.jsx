import { useTranslation } from "react-i18next";
import { ListChecks } from "lucide-react";
import { ReportSection } from "@/features/scorecard-sharing/components/ReportSection";
import {
  roundScore,
  scoreTone,
  sectionSummaryList,
} from "@/features/scorecard-sharing/components/shareFormat";

const TONE_TEXT = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function SectionPerformance({ sectionSummary }) {
  const { t } = useTranslation("sharedScorecard");
  const sections = sectionSummaryList(sectionSummary);
  if (sections.length === 0) return null;

  return (
    <ReportSection
      id="sections"
      icon={ListChecks}
      title={t("sections.heading")}
    >
      <div className="flex flex-wrap justify-center gap-3">
        {sections.map((section) => {
          const pct = roundScore(section.section_score);
          return (
            <div
              key={section.key}
              className="flex w-[calc(50%-0.375rem)] flex-col items-center gap-1.5 rounded-md border border-border-soft bg-bg-subtle px-3 py-4 text-center sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(20%-0.6rem)]"
            >
              <span
                className={`text-2xl font-bold ${TONE_TEXT[scoreTone(pct)]}`}
              >
                {pct}%
              </span>
              <span className="text-xs font-semibold tracking-wide text-text-muted uppercase">
                {t(`sections.types.${section.key}`)}
              </span>
              <span className="text-xs text-text-faint">
                {t("sections.correctOf", {
                  correct: section.correct,
                  count: section.count,
                })}
              </span>
            </div>
          );
        })}
      </div>
    </ReportSection>
  );
}

export default SectionPerformance;
