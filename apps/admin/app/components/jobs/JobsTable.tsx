import React from "react";
import { Job } from "../../api/jobs.api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../legacy-ui/table";
import { JobRow } from "./JobRow";

interface JobsTableProps {
  jobs: Job[];
  isLoading: boolean;
  selectedRows: string[];
  onToggleSelectRow: (jobId: string) => void;
  onToggleSelectAll: () => void;
}

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  isLoading,
  selectedRows,
  onToggleSelectRow,
  // onToggleSelectAll,
}) => {
  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-border bg-card py-24 shadow-xs">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Loading jobs...
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-border bg-card py-24 shadow-xs">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
          <svg
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold text-foreground">
          No jobs found
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Adjust your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="[scrollbar-width:thin] overflow-x-auto">
        <Table className="w-full min-w-max border-collapse pb-20 text-left">
          <TableHeader className="border-b border-border bg-muted/80">
            <TableRow>
              <TableCell isHeader className="w-10 px-4 py-3">
                {""}
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Job Details
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Applications
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Details
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Created
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Approval
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job, index) => (
              <JobRow
                key={job.id}
                job={job}
                isSelected={selectedRows.includes(job.id)}
                onToggleSelect={onToggleSelectRow}
                isLast={index >= jobs.length - 2 && jobs.length > 2}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JobsTable;
