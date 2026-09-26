import { Info, Users } from "lucide-react";
import { UnlocksDashboardData } from "../../../api/unlocks.api";

const CircularProgress = ({ value }: { value: number }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={r}
          className="stroke-indigo-100 dark:stroke-muted-foreground"
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx="24"
          cy="24"
          r={r}
          className="stroke-indigo-500"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
};

export default function EngagementInsights({
  engagement,
}: {
  engagement: UnlocksDashboardData["engagement"];
}) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-5 shadow-xs">
      <h3 className="mb-4 ml-1 text-sm font-bold text-foreground">
        Engagement Insights
      </h3>
      <div className="flex flex-1 gap-3">
        <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border p-4">
          <div>
            <div className="mb-2 flex items-start justify-between gap-1">
              <span className="text-xs leading-snug font-semibold text-foreground">
                Unique
                <br />
                Employers
              </span>
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div className="mt-2 mb-1 text-4xl leading-none font-bold text-foreground">
              {engagement.unique_employers}
            </div>
            <div className="mb-1 text-blue-500">
              <Users className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border p-4">
          <div>
            <div className="mb-2 flex items-start justify-between gap-1">
              <span className="text-xs leading-snug font-semibold text-foreground">
                Unique
                <br />
                Candidates
              </span>
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div className="mt-2 mb-1 text-4xl leading-none font-bold text-foreground">
              {engagement.unique_candidates}
            </div>
            <div className="mb-1 text-blue-500">
              <Users className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between rounded-2xl border border-border p-4">
          <div>
            <div className="mb-2 flex items-start justify-between gap-1">
              <span className="text-xs leading-snug font-semibold whitespace-nowrap text-foreground">
                Avg AI Score
              </span>
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div className="mt-2 mb-1 flex items-baseline gap-1">
              <div className="text-4xl leading-none font-bold text-foreground">
                {engagement.avg_ai_score}
              </div>
              <div className="text-[11px] font-bold text-muted-foreground">
                /100
              </div>
            </div>
            <div className="-mr-1 -mb-1">
              <CircularProgress value={engagement.avg_ai_score} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
