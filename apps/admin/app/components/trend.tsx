import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "cn";

export function Trend({
  change,
  label,
}: {
  change: number | null;
  label: string;
}) {
  if (change === null) return null;
  const rounded = Math.round(change);
  if (rounded === 0) return <span>No change {label}</span>;
  const up = rounded > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center font-medium tabular-nums",
          up ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        <span className="sr-only">{up ? "Up" : "Down"} </span>
        {Math.abs(rounded)}%
      </span>
      <span>
        <span className="sr-only"> </span>
        {label}
      </span>
    </span>
  );
}
