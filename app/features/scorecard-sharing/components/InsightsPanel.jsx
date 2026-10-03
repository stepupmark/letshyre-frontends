import { useTranslation } from "react-i18next";
import { CheckCircle2, TrendingUp, Lightbulb, ClipboardList } from "lucide-react";
import { ReportSection } from "@/features/scorecard-sharing/components/ReportSection";

function InsightList({ icon, iconClassName, items }) {
  const Icon = icon;
  if (!items?.length) return null;
  return (
    <ul className="m-0 flex flex-col gap-2.5 p-0">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-body">
          <Icon size={16} strokeWidth={2.2} className={`mt-0.5 shrink-0 ${iconClassName}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Strengths, growth areas, and recommendations pulled from the AI evaluation. */
export function InsightsPanel({ strengths, areasForImprovement, recommendations }) {
  const { t } = useTranslation("sharedScorecard");
  const hasContent = strengths?.length || areasForImprovement?.length || recommendations?.length;
  if (!hasContent) return null;

  return (
    <ReportSection id="insights" icon={ClipboardList} title={t("insights.heading")}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-sm font-bold text-text-main">{t("insights.strengths")}</h3>
          <InsightList icon={CheckCircle2} iconClassName="text-success" items={strengths} />
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-sm font-bold text-text-main">{t("insights.areasForImprovement")}</h3>
          <InsightList icon={TrendingUp} iconClassName="text-warning" items={areasForImprovement} />
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-sm font-bold text-text-main">{t("insights.recommendations")}</h3>
          <InsightList icon={Lightbulb} iconClassName="text-brand-600" items={recommendations} />
        </div>
      </div>
    </ReportSection>
  );
}

export default InsightsPanel;
