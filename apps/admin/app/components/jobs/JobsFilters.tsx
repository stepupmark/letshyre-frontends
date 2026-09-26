import React, { useState, useEffect } from "react";
import { JobStatus, ApprovalStatus } from "../../api/jobs.api";

interface JobsFiltersProps {
  initialSearch?: string;
  initialJobStatus?: JobStatus;
  initialApprovalStatus?: ApprovalStatus;
  initialFromDate?: string;
  initialToDate?: string;
  onFilterChange: (filters: {
    search?: string;
    jobStatus?: JobStatus | "";
    approvalStatus?: ApprovalStatus | "";
    fromDate?: string;
    toDate?: string;
  }) => void;
}

const JobsFilters: React.FC<JobsFiltersProps> = ({
  initialSearch = "",
  initialJobStatus,
  initialApprovalStatus,
  initialFromDate = "",
  initialToDate = "",
  onFilterChange,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [jobStatus, setJobStatus] = useState<JobStatus | "">(
    initialJobStatus || "",
  );
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | "">(
    initialApprovalStatus || "",
  );
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);

  useEffect(() => {
    setSearch(initialSearch);
    setJobStatus(initialJobStatus || "");
    setApprovalStatus(initialApprovalStatus || "");
    setFromDate(initialFromDate);
    setToDate(initialToDate);
  }, [
    initialSearch,
    initialJobStatus,
    initialApprovalStatus,
    initialFromDate,
    initialToDate,
  ]);

  const handleApply = () => {
    onFilterChange({ search, jobStatus, approvalStatus, fromDate, toDate });
  };

  const handleReset = () => {
    setSearch("");
    setJobStatus("");
    setApprovalStatus("");
    setFromDate("");
    setToDate("");
    onFilterChange({
      search: "",
      jobStatus: "",
      approvalStatus: "",
      fromDate: "",
      toDate: "",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="p-4 mb-6 transition-all bg-card border border-border shadow-xs rounded-2xl">
      <div className="flex flex-col items-end gap-4 xl:flex-row">
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute w-4 h-4 text-muted-foreground -translate-y-1/2 left-3 top-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                className="w-full py-2 pr-3 text-sm text-foreground transition-colors border border-transparent pl-9 bg-muted/50 focus:bg-card focus:border-ring rounded-xl"
                placeholder="Job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
              Approval
            </label>
            <select
              className="w-full px-3 py-2 text-sm text-foreground transition-colors border border-transparent appearance-none bg-muted/50 focus:bg-card focus:border-ring rounded-xl"
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value as any)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 text-sm text-foreground transition-colors border border-transparent appearance-none bg-muted/50 focus:bg-card focus:border-ring rounded-xl"
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value as any)}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
              From
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm text-foreground transition-colors border border-transparent bg-muted/50 focus:bg-card focus:border-ring rounded-xl"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">
              To
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 text-sm text-foreground transition-colors border border-transparent bg-muted/50 focus:bg-card focus:border-ring rounded-xl"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-2 mt-4 xl:w-auto shrink-0 xl:mt-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent rounded-xl"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 text-sm font-medium text-primary-foreground transition-all shadow-xs bg-primary hover:bg-primary/90 rounded-xl hover:shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobsFilters;
