import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import ChartSkeleton from "./ChartSkeleton";
import ChartEmptyState from "./ChartEmptyState";
import type { ChartSlice } from "../../../lib/chartTransformers";

interface Props {
  isLoading: boolean;
  isError: boolean;
  data: ChartSlice[] | undefined;
  children: (data: ChartSlice[]) => ReactNode;
  emptyMessage?: string;
}

export default function ChartContainer({
  isLoading,
  isError,
  data,
  children,
  emptyMessage,
}: Props) {
  if (isLoading) return <ChartSkeleton />;

  if (isError) {
    return (
      <div className="bg-card border border-red-100 dark:border-red-900/30 rounded-2xl p-6 shadow-xs flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Failed to load data
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-xs">
        <ChartEmptyState title={emptyMessage} />
      </div>
    );
  }

  return <>{children(data)}</>;
}
