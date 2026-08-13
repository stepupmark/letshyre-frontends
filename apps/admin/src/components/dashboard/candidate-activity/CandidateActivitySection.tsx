import { useState } from "react";
import { useCandidateActivitySummary, useCandidateActivityTrend } from "../../../hooks/useCandidateActivity";
import {  AlertCircle } from "lucide-react";
import ActivityStatCards from "./ActivityStatCards";
import DayWiseActivityChart from "./DayWiseActivityChart";

export default function CandidateActivitySection() {
  const [days, setDays] = useState<number>(7);
  
  const summaryQuery = useCandidateActivitySummary();
  const trendQuery = useCandidateActivityTrend(days);

  if (summaryQuery.isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="w-64 h-8 mb-6 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl"
            ></div>
          ))}
        </div>
        <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center p-6 mt-8 text-center border border-red-100 bg-red-50 dark:bg-red-900/20 rounded-2xl dark:border-red-900/50">
        <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
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
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Candidate Activity Analytics
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor real-time engagement and candidate activity trends
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Stats Row */}
        <div>
          <ActivityStatCards data={summaryQuery.data} />
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-3">
          {trendQuery.isError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-red-100 bg-red-50 dark:bg-red-900/20 rounded-2xl dark:border-red-900/50 h-[400px]">
              <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to load trend data</p>
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
