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
      <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-card p-6 shadow-xs dark:border-red-900/30">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Failed to load data
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-xs">
        <ChartEmptyState title={emptyMessage} />
      </div>
    );
  }

  return <>{children(data)}</>;
}
