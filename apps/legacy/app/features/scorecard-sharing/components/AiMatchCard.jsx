import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ReportSection } from "@/features/scorecard-sharing/components/ReportSection";
import { roundScore } from "@/features/scorecard-sharing/components/shareFormat";

function MatchBar({ label, value }) {
  const pct = roundScore(value);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-text-body">{label}</span>
        <span className="font-bold text-text-main">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2 bg-brand-100 [&>*]:bg-brand-600" />
    </div>
  );
}

/** How well this candidate fits the job they were matched against, per the AI engine. */
export function AiMatchCard({ aiMatch }) {
  const { t } = useTranslation("sharedScorecard");
  if (!aiMatch) return null;

  return (
    <ReportSection id="ai-match" icon={Sparkles} title={t("aiMatch.heading")} className="h-full">
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-3">
          <MatchBar label={t("aiMatch.overall")} value={aiMatch.ai_matching_score} />
          <MatchBar label={t("aiMatch.role")} value={aiMatch.role_match_score} />
          <MatchBar label={t("aiMatch.skills")} value={aiMatch.skills_match_score} />
        </div>
        {aiMatch.rationale && (
          <p className="m-0 rounded-md bg-bg-subtle px-4 py-3 text-sm leading-relaxed text-text-body">
            {aiMatch.rationale}
          </p>
        )}
      </div>
    </ReportSection>
  );
}

export default AiMatchCard;
