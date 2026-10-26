import { Link } from "react-router"
import { Checkbox } from "@workspace/ui/components/checkbox"

import type { DataTableColumn } from "@/components/data-table/features"
import { RelativeTime } from "@/components/relative-time"
import { formatNumber } from "@/lib/format"

import type { Job } from "../schemas/jobs.schema"
import { ApprovalBadge, JobStatusBadge } from "./job-badges"
import { JobReview } from "./job-review"

export const columns: DataTableColumn<Job>[] = [
  {
    id: "select",
    meta: { width: 40 },
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()
        }
        onCheckedChange={(checked) => {
          table.toggleAllPageRowsSelected(checked)
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.title ?? "job"}`}
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => {
          row.toggleSelected(checked)
        }}
      />
    ),
  },
  {
    id: "job",
    meta: {
      csv: (row) => ({
        Title: row.title,
        Company: row.company_name,
        Employer: row.employer_name,
      }),
    },
    header: "Job",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link
          to={`/dashboard/jobs/${row.original.id}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {row.original.title || "Untitled job"}
        </Link>
        <span className="text-xs text-muted-foreground">
          {[row.original.company_name, row.original.employer_name]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    ),
  },
  {
    id: "type",
    meta: {
      csv: (row) => ({
        "Employment type": row.employment_type,
        Industry: row.industry_type,
      }),
    },
    header: "Type",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="capitalize">
          {row.original.employment_type?.replace(/_/g, " ") || "—"}
        </span>
        <span className="text-muted-foreground">
          {row.original.industry_type}
        </span>
      </div>
    ),
  },
  {
    id: "applications",
    meta: {
      align: "right",
      csv: (row) => ({ Applicants: row.applications_count }),
    },
    header: "Applicants",
    cell: ({ row }) => formatNumber(row.original.applications_count),
  },
  {
    id: "status",
    meta: { csv: (row) => ({ Status: row.status }) },
    header: "Status",
    cell: ({ row }) => <JobStatusBadge status={row.original.status} />,
  },
  {
    id: "approval",
    meta: { csv: (row) => ({ Review: row.approval }) },
    header: "Review",
    cell: ({ row }) => <ApprovalBadge status={row.original.approval} />,
  },
  {
    id: "posted",
    meta: { csv: (row) => ({ Posted: row.created_at }) },
    header: "Posted",
    cell: ({ row }) => <RelativeTime value={row.original.created_at} />,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <JobReview
        jobIds={[row.original.id]}
        approval={row.original.approval}
        size="sm"
      />
    ),
  },
]
