import React, { useState } from "react";
import { toast } from "sonner";

import { Modal } from "../legacy-ui/modal/model2";
import { useBulkActionJobs } from "../../hooks/useJobs";
import { ApprovalStatus, JobStatus } from "../../api/jobs.api";

interface RowActionsProps {
  jobId: string;
  approvalStatus: ApprovalStatus;
  jobStatus: JobStatus;
  isLast?: boolean;
}

const RowActions: React.FC<RowActionsProps> = ({ jobId, approvalStatus }) => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const bulkActionMutation = useBulkActionJobs();

  const handleApprove = () => {
    bulkActionMutation.mutate({ action: "approve", job_ids: [jobId] });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    bulkActionMutation.mutate(
      { action: "reject", job_ids: [jobId], reason: rejectReason },
      {
        onSuccess: () => {
          setIsRejectModalOpen(false);
          setRejectReason("");
        },
      },
    );
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {approvalStatus === "pending" && (
          <button
            onClick={handleApprove}
            disabled={bulkActionMutation.isPending}
            className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Approve
          </button>
        )}

        {approvalStatus === "rejected" && (
          <button
            onClick={handleApprove}
            disabled={bulkActionMutation.isPending}
            className="rounded-lg border border-input bg-card px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-foreground shadow-xs transition-colors hover:bg-accent disabled:opacity-50"
          >
            Re-approve
          </button>
        )}
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        className="max-w-md p-6 text-left"
      >
        <h3 className="mb-2 text-lg font-bold text-foreground">Reject Job</h3>
        <p className="mt-5 mb-4 text-sm text-muted-foreground">
          Please provide a reason for rejecting this job. This reason may be
          visible to the employer.
        </p>

        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="mb-6 w-full rounded-xl border border-input bg-muted/50 p-3 text-foreground outline-hidden focus:border-ring focus:ring-ring/50"
          rows={4}
          placeholder="Enter rejection reason..."
        ></textarea>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={bulkActionMutation.isPending || !rejectReason.trim()}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            {bulkActionMutation.isPending ? "Rejecting..." : "Reject Job"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default RowActions;
