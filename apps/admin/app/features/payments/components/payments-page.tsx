import { useQuery } from "@tanstack/react-query"
import {
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  History,
  Repeat,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { DataTable } from "@/components/data-table/data-table"
import { DateRangeFilter } from "@/components/date-range-filter"
import { ListEmptyState } from "@/components/feedback/list-empty-state"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { fetchAllPages } from "@/lib/fetch-all-pages"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatNumber } from "@/lib/format"
import { useSearchState } from "@/lib/search-params"

import { paymentsService } from "../services/payments.service"
import { paymentsQueries } from "../queries/payments.queries"
import { PAYMENT_STATUSES } from "../schemas/payments.schema"
import { readPaymentsParams, toPaymentFilters } from "../search-params"
import { columns } from "./payment-columns"

type ParamsUpdate = Partial<
  Record<keyof ReturnType<typeof readPaymentsParams>, string | null>
>

function Summary() {
  const summary = useQuery(paymentsQueries.summary())
  const data = summary.data
  const loading = summary.isPending
  if (summary.isError) return null

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total payments"
        icon={CreditCard}
        loading={loading}
        value={formatNumber(data?.total_payments)}
      />
      <StatCard
        label="Successful"
        icon={CircleCheck}
        loading={loading}
        value={formatNumber(data?.success_payments)}
      />
      <StatCard
        label="Pending"
        icon={Clock}
        loading={loading}
        value={formatNumber(data?.pending_payments)}
      />
      <StatCard
        label="Failed"
        icon={CircleX}
        loading={loading}
        value={formatNumber(data?.failed_payments)}
      />
      <StatCard
        label="Repeat customers"
        icon={Repeat}
        loading={loading}
        value={formatNumber(data?.repeated_customers)}
      />
    </div>
  )
}

export function PaymentsPage() {
  const [params, setParams] = useSearchState(readPaymentsParams)
  const q = useDebouncedValue(params.q)
  const company = useDebouncedValue(params.company)
  const min = useDebouncedValue(params.min)
  const max = useDebouncedValue(params.max)
  const filters = toPaymentFilters({ ...params, q, company, min, max })
  const payments = useQuery(paymentsQueries.list(filters))

  const extraFilters = [
    params.company,
    params.min || params.max,
    params.from || params.to,
  ].filter(Boolean).length
  const hasFilters = Boolean(params.q || params.status || extraFilters)

  const clearFilters = () => {
    setParams(null)
  }

  const update = (next: ParamsUpdate) => {
    setParams({ ...next, page: null })
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every credit purchase made by employers."
      />
      <Summary />

      <DataTable
        exportName="payments"
        exportRows={() =>
          fetchAllPages((page) => paymentsService.list({ ...filters, page }))
        }
        filters={
          <>
            <SearchInput
              value={params.q}
              placeholder="Search order ID or keyword"
              onChange={(value) => {
                update({ q: value || null })
              }}
            />
            <Select
              value={params.status ?? "all"}
              items={{
                all: "All statuses",
                ...Object.fromEntries(PAYMENT_STATUSES.map((s) => [s, s])),
              }}
              onValueChange={(value) => {
                update({
                  status: value === "all" ? null : value,
                })
              }}
            >
              <SelectTrigger className="w-36" aria-label="Payment status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger render={<Button variant="outline" />}>
                <SlidersHorizontal /> Filters
                {extraFilters > 0 && (
                  <Badge variant="secondary">{extraFilters}</Badge>
                )}
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="company">Company</FieldLabel>
                    <Input
                      id="company"
                      value={params.company}
                      onChange={(event) => {
                        update({ company: event.target.value || null })
                      }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="min-amount">Amount (₹)</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        id="min-amount"
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={params.min}
                        onChange={(event) => {
                          update({ min: event.target.value || null })
                        }}
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Max"
                        aria-label="Maximum amount"
                        value={params.max}
                        onChange={(event) => {
                          update({ max: event.target.value || null })
                        }}
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel>Date</FieldLabel>
                    <DateRangeFilter
                      from={params.from}
                      to={params.to}
                      onChange={({ from, to }) => {
                        update({ from: from || null, to: to || null })
                      }}
                    />
                  </Field>
                </FieldGroup>
              </PopoverContent>
            </Popover>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X /> Clear
              </Button>
            )}
          </>
        }
        columns={columns}
        data={payments.data?.results}
        getRowId={(row) => row.id}
        page={params.page}
        pageCount={payments.data?.total_pages ?? 1}
        totalCount={payments.data?.count}
        onPageChange={(page) => {
          setParams({ page })
        }}
        isLoading={payments.isPending}
        error={payments.error}
        onRetry={() => void payments.refetch()}
        empty={
          <ListEmptyState
            noun="payments"
            icon={History}
            description="Payments appear here once employers buy credits."
            filtered={hasFilters}
            onClearFilters={clearFilters}
          />
        }
      />
    </>
  )
}
