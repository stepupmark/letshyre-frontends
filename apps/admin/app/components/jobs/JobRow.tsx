import React from "react";
import { Job } from "../../api/jobs.api";
import { TableRow, TableCell } from "../legacy-ui/table";
import StatusBadge from "./StatusBadge";
import ApprovalBadge from "./ApprovalBadge";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

interface JobRowProps {
  job: Job;
  isSelected: boolean;
  onToggleSelect: (jobId: string) => void;
  isLast?: boolean;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 3600 * 24),
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 30) return `${diffInDays} days ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} mo ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} yr ago`;
};

const formatText = (text: string) => {
  if (!text) return "-";
  return text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const JobRowComponent: React.FC<JobRowProps> = ({ job }) => {
  return (
    <TableRow className="hover:bg-accent transition-colors border-b border-border last:border-0 group">
      <TableCell className="w-10 px-4 py-3">{""}</TableCell>

      <TableCell className="px-4 py-3 min-w-[240px] max-w-[300px]">
        <div className="flex flex-col">
          <Link to={`/dashboard/jobs/${job.id}`}>
            <span className="text-[13px] font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors">
              {job.jobTitle}
            </span>
          </Link>

          <span className="text-[12px] text-muted-foreground mt-0.5 truncate">
            {job.companyName} • {job.employerName}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 text-center w-28 sm:text-left">
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-muted text-foreground border border-border">
          {job.applicationsCount}
        </span>
      </TableCell>

      <TableCell className="px-4 py-3 min-w-[140px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-foreground font-medium">
            {formatText(job.employmentType)}
          </span>
          <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
            {formatText(job.industryType)}
          </span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
        <div className="relative inline-block cursor-help">
          <span>{formatRelativeTime(job.createdDate)}</span>
          <div className="absolute z-10 hidden px-2 py-1 mb-2 text-xs text-primary-foreground transition-opacity -translate-x-1/2 bg-primary rounded-sm opacity-0 bottom-full left-1/2 w-max group-hover:block group-hover:opacity-100">
            {new Date(job.createdDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={job.jobStatus} />
      </TableCell>

      <TableCell className="px-4 py-3 whitespace-nowrap">
        <ApprovalBadge status={job.approvalStatus} />
      </TableCell>

      <TableCell className="px-6 py-5 align-top">
        <div className="flex justify-end">
          <Link
            to={`/dashboard/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary transition bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/10"
          >
            View Details
            <ChevronRight className="size-5" />
          </Link>
        </div>
      </TableCell>

    </TableRow>
  );
};

export const JobRow = React.memo(JobRowComponent);
