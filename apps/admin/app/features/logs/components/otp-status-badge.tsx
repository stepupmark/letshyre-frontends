import { StatusBadge, type StatusTone } from "~/components/status-badge";

const tones: Record<string, StatusTone> = {
  sent: "success",
  failed: "danger",
  pending: "warning",
};

export function OtpStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge tone={tones[status.toLowerCase()] ?? "neutral"}>
      {status}
    </StatusBadge>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <StatusBadge tone={verified ? "info" : "neutral"}>
      {verified ? "Verified" : "Unverified"}
    </StatusBadge>
  );
}
