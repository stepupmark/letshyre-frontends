import { StatusBadge, type StatusTone } from "~/components/status-badge";
import type { ApprovalStatus } from "../schemas/jobs.schema";

const statusTone: Record<string, StatusTone> = {
  open: "success",
  paused: "warning",
  closed: "neutral",
};

export function JobStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <StatusBadge tone={statusTone[status.toLowerCase()] ?? "neutral"}>
      {status[0].toUpperCase() + status.slice(1).toLowerCase()}
    </StatusBadge>
  );
}

const approval: Record<ApprovalStatus, { tone: StatusTone; label: string }> = {
  pending: { tone: "warning", label: "Pending review" },
  approved: { tone: "success", label: "Approved" },
  rejected: { tone: "danger", label: "Rejected" },
};

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const config = approval[status] ?? approval.pending;
  return <StatusBadge tone={config.tone}>{config.label}</StatusBadge>;
}
