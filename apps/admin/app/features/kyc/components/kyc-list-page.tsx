import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { DataTable } from "~/components/data-table/data-table";
import { EmptyState } from "~/components/feedback/empty-state";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { RelativeTime } from "~/components/relative-time";
import { kycService } from "../services/kyc.service";
import { fetchAllPages } from "~/lib/fetch-all-pages";
import { kycQueries } from "../queries/kyc.queries";
import {
  KYC_STATUSES,
  type CompanyKyc,
  type KycStatus,
} from "../schemas/kyc.schema";
import { kycSearchParams } from "../search-params";
import { CompanyAvatar, KycStatusBadge } from "./kyc-status-badge";

const columns: ColumnDef<CompanyKyc>[] = [
  {
    id: "company",
    meta: {
      csv: (row) => ({ Company: row.company_name, Email: row.official_email }),
    },
    header: "Company",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <CompanyAvatar
          name={row.original.company_name}
          logo={row.original.company_logo}
          className="size-8"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">
            {row.original.company_name || "Unnamed company"}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.official_email}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "industry",
    meta: { csv: (row) => ({ Industry: row.company_industry }) },
    header: "Industry",
    cell: ({ row }) => row.original.company_industry || "—",
  },
  {
    id: "submitted",
    meta: { csv: (row) => ({ Submitted: row.created_at }) },
    header: "Submitted",
    cell: ({ row }) => <RelativeTime value={row.original.created_at} />,
  },
  {
    id: "status",
    meta: { csv: (row) => ({ Status: row.kyc_status }) },
    header: "Status",
    cell: ({ row }) => <KycStatusBadge status={row.original.kyc_status} />,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Review</span>,
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link to={`/dashboard/kyc/${row.original.id}`}>Review</Link>
      </Button>
    ),
  },
];

export function KycListPage() {
  const [{ status, page }, setParams] = useQueryStates(kycSearchParams);
  const kyc = useQuery(kycQueries.list(page, status));

  return (
    <>
      <PageHeader
        title="KYC verification"
        description="Review the company documents employers submit before they can hire."
      />
      <DataTable
        exportName={`kyc-${status.toLowerCase()}`}
        exportRows={() =>
          fetchAllPages((next) => kycService.list(next, status))
        }
        filters={
          <Tabs
            value={status}
            onValueChange={(value) =>
              void setParams({ status: value as KycStatus, page: null })
            }
          >
            <TabsList>
              {KYC_STATUSES.map((value) => (
                <TabsTrigger key={value} value={value}>
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        columns={columns}
        data={kyc.data?.results}
        getRowId={(row) => row.id}
        page={page}
        pageCount={kyc.data?.total_pages ?? 1}
        totalCount={kyc.data?.count}
        onPageChange={(next) => void setParams({ page: next })}
        isLoading={kyc.isPending}
        error={kyc.error}
        onRetry={() => void kyc.refetch()}
        empty={
          <EmptyState
            title={`No ${status.toLowerCase()} requests`}
            description={
              status === "Pending" ? "You're all caught up." : undefined
            }
          />
        }
      />
    </>
  );
}
