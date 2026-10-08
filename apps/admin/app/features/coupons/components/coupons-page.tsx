import { useState } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import {
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from "lucide-react"
import { useQueryState } from "nuqs"
import { DataTable } from "@/components/data-table/data-table"
import { ConfirmDialog } from "@/components/feedback/confirm-dialog"
import { ListEmptyState } from "@/components/feedback/list-empty-state"
import { PageHeader } from "@/components/page-header"
import { StatusBadge, type StatusTone } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { couponsService } from "../services/coupons.service"
import { fetchAllPages } from "@/lib/fetch-all-pages"
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format"
import { pageParser } from "@/lib/search-params"
import {
  useDeleteCoupon,
  useUpdateCoupon,
} from "../mutations/use-coupon-mutations"
import { couponsQueries } from "../queries/coupons.queries"
import type { Coupon } from "../schemas/coupons.schema"
import { toCouponFormValues } from "../utils/coupon-values"
import { CouponForm } from "./coupon-form"

function couponStatus(coupon: Coupon): { label: string; tone: StatusTone } {
  const now = Date.now()
  if (now < new Date(coupon.start_date).getTime())
    return { label: "Scheduled", tone: "info" }
  if (now > new Date(coupon.end_date).getTime())
    return { label: "Expired", tone: "neutral" }
  if (coupon.used_count >= coupon.usage_limit)
    return { label: "Used up", tone: "warning" }
  return { label: "Active", tone: "success" }
}

function discountLabel(coupon: Coupon) {
  return coupon.discount_type === "percentage"
    ? `${Number(coupon.discount_value)}% off`
    : `${formatCurrency(coupon.discount_value)} off`
}

interface RowActions {
  onEdit: (coupon: Coupon) => void
  onDelete: (coupon: Coupon) => void
}

function buildColumns({ onEdit, onDelete }: RowActions): ColumnDef<Coupon>[] {
  return [
    {
      id: "code",
      meta: { csv: (row) => ({ Code: row.code }) },
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
      ),
    },
    {
      id: "discount",
      meta: {
        csv: (row) => ({
          "Discount type": row.discount_type,
          Discount: row.discount_value,
        }),
      },
      header: "Discount",
      cell: ({ row }) => discountLabel(row.original),
    },
    {
      id: "usage",
      meta: {
        align: "right",
        csv: (row) => ({ Used: row.used_count, Limit: row.usage_limit }),
      },
      header: "Used",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatNumber(row.original.used_count)} /{" "}
          {formatNumber(row.original.usage_limit)}
        </span>
      ),
    },
    {
      id: "validity",
      meta: { csv: (row) => ({ Starts: row.start_date, Ends: row.end_date }) },
      header: "Valid",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span>{formatDateTime(row.original.start_date)}</span>
          <span className="text-muted-foreground">
            to {formatDateTime(row.original.end_date)}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      meta: { csv: (row) => ({ Status: couponStatus(row).label }) },
      header: "Status",
      cell: ({ row }) => {
        const status = couponStatus(row.original)
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      size: 48,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${row.original.code}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                onEdit(row.original)
              }}
            >
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                onDelete(row.original)
              }}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

export function CouponsPage() {
  const [page, setPage] = useQueryState("page", pageParser)
  const coupons = useQuery(couponsQueries.list(page))
  const update = useUpdateCoupon()
  const remove = useDeleteCoupon()

  const [editing, setEditing] = useState<Coupon | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState<Coupon | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const columns = buildColumns({
    onEdit: (coupon) => {
      setEditing(coupon)
      setEditOpen(true)
    },
    onDelete: (coupon) => {
      setDeleting(coupon)
      setDeleteOpen(true)
    },
  })

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes employers can apply at checkout."
        actions={
          <Button asChild>
            <Link to="/dashboard/coupons/new">
              <Plus /> New coupon
            </Link>
          </Button>
        }
      />
      <DataTable
        exportName="coupons"
        exportRows={() => fetchAllPages((next) => couponsService.list(next))}
        columns={columns}
        data={coupons.data?.results}
        getRowId={(row) => row.id}
        page={page}
        pageCount={coupons.data?.total_pages ?? 1}
        totalCount={coupons.data?.count}
        onPageChange={(next) => void setPage(next)}
        isLoading={coupons.isPending}
        error={coupons.error}
        onRetry={() => void coupons.refetch()}
        empty={
          <ListEmptyState
            noun="coupons"
            icon={Tag}
            description="Create one to offer a discount at checkout."
            action={
              <Button asChild>
                <Link to="/dashboard/coupons/new">
                  <Plus /> New coupon
                </Link>
              </Button>
            }
          />
        }
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit coupon</DialogTitle>
            <DialogDescription>
              Changes apply to future checkouts only.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <CouponForm
              key={editing.id}
              id="edit-coupon"
              defaultValues={toCouponFormValues(editing)}
              onSubmit={(payload) => {
                update.mutate(
                  { id: editing.id, payload },
                  {
                    onSuccess: () => {
                      setEditOpen(false)
                    },
                  }
                )
              }}
              footer={
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={update.isPending}>
                    {update.isPending && (
                      <LoaderCircle className="animate-spin" />
                    )}
                    Save changes
                  </Button>
                </DialogFooter>
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${deleting?.code ?? "coupon"}?`}
        description="Employers can no longer use this code. This can't be undone."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting.id)
          setDeleteOpen(false)
        }}
      />
    </>
  )
}
