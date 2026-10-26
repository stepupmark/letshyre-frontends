import { Link } from "react-router"
import { Button } from "@workspace/ui/components/button"

import type { DataTableColumn } from "@/components/data-table/features"
import { StatusBadge, type StatusTone } from "@/components/status-badge"
import { Copyable } from "@/components/copyable"
import { RelativeTime } from "@/components/relative-time"
import { formatCurrency, formatNumber } from "@/lib/format"

import { type Payment } from "../schemas/payments.schema"

const statusTone: Record<string, StatusTone> = {
  success: "success",
  pending: "warning",
  created: "warning",
  failed: "danger",
}

export const columns: DataTableColumn<Payment>[] = [
  {
    id: "employer",
    meta: { csv: (row) => ({ Employer: row.employeer, Company: row.company }) },
    header: "Employer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.employeer ?? "—"}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.company}
        </span>
      </div>
    ),
  },
  {
    id: "amount",
    meta: {
      align: "right",
      csv: (row) => ({ Amount: row.amount_paid, Currency: row.currency }),
    },
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatCurrency(row.original.amount_paid, row.original.currency)}
      </span>
    ),
  },
  {
    id: "credits",
    meta: { align: "right", csv: (row) => ({ Credits: row.tokens_credited }) },
    header: "Credits",
    cell: ({ row }) => formatNumber(row.original.tokens_credited),
  },
  {
    id: "status",
    meta: { csv: (row) => ({ Status: row.payment_status }) },
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        tone={
          statusTone[row.original.payment_status.toLowerCase()] ?? "neutral"
        }
      >
        {row.original.payment_status.toLowerCase() === "created"
          ? "Pending"
          : row.original.payment_status}
      </StatusBadge>
    ),
  },
  {
    id: "order",
    meta: { csv: (row) => ({ "Order ID": row.payment_order_id }) },
    header: "Order ID",
    cell: ({ row }) => (
      <Copyable
        value={row.original.payment_order_id}
        label="Order ID"
        className="font-mono text-xs text-muted-foreground"
      />
    ),
  },
  {
    id: "date",
    meta: { csv: (row) => ({ Date: row.created_at }) },
    header: "Date",
    cell: ({ row }) => <RelativeTime value={row.original.created_at} />,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Employer profile</span>,
    cell: ({ row }) =>
      row.original.employeer_id ? (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link to={`/dashboard/employers/${row.original.employeer_id}`} />
          }
        >
          View employer
        </Button>
      ) : null,
  },
]
