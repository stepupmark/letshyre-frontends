import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { DataTable } from "~/components/data-table/data-table";
import { EmptyState } from "~/components/feedback/empty-state";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatDate } from "~/lib/format";
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
    header: "Industry",
    cell: ({ row }) => row.original.company_industry || "—",
  },
  {
    id: "submitted",
    header: "Submitted",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    id: "status",
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
      <Tabs
        value={status}
        onValueChange={(value) =>
          void setParams({ status: value as KycStatus, page: null })
        }
        className="mb-4"
      >
        <TabsList>
          {KYC_STATUSES.map((value) => (
            <TabsTrigger key={value} value={value}>
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DataTable
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
