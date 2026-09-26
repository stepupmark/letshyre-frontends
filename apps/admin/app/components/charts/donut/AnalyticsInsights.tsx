import { TrendingUp, Zap, Award, Code2 } from "lucide-react";
import type { ChartSlice } from "../../../lib/chartTransformers";

interface Props {
  skillsData: ChartSlice[];
  technologyData: ChartSlice[];
}

function getTopTwo(data: ChartSlice[]): string {
  if (data.length === 0) return "—";
  if (data.length === 1) return data[0].label;
  return `${data[0].label} & ${data[1].label}`;
}

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  iconBg: string;
}

function InsightCard({
  icon,
  label,
  value,
  sub,
  gradient,
  iconBg,
}: InsightCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-background/20 px-5 py-4 shadow-xs ${gradient}`}
    >
      <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-card opacity-20 blur-2xl" />

      <div className="relative flex items-start gap-3.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="mb-0.5 text-[10px] font-semibold tracking-widest uppercase opacity-70">
            {label}
          </p>
          <p className="truncate text-sm leading-tight font-bold">{value}</p>
          {sub && (
            <p className="mt-0.5 truncate text-[11px] opacity-60">{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsInsights({
  skillsData,
  technologyData,
}: Props) {
  const topSkill = skillsData[0];
  const topTech = technologyData[0];

  if (!topSkill && !topTech) return null;

  return (
    <div className="mt-6">
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        Key Insights
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {topSkill && (
          <InsightCard
            icon={
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            }
            label="Most Common Skill"
            value={`${topSkill.label} (${topSkill.percentage}%)`}
            sub={`${topSkill.count} candidate${topSkill.count !== 1 ? "s" : ""}`}
            gradient="bg-linear-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/10 text-indigo-900 dark:text-indigo-100"
            iconBg="bg-indigo-100 dark:bg-indigo-900/50"
          />
        )}
        {technologyData.length > 0 && (
          <InsightCard
            icon={
              <Zap className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            }
            label="Top Technologies"
            value={`${getTopTwo(technologyData)} dominate`}
            sub={`${technologyData.length} technologies tracked`}
            gradient="bg-linear-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/30 dark:to-violet-800/10 text-violet-900 dark:text-violet-100"
            iconBg="bg-violet-100 dark:bg-violet-900/50"
          />
        )}
        {skillsData.length > 0 && (
          <InsightCard
            icon={
              <Award className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            }
            label="Skill Diversity"
            value={`${skillsData.length} unique skill${skillsData.length !== 1 ? "s" : ""}`}
            sub={`Spread across ${skillsData.reduce((s, d) => s + d.count, 0)} candidates`}
            gradient="bg-linear-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-800/10 text-amber-900 dark:text-amber-100"
            iconBg="bg-amber-100 dark:bg-amber-900/50"
          />
        )}
        {topTech && (
          <InsightCard
            icon={
              <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            }
            label="Leading Technology"
            value={topTech.label}
            sub={`${topTech.percentage}% of candidates`}
            gradient="bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/10 text-emerald-900 dark:text-emerald-100"
            iconBg="bg-emerald-100 dark:bg-emerald-900/50"
          />
        )}
      </div>
    </div>
  );
}
