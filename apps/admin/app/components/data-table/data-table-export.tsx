import { useState } from "react"
import type { RowData } from "@tanstack/react-table"
import { Download, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { getErrorMessage } from "@/lib/errors"
import { downloadCsv, toCsv, type CsvCell } from "@/lib/csv"
import { EXPORT_PAGE_LIMIT } from "@/lib/fetch-all-pages"
import type { DataTableInstance } from "./features"

export type ExportRows<TData> = () => Promise<{
  rows: TData[]
  truncated: boolean
}>

interface DataTableExportProps<TData extends RowData> {
  table: DataTableInstance<TData>
  filename: string
  exportRows?: ExportRows<TData>
}

export function DataTableExport<TData extends RowData>({
  table,
  filename,
  exportRows,
}: DataTableExportProps<TData>) {
  const [pending, setPending] = useState(false)

  const exportCsv = async () => {
    setPending(true)
    try {
      const { rows, truncated } = exportRows
        ? await exportRows()
        : {
            rows: table.getRowModel().rows.map((row) => row.original),
            truncated: false,
          }
      if (!rows.length) {
        toast.info("Nothing to export")
        return
      }
      const columns = table.getVisibleLeafColumns()
      const records = rows.map(
        (row) =>
          Object.assign(
            {},
            ...columns.map((column) => column.columnDef.meta?.csv?.(row))
          ) as Record<string, CsvCell>
      )
      const headers = [...new Set(records.flatMap(Object.keys))]
      const csv = toCsv([
        headers,
        ...records.map((record) => headers.map((header) => record[header])),
      ])
      const date = new Date().toISOString().slice(0, 10)
      downloadCsv(`${filename}-${date}.csv`, csv)
      if (truncated)
        toast.warning(
          `Exported the first ${EXPORT_PAGE_LIMIT} pages. Narrow the filters to export the rest.`
        )
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't export the data"))
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => void exportCsv()}
    >
      {pending ? <LoaderCircle className="animate-spin" /> : <Download />}
      Export
    </Button>
  )
}
