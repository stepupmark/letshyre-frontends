import { useAiInterviewInsights } from "../../../hooks/useAiInterviewInsights";
import { AlertCircle } from "lucide-react";
import RolePerformanceChart from "./RolePerformanceChart";

export default function AiInterviewInsightsSection() {
  const { data, isLoading, isError } = useAiInterviewInsights();

  if (isLoading) {
    return (
      <div className="mt-12 animate-pulse">
        <div className="w-64 h-8 mb-6 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[400px] bg-muted rounded-2xl"></div>
          <div className="lg:col-span-1 h-[400px] bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-6 mt-12 text-center border border-red-100 bg-red-50 dark:bg-red-900/20 rounded-2xl dark:border-red-900/50">
        <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Failed to load insights
        </h3>
        <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Role-wise Performance
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Average AI interview scores across job roles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <RolePerformanceChart data={data.role_wise_performance} />
        </div>
      </div>
    </div>
  );
}
