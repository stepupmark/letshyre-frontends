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
    <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-xs transition-all">
      <div className="flex flex-col items-end gap-4 xl:flex-row">
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="flex flex-col">
            <label className="mb-1.5 ml-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                className="w-full rounded-xl border border-transparent bg-muted/50 py-2 pr-3 pl-9 text-sm text-foreground transition-colors focus:border-ring focus:bg-card"
                placeholder="Job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 ml-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Approval
            </label>
            <select
              className="w-full appearance-none rounded-xl border border-transparent bg-muted/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-card"
              value={approvalStatus}
              onChange={(e) =>
                setApprovalStatus(e.target.value as ApprovalStatus | "")
              }
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 ml-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Status
            </label>
            <select
              className="w-full appearance-none rounded-xl border border-transparent bg-muted/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-card"
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value as JobStatus | "")}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 ml-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              From
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-transparent bg-muted/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-card"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 ml-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              To
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-transparent bg-muted/50 px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:bg-card"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex w-full shrink-0 items-center justify-end gap-2 xl:mt-0 xl:w-auto">
          <button
            onClick={handleReset}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobsFilters;
