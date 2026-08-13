import type { OtpStatus } from "../../api/logs.api";

interface LogsStatusBadgeProps {
  status: OtpStatus;
}

const statusConfig: Record<
  OtpStatus,
  { label: string; classes: string; dot: string }
> = {
  Sent: {
    label: "Sent",
    classes:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  Failed: {
    label: "Failed",
    classes:
      "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30",
    dot: "bg-red-500",
  },
  Pending: {
    label: "Pending",
    classes:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
    dot: "bg-amber-400",
  },
};

export default function LogsStatusBadge({ status }: LogsStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
