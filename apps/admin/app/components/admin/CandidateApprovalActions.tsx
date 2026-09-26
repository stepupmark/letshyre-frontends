import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { useUpdateCandidateApproval } from "../../hooks/useCandidates";
import { toast } from "sonner";

interface Props {
  profileId: string;
  isApproved?: boolean;
  isRejected?: boolean;
}

export default function CandidateApprovalActions({
  profileId,
  isApproved,
  isRejected,
}: Props) {
  const { mutate, isPending } = useUpdateCandidateApproval(profileId);

  function handleApprove() {
    mutate(
      { is_approved: true },
      {
        onSuccess: () => toast.success("Candidate approved successfully."),
        onError: () => toast.error("Failed to approve. Please try again."),
      },
    );
  }

  function handleReject() {
    mutate(
      { is_rejected: true },
      {
        onSuccess: () => toast.success("Candidate rejected."),
        onError: () => toast.error("Failed to reject. Please try again."),
      },
    );
  }

  if (isApproved) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle size={13} className="shrink-0" />
        Approved
      </span>
    );
  }

  if (isRejected) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
          <XCircle size={13} className="shrink-0" />
          Rejected
        </span>

        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCw size={12} />
          )}
          {isPending ? "Updating…" : "Re-Approve"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <CheckCircle size={12} />
        )}
        {isPending ? "Updating…" : "Approve"}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <XCircle size={12} />
        )}
        {isPending ? "Updating…" : "Reject"}
      </button>
    </div>
  );
}
