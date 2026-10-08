import type { RowData } from "@tanstack/react-table"
import type { DataTableColumnInstance } from "./features"

export function columnLabel<TData extends RowData>(
  column: DataTableColumnInstance<TData>
) {
  const { header, meta } = column.columnDef
  return meta?.label ?? (typeof header === "string" ? header : undefined)
}
