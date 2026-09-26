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
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
        <CheckCircle size={13} className="shrink-0" />
        Approved
      </span>
    );
  }

  if (isRejected) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
          <XCircle size={13} className="shrink-0" />
          Rejected
        </span>

        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors duration-150"
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors duration-150"
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors duration-150"
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
