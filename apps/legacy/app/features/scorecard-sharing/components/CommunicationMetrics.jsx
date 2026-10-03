import { useTranslation } from "react-i18next";
import { Mic } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ReportSection } from "@/features/scorecard-sharing/components/ReportSection";
import { roundScore } from "@/features/scorecard-sharing/components/shareFormat";

/** The five audio-response metrics scored across the interview, 0-100 each. */
export function CommunicationMetrics({ metrics }) {
  const { t } = useTranslation("sharedScorecard");
  const rows = [
    { key: "clarity", label: t("metrics.clarity"), value: metrics.clarity },
    { key: "relevance", label: t("metrics.relevance"), value: metrics.relevance },
    { key: "confidence", label: t("metrics.confidence"), value: metrics.confidence },
    { key: "depth", label: t("metrics.depth"), value: metrics.depth_of_thought },
    { key: "keyConcept", label: t("metrics.keyConcept"), value: metrics.key_concept_coverage },
  ];

  return (
    <ReportSection id="communication" icon={Mic} title={t("metrics.heading")}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map((row) => {
          const pct = roundScore(row.value);
          return (
            <div key={row.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-text-body">{row.label}</span>
                <span className="font-bold text-text-main">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2 bg-brand-100 [&>*]:bg-brand-600" />
            </div>
          );
        })}
      </div>
    </ReportSection>
  );
}

export default CommunicationMetrics;
