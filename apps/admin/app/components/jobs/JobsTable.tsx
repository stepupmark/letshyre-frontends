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
      <div className="flex flex-col items-center justify-center w-full py-24 bg-card border border-border shadow-xs rounded-2xl">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Loading jobs...
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-24 bg-card border border-border shadow-xs rounded-2xl">
        <div className="flex items-center justify-center mb-4 rounded-full w-14 h-14 bg-muted/50">
          <svg
            className="w-6 h-6 text-muted-foreground"
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
    <div className="overflow-hidden bg-card border border-border shadow-xs rounded-2xl">
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <Table className="w-full pb-20 text-left border-collapse min-w-max">
          <TableHeader className="bg-muted/80 border-b border-border">
            <TableRow>
              <TableCell isHeader className="w-10 px-4 py-3">
                {""}
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Job Details
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Applications
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Details
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Created
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
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
