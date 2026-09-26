import { Info, Users } from "lucide-react";
import { UnlocksDashboardData } from "../../../api/unlocks.api";

const CircularProgress = ({ value }: { value: number }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} className="stroke-indigo-100 dark:stroke-muted-foreground" strokeWidth="5" fill="none" />
        <circle cx="24" cy="24" r={r} className="stroke-indigo-500" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
    </div>
  );
};

export default function EngagementInsights({ engagement }: { engagement: UnlocksDashboardData["engagement"] }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-xs h-full flex flex-col">
      <h3 className="text-sm font-bold text-foreground mb-4 ml-1">
        Engagement Insights
      </h3>
      <div className="flex gap-3 flex-1">
        <div className="flex-1 rounded-2xl border border-border p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-xs font-semibold text-foreground leading-snug">Unique<br/>Employers</span>
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-4xl font-bold text-foreground leading-none mb-1 mt-2">{engagement.unique_employers}</div>
            <div className="text-blue-500 mb-1">
              <Users className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-border p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-xs font-semibold text-foreground leading-snug">Unique<br/>Candidates</span>
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className="text-4xl font-bold text-foreground leading-none mb-1 mt-2">{engagement.unique_candidates}</div>
            <div className="text-blue-500 mb-1">
              <Users className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-border p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-xs font-semibold text-foreground leading-snug whitespace-nowrap">Avg AI Score</span>
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-baseline gap-1 mb-1 mt-2">
              <div className="text-4xl font-bold text-foreground leading-none">{engagement.avg_ai_score}</div>
              <div className="text-[11px] font-bold text-muted-foreground">/100</div>
            </div>
            <div className="-mb-1 -mr-1">
              <CircularProgress value={engagement.avg_ai_score} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
