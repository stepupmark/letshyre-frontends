import React, { useState } from "react";
import { Modal } from "../ui/modal/model2";
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
    <div className="flex flex-col justify-between gap-4 p-4 mb-6 transition-all border bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/20 rounded-xl sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full bg-brand-500">
          {selectedRows.length}
        </span>
        <span className="text-sm font-medium text-brand-800 dark:text-brand-300">
          jobs selected
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleApprove}
          disabled={bulkActionMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-sm bg-success-500 hover:bg-success-600 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => setIsRejectModalOpen(true)}
          disabled={bulkActionMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg shadow-sm bg-warning-500 hover:bg-warning-600 disabled:opacity-50"
        >
          Reject
        </button>

        <div className="hidden w-px h-6 mx-1 sm:block bg-brand-200 dark:bg-brand-500/20"></div>

        <button
          onClick={onClearSelection}
          className="text-sm font-medium text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Clear Selection
        </button>
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        className="max-w-md p-6"
      >
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Reject Jobs
        </h3>
        <p className="mt-5 mb-4 text-sm text-gray-500 dark:text-gray-400">
          Please provide a reason for rejecting the {selectedRows.length}{" "}
          selected job(s). This reason may be visible to the employers.
        </p>

        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          className="w-full p-3 mb-6 text-gray-900 border border-gray-300 outline-none dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-brand-500 focus:border-brand-500"
          rows={4}
          placeholder="Enter rejection reason..."
        ></textarea>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={bulkActionMutation.isPending || !rejectReason.trim()}
            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-error-500 hover:bg-error-600 disabled:opacity-50"
          >
            {bulkActionMutation.isPending ? "Rejecting..." : "Reject Jobs"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BulkActions;
