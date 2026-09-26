import React, { useState } from "react";
import { Modal } from "../legacy-ui/modal/model2";
import { useBulkActionJobs } from "../../hooks/useJobs";
import { toast } from "sonner";

interface BulkActionsProps {
  selectedRows: string[];
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedRows,
  onClearSelection,
}) => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const bulkActionMutation = useBulkActionJobs();

  const handleApprove = () => {
    bulkActionMutation.mutate(
      { action: "approve", job_ids: selectedRows },
      { onSuccess: onClearSelection },
    );
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    bulkActionMutation.mutate(
      { action: "reject", job_ids: selectedRows, reason: rejectReason },
      {
        onSuccess: () => {
          setIsRejectModalOpen(false);
          setRejectReason("");
          onClearSelection();
        },
      },
    );
  };

  if (selectedRows.length === 0) return null;

  return (
    <div className="flex flex-col justify-between gap-4 p-4 mb-6 transition-all border bg-primary/10 border-primary/20 rounded-xl sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-primary-foreground rounded-full bg-primary">
          {selectedRows.length}
        </span>
        <span className="text-sm font-medium text-primary">
          jobs selected
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleApprove}
          disabled={bulkActionMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-xs bg-green-500 hover:bg-green-600 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => setIsRejectModalOpen(true)}
          disabled={bulkActionMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
        >
          Reject
        </button>

        <div className="hidden w-px h-6 mx-1 sm:block bg-primary/10"></div>

        <button
          onClick={onClearSelection}
          className="text-sm font-medium text-primary hover:text-primary"
        >
          Clear Selection
        </button>
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        className="max-w-md p-6"
      >
        <h3 className="mb-2 text-lg font-bold text-foreground">
          Reject Jobs
        </h3>
        <p className="mt-5 mb-4 text-sm text-muted-foreground">
          Please provide a reason for rejecting the {selectedRows.length}{" "}
          selected job(s). This reason may be visible to the employers.
        </p>

        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full p-3 mb-6 text-foreground border border-input outline-hidden rounded-xl bg-muted/50 focus:ring-ring/50 focus:border-ring"
          rows={4}
          placeholder="Enter rejection reason..."
        ></textarea>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-input rounded-lg hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={bulkActionMutation.isPending || !rejectReason.trim()}
            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-destructive hover:bg-destructive/90 disabled:opacity-50"
          >
            {bulkActionMutation.isPending ? "Rejecting..." : "Reject Jobs"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BulkActions;
