import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { MessageSquare } from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { ListEmptyState } from "@/components/feedback/list-empty-state"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { RelativeTime } from "@/components/relative-time"
import { logsService } from "../services/logs.service"
import { fetchAllPages } from "@/lib/fetch-all-pages"
import { logsQueries } from "../queries/logs.queries"
import type { EmailLog, SmsLog } from "../schemas/logs.schema"
import { useSearchState } from "@/lib/search-params"
import { readLogsParams } from "../search-params"
import { OtpStatusBadge, VerifiedBadge } from "./otp-status-badge"

function statusColumns<T extends EmailLog | SmsLog>(): ColumnDef<T>[] {
  return [
    {
      id: "status",
      meta: { csv: (row) => ({ Status: row.otp_status }) },
      header: "Status",
      cell: ({ row }) => <OtpStatusBadge status={row.original.otp_status} />,
    },
    {
      id: "verified",
      meta: { csv: (row) => ({ Verified: row.is_verified }) },
      header: "Verified",
      cell: ({ row }) => <VerifiedBadge verified={row.original.is_verified} />,
    },
    {
      id: "sent",
      meta: { csv: (row) => ({ "Sent at": row.created_at }) },
      header: "Sent at",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          <RelativeTime value={row.original.created_at} />
        </span>
      ),
    },
  ]
}

const emailColumns: ColumnDef<EmailLog>[] = [
  {
    id: "recipient",
    meta: { csv: (row) => ({ Email: row.email }) },
    header: "Recipient",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.email}</span>
    ),
  },
  {
    id: "type",
    meta: { csv: (row) => ({ "OTP type": row.otp_type }) },
    header: "OTP type",
    cell: ({ row }) => row.original.otp_type ?? "—",
  },
  ...statusColumns<EmailLog>(),
]

const smsColumns: ColumnDef<SmsLog>[] = [
  {
    id: "phone",
    meta: { csv: (row) => ({ Phone: row.phone_number }) },
    header: "Phone number",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {row.original.phone_number}
      </span>
    ),
  },
  ...statusColumns<SmsLog>(),
]

export function LogsPage() {
  const [{ channel, page }, setParams] = useSearchState(readLogsParams)
  const email = useQuery({
    ...logsQueries.email(page),
    enabled: channel === "email",
  })
  const sms = useQuery({
    ...logsQueries.sms(page),
    enabled: channel === "sms",
  })
  const logs = channel === "email" ? email : sms

  const tableProps = {
    page,
    pageCount: logs.data?.total_pages ?? 1,
    totalCount: logs.data?.count,
    onPageChange: (next: number) => {
      setParams({ page: next })
    },
    isLoading: logs.isPending,
    error: logs.error,
    onRetry: () => void logs.refetch(),
    empty: (
      <ListEmptyState
        noun="logs"
        icon={MessageSquare}
        description="OTP emails and SMS messages appear here once they're sent."
      />
    ),
    filters: (
      <Tabs
        value={channel}
        onValueChange={(value) => {
          setParams({ channel: value as typeof channel, page: null })
        }}
      >
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  }

  return (
    <>
      <PageHeader
        title="Communication logs"
        description="Outgoing OTP emails and SMS messages, newest first."
      />
      {channel === "email" ? (
        <DataTable
          columns={emailColumns}
          exportName="email-logs"
          exportRows={() => fetchAllPages((next) => logsService.email(next))}
          data={email.data?.results}
          getRowId={(row) => row.id}
          {...tableProps}
        />
      ) : (
        <DataTable
          columns={smsColumns}
          exportName="sms-logs"
          exportRows={() => fetchAllPages((next) => logsService.sms(next))}
          data={sms.data?.results}
          getRowId={(row) => row.id}
          {...tableProps}
        />
      )}
    </>
  )
}
