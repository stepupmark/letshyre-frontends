import { useLocale, useTranslation } from "@workspace/i18n/react"
import { readTableParams, writeTableParams } from "@workspace/api/table-params"
import { Button } from "@workspace/ui/components/button"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronRight, Printer } from "lucide-react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { DataTable } from "@/components/data-table"
import { DetailSheet } from "@/components/detail-sheet"
import { EmptyState } from "@/components/empty-state"
import { useDetailParam } from "@/hooks/use-detail-param"
import { buttonLink } from "@/lib/button-link"

import { invoiceCount, invoiceTotals } from "../../lib/invoices"
import { formatRupees } from "../../lib/money"
import { invoicesQuery } from "../../queries/billing.queries"
import type { Invoice } from "../../schemas/billing.schema"
import { paidOn, useInvoiceColumns } from "./invoice-columns"
import { Pdf, Purchase, Receipt } from "./receipt"

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
  const columns = useInvoiceColumns(setOpenId)
  const page = query.data
  const rows = page?.results
  const index = rows?.findIndex((row) => row.id === openId) ?? -1
  const shown = index >= 0 ? rows?.[index] : undefined
  const totals =
    page && page.totalPages <= 1 && page.results.length > 0
      ? invoiceTotals(page.results)
      : null

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        total={page ? invoiceCount(page) : 0}
        pageCount={page?.totalPages}
        getRowId={rowId}
        rowLabel={(row) => row.number ?? row.id}
        label={t("invoiceList.title")}
        note={
          totals && (
            <span>
              {t("invoiceList.spent", {
                amount: formatRupees(locale, totals.spent),
              })}
              {" · "}
              {t("invoiceList.creditsBought", { count: totals.credits })}
            </span>
          )
        }
        params={table}
        onParams={(next) => {
          setSearch((prev) => writeTableParams(prev, next), {
            preventScrollReset: true,
          })
        }}
        pending={query.isFetching}
        error={query.isError}
        onRetry={() => void query.refetch()}
        loadError={{
          title: t("invoiceList.errorTitle"),
          body: t("invoiceList.errorBody"),
        }}
        keyboard
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
            className="group flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-start transition-colors active:bg-muted"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <Purchase invoice={row} />
              <span className="text-xs text-muted-foreground tabular-nums">
                {[paidOn(row.paidAt, locale), row.number]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <span className="font-medium tabular-nums">
              {formatRupees(locale, row.total)}
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100"
            />
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
              {shown.pdf && <Pdf invoice={shown} />}
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
