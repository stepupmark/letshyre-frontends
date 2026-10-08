import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  History,
  Repeat,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useQueryStates, type inferParserType } from "nuqs";
import { DataTable } from "~/components/data-table/data-table";
import { DateRangeFilter } from "~/components/date-range-filter";
import { ListEmptyState } from "~/components/feedback/list-empty-state";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { StatCard } from "~/components/stat-card";
import { StatusBadge, type StatusTone } from "~/components/status-badge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Copyable } from "~/components/copyable";
import { RelativeTime } from "~/components/relative-time";
import { paymentsService } from "../services/payments.service";
import { fetchAllPages } from "~/lib/fetch-all-pages";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { formatCurrency, formatNumber } from "~/lib/format";
import { paymentsQueries } from "../queries/payments.queries";
import { PAYMENT_STATUSES, type Payment } from "../schemas/payments.schema";
import { paymentsSearchParams, toPaymentFilters } from "../search-params";

type ParamsUpdate = {
  [K in keyof inferParserType<typeof paymentsSearchParams>]?:
    inferParserType<typeof paymentsSearchParams>[K] | null;
};

const statusTone: Record<string, StatusTone> = {
  success: "success",
  pending: "warning",
  created: "warning",
  failed: "danger",
};

const columns: ColumnDef<Payment>[] = [
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
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/employers/${row.original.employeer_id}`}>
            View employer
          </Link>
        </Button>
      ) : null,
  },
];

function Summary() {
  const summary = useQuery(paymentsQueries.summary());
  const data = summary.data;
  const loading = summary.isPending;
  if (summary.isError) return null;

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
  );
}

export function PaymentsPage() {
  const [params, setParams] = useQueryStates(paymentsSearchParams);
  const q = useDebouncedValue(params.q);
  const company = useDebouncedValue(params.company);
  const min = useDebouncedValue(params.min);
  const max = useDebouncedValue(params.max);
  const filters = toPaymentFilters({ ...params, q, company, min, max });
  const payments = useQuery(paymentsQueries.list(filters));

  const extraFilters = [
    params.company,
    params.min || params.max,
    params.from || params.to,
  ].filter(Boolean).length;
  const hasFilters = Boolean(params.q || params.status || extraFilters);

  const clearFilters = () =>
    void setParams({
      q: null,
      status: null,
      company: null,
      min: null,
      max: null,
      from: null,
      to: null,
      page: null,
    });

  const update = (next: ParamsUpdate) =>
    void setParams({ ...next, page: null });

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
              onChange={(value) => update({ q: value || null })}
            />
            <Select
              value={params.status ?? "all"}
              onValueChange={(value) =>
                update({
                  status:
                    value === "all"
                      ? null
                      : (value as (typeof PAYMENT_STATUSES)[number]),
                })
              }
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
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal /> Filters
                  {extraFilters > 0 && (
                    <Badge variant="secondary">{extraFilters}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="company">Company</FieldLabel>
                    <Input
                      id="company"
                      value={params.company}
                      onChange={(event) =>
                        update({ company: event.target.value || null })
                      }
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
                        onChange={(event) =>
                          update({ min: event.target.value || null })
                        }
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Max"
                        aria-label="Maximum amount"
                        value={params.max}
                        onChange={(event) =>
                          update({ max: event.target.value || null })
                        }
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel>Date</FieldLabel>
                    <DateRangeFilter
                      from={params.from}
                      to={params.to}
                      onChange={({ from, to }) =>
                        update({ from: from || null, to: to || null })
                      }
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
        onPageChange={(page) => void setParams({ page })}
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
  );
}
