import { useAiInterviewInsights } from "../../../hooks/useAiInterviewInsights";
import { AlertCircle } from "lucide-react";
import RolePerformanceChart from "./RolePerformanceChart";

export default function AiInterviewInsightsSection() {
  const { data, isLoading, isError } = useAiInterviewInsights();

  if (isLoading) {
    return (
      <div className="mt-12 animate-pulse">
        <div className="mb-6 h-8 w-64 rounded-lg bg-muted"></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-[400px] rounded-2xl bg-muted lg:col-span-2"></div>
          <div className="h-[400px] rounded-2xl bg-muted lg:col-span-1"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
        <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
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
