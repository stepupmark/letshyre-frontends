import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useMemo } from "react"

import type { DataTableColumn } from "@/lib/data-table-features"

import { formatRupees } from "../../lib/money"
import type { Invoice } from "../../schemas/billing.schema"
import { Pdf, Purchase } from "./receipt"

export const paidOn = (iso: string, locale: string, now = new Date()) => {
  const when = new Date(iso)
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: when.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(when)
}

// the table needs stable columns, or it rebuilds every row on each render
export function useInvoiceColumns(open: (id: string) => void) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  return useMemo<DataTableColumn<Invoice>[]>(
    () => [
      {
        id: "date",
        header: t("invoiceList.columns.date"),
        enableHiding: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums">
            {paidOn(row.original.paidAt, locale)}
          </span>
        ),
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
              open(row.original.id)
            }}
            className="group rounded-sm text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Purchase invoice={row.original} />
          </button>
        ),
      },
      {
        id: "number",
        header: t("invoiceList.columns.number"),
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
            {row.original.number ?? t("invoiceList.preparing")}
          </span>
        ),
      },
      {
        id: "total",
        header: () => (
          <span className="block text-end">
            {t("invoiceList.columns.total")}
          </span>
        ),
        enableHiding: false,
        cell: ({ row }) => (
          <span className="block text-end font-medium tabular-nums">
            {formatRupees(locale, row.original.total)}
          </span>
        ),
      },
      {
        id: "pdf",
        header: () => (
          <span className="sr-only">{t("invoiceList.columns.pdf")}</span>
        ),
        enableHiding: false,
        cell: ({ row }) => (
          <span className="flex justify-end">
            <Pdf invoice={row.original} />
          </span>
        ),
      },
    ],
    [t, locale, open]
  )
}
