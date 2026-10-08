import type { Column } from "@tanstack/react-table"

export function columnLabel<TData>(column: Column<TData>) {
  const { header, meta } = column.columnDef
  return meta?.label ?? (typeof header === "string" ? header : undefined)
}
