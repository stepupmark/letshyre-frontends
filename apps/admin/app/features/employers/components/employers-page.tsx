import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  BadgeCheck,
  Building2,
  CalendarPlus,
  Clock,
  FileWarning,
} from "lucide-react"
import { useQueryState } from "nuqs"
import { DataTable } from "~/components/data-table/data-table"
import { ListEmptyState } from "~/components/feedback/list-empty-state"
import { PageHeader } from "~/components/page-header"
import { StatCard } from "~/components/stat-card"
import { Button } from "~/components/ui/button"
import { CompanyAvatar, KycStatusBadge } from "~/features/kyc"
import { employersService } from "../services/employers.service"
import { fetchAllPages } from "~/lib/fetch-all-pages"
import { formatNumber } from "~/lib/format"
import { pageParser } from "~/lib/search-params"
import { employersQueries } from "../queries/employers.queries"
import type { Employer } from "../schemas/employers.schema"

const columns: ColumnDef<Employer>[] = [
  {
    id: "company",
    meta: {
      csv: (row) => ({
        Company: row.employer_kyc?.company_name,
        Industry: row.employer_kyc?.company_industry,
      }),
    },
    header: "Company",
    cell: ({ row }) => {
      const kyc = row.original.employer_kyc
      return (
        <div className="flex items-center gap-3">
          <CompanyAvatar
            name={kyc?.company_name ?? row.original.user_name}
            logo={kyc?.company_logo}
            className="size-8"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">
              {kyc?.company_name || "No company yet"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {kyc?.company_industry}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    id: "contact",
    meta: {
      csv: (row) => ({
        Contact: row.user_name,
        Email: row.email,
        Phone: row.phone_number,
      }),
    },
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.user_name || "—"}</span>
        <span className="text-xs text-muted-foreground">
          {[row.original.email, row.original.phone_number]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    ),
  },
  {
    id: "jobs",
    meta: { align: "right", csv: (row) => ({ Jobs: row.job_posts }) },
    header: "Jobs",
    cell: ({ row }) => formatNumber(row.original.job_posts),
  },
  {
    id: "kyc",
    meta: {
      csv: (row) => ({ KYC: row.employer_kyc?.kyc_status ?? "Not submitted" }),
    },
    header: "KYC",
    cell: ({ row }) => (
      <KycStatusBadge status={row.original.employer_kyc?.kyc_status} />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Profile</span>,
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link to={`/dashboard/employers/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
]

function Summary() {
  const summary = useQuery(employersQueries.summary())
  if (summary.isError) return null
  const data = summary.data
  const loading = summary.isPending

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Employers"
        icon={Building2}
        loading={loading}
        value={formatNumber(data?.total_employees)}
      />
      <StatCard
        label="Joined today"
        icon={CalendarPlus}
        loading={loading}
        value={formatNumber(data?.today_registerations)}
      />
      <StatCard
        label="KYC verified"
        icon={BadgeCheck}
        loading={loading}
        value={formatNumber(data?.verified_kycs)}
      />
      <StatCard
        label="KYC pending"
        icon={Clock}
        loading={loading}
        value={formatNumber(data?.pending_kycs)}
        hint={
          data?.pending_kycs ? (
            <Link to="/dashboard/kyc" className="underline underline-offset-4">
              Review requests
            </Link>
          ) : undefined
        }
      />
      <StatCard
        label="KYC incomplete"
        icon={FileWarning}
        loading={loading}
        value={formatNumber(data?.in_completed_kycs)}
      />
    </div>
  )
}

export function EmployersPage() {
  const [page, setPage] = useQueryState("page", pageParser)
  const employers = useQuery(employersQueries.list(page))

  return (
    <>
      <PageHeader
        title="Employers"
        description="Companies registered to hire on LetsHyre."
      />
      <Summary />
      <DataTable
        exportName="employers"
        exportRows={() => fetchAllPages((page) => employersService.list(page))}
        columns={columns}
        data={employers.data?.results}
        getRowId={(row) => row.id}
        page={page}
        pageCount={employers.data?.total_pages ?? 1}
        totalCount={employers.data?.count}
        onPageChange={(next) => void setPage(next)}
        isLoading={employers.isPending}
        error={employers.error}
        onRetry={() => void employers.refetch()}
        empty={
          <ListEmptyState
            noun="employers"
            icon={Building2}
            description="Employers appear here after they sign up."
          />
        }
      />
    </>
  )
}
