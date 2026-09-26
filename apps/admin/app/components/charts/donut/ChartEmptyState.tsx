import { BarChart2 } from "lucide-react";

interface Props {
  title?: string;
}

export default function ChartEmptyState({
  title = "No data available",
}: Props) {
  return (
    <div className="flex h-48 flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <BarChart2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Data will appear here once records are available.
      </p>
    </div>
  );
}
