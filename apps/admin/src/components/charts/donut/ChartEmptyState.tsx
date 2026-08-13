/**
 * ChartEmptyState.tsx
 *
 * Empty state shown when the API returns no data points.
 */

import { BarChart2 } from "lucide-react";

interface Props {
  title?: string;
}

export default function ChartEmptyState({ title = "No data available" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center px-6 py-8">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <BarChart2 className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Data will appear here once records are available.
      </p>
    </div>
  );
}
