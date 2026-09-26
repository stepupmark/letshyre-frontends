import { useState } from "react";
import {
  useCandidateActivitySummary,
  useCandidateActivityTrend,
} from "../../../hooks/useCandidateActivity";
import { AlertCircle } from "lucide-react";
import ActivityStatCards from "./ActivityStatCards";
import DayWiseActivityChart from "./DayWiseActivityChart";

export default function CandidateActivitySection() {
  const [days, setDays] = useState<number>(7);

  const summaryQuery = useCandidateActivitySummary();
  const trendQuery = useCandidateActivityTrend(days);

  if (summaryQuery.isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="mb-6 h-8 w-64 rounded-lg bg-muted"></div>
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted"></div>
          ))}
        </div>
        <div className="h-[400px] rounded-2xl bg-muted"></div>
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
        <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Failed to load activity analytics
        </h3>
        <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Candidate Activity Analytics
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor real-time engagement and candidate activity trends
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <ActivityStatCards data={summaryQuery.data} />
        </div>

        <div className="lg:col-span-3">
          {trendQuery.isError ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
              <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Failed to load trend data
              </p>
            </div>
          ) : (
            <DayWiseActivityChart
              data={trendQuery.data || []}
              days={days}
              onDaysChange={setDays}
              isFetching={trendQuery.isFetching}
            />
          )}
        </div>
      </div>
    </div>
  );
}
