import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { FileDown, Printer } from "lucide-react"
import { useMemo } from "react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { DataTable } from "@/components/data-table"
import { DetailSheet } from "@/components/detail-sheet"
import { EmptyState } from "@/components/empty-state"
import { useDetailParam } from "@/hooks/use-detail-param"
import { buttonLink } from "@/lib/button-link"
import type { DataTableColumn } from "@/lib/data-table-features"
import { readTableParams, writeTableParams } from "@workspace/api/table-params"

import { invoicesQuery } from "../queries/billing.queries"
import { type Invoice } from "../schemas/billing.schema"
import { formatRupees } from "../lib/money"

const rowId = (row: Invoice) => row.id

export function Invoices() {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const [search, setSearch] = useSearchParams()
  const table = readTableParams(search, { sortable: [] })
  const [openId, setOpenId] = useDetailParam("invoice")
  const query = useQuery({
    ...invoicesQuery(table.page),
    placeholderData: keepPreviousData,
  })
  const rows = query.data?.results
  const index = rows?.findIndex((row) => row.id === openId) ?? -1
  const shown = index >= 0 ? rows?.[index] : undefined

  const columns = useMemo<DataTableColumn<Invoice>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" })
    return [
      {
        id: "date",
        header: t("invoiceList.columns.date"),
        enableHiding: false,
        cell: ({ row }) => date.format(new Date(row.original.paidAt)),
      },
      {
        id: "purchase",
        header: t("invoiceList.columns.purchase"),
        enableHiding: false,
        cell: ({ row }) => (
          <button
            type="button"
            data-row-open=""
            onClick={() => {
              setOpenId(row.original.id)
            }}
            className="rounded-sm text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Purchase invoice={row.original} />
          </button>
        ),
      },
      {
        id: "number",
        header: t("invoiceList.columns.number"),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.number ?? t("invoiceList.preparing")}
          </span>
        ),
      },
      {
        id: "total",
        header: t("invoiceList.columns.total"),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatRupees(locale, row.original.total)}
          </span>
        ),
      },
      {
        id: "pdf",
        header: "",
        enableHiding: false,
        cell: ({ row }) => <Pdf invoice={row.original} />,
      },
    ]
  }, [t, locale, setOpenId])

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        total={query.data?.count ?? rows?.length ?? 0}
        pageCount={query.data?.totalPages}
        getRowId={rowId}
        rowLabel={(row) => row.number ?? row.id}
        params={table}
        onParams={(next) => {
          setSearch((prev) => writeTableParams(prev, next), {
            preventScrollReset: true,
          })
        }}
        pending={query.isFetching}
        error={query.isError}
        onRetry={() => void query.refetch()}
        onOpen={(row) => {
          setOpenId(row.id)
        }}
        empty={
          <EmptyState
            title={t("invoiceList.emptyTitle")}
            description={t("invoiceList.emptyBody")}
            action={
              <AppLink to={href("/employer/billing")} className={buttonLink()}>
                {t("buyCredits")}
              </AppLink>
            }
          />
        }
        mobileRow={(row) => (
          <button
            type="button"
            onClick={() => {
              setOpenId(row.id)
            }}
            className="flex w-full items-start justify-between gap-3 rounded-lg border p-4 text-start transition-colors active:bg-muted"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <Purchase invoice={row} />
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                }).format(new Date(row.paidAt))}
              </span>
            </span>
            <span className="font-medium tabular-nums">
              {formatRupees(locale, row.total)}
            </span>
          </button>
        )}
      />

      <DetailSheet
        open={Boolean(shown)}
        onClose={() => {
          setOpenId(null)
        }}
        title={t("receipt.title")}
        description={
          shown ? (shown.number ?? t("invoiceList.preparing")) : undefined
        }
        position={
          rows && index >= 0
            ? { current: index + 1, total: rows.length }
            : undefined
        }
        onPrevious={
          rows && index > 0
            ? () => {
                setOpenId(rows[index - 1]?.id ?? null)
              }
            : undefined
        }
        onNext={
          rows && index >= 0 && index < rows.length - 1
            ? () => {
                setOpenId(rows[index + 1]?.id ?? null)
              }
            : undefined
        }
        footer={
          shown && (
            <div className="flex gap-2">
              <Pdf invoice={shown} />
              <Button
                variant="outline"
                onClick={() => {
                  window.print()
                }}
              >
                <Printer />
                {t("receipt.print")}
              </Button>
            </div>
          )
        }
      >
        {shown && <Receipt invoice={shown} />}
      </DetailSheet>
    </>
  )
}

function Purchase({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation("billing")
  return (
    <span className="flex flex-col">
      <span className="font-medium">
        {invoice.plan
          ? t("invoiceList.plan", { name: invoice.plan })
          : t("invoiceList.topUp")}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {t("topUps.credits", { count: invoice.credits })}
      </span>
    </span>
  )
}

function Pdf({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation("billing")
  if (!invoice.pdf) return null
  return (
    <a
      href={invoice.pdf}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonLink({ variant: "outline", size: "sm" })}
    >
      <FileDown />
      {t("receipt.pdf")}
    </a>
  )
}

function Receipt({ invoice }: { invoice: Invoice }) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const money = (n: number) => formatRupees(locale, n)
  const paid = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(invoice.paidAt))

  return (
    <>
      <Purchase invoice={invoice} />
      <dl className="flex flex-col gap-2 tabular-nums">
        <Row label={t("receipt.subtotal")} value={money(invoice.subtotal)} />
        {invoice.discount > 0 && (
          <Row
            label={
              invoice.coupon
                ? t("checkout.couponLine", { code: invoice.coupon })
                : t("checkout.discount")
            }
            value={`−${money(invoice.discount)}`}
          />
        )}
        <Row label={t("receipt.gst")} value={money(invoice.gst)} />
        <div className="mt-1 flex justify-between gap-4 border-t pt-3 font-medium">
          <dt>{t("checkout.total")}</dt>
          <dd>{money(invoice.total)}</dd>
        </div>
      </dl>
      <dl className="flex flex-col gap-2">
        <Row label={t("receipt.paidOn")} value={paid} />
        {invoice.reference && (
          <Row label={t("checkout.reference")} value={invoice.reference} mono />
        )}
      </dl>
      {!invoice.pdf && (
        <p className="text-muted-foreground">{t("receipt.noPdf")}</p>
      )}
    </>
  )
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={mono ? "font-mono text-xs break-all select-all" : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
