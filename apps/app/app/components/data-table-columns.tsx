import { Checkbox } from "@workspace/ui/components/checkbox"
import type { RowData } from "@tanstack/react-table"

import type { DataTableColumn } from "@/lib/data-table-features"

import { RowCheckbox } from "./data-table-controls"

/** The leading checkbox column a table gets when it has bulk actions. */
export function selectionColumn<T extends RowData>(
  allLabel: string,
  rowLabel: (row: T) => string
): DataTableColumn<T> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label={allLabel}
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => {
          table.toggleAllPageRowsSelected(checked)
        }}
      />
    ),
    cell: ({ row }) => <RowCheckbox label={rowLabel(row.original)} row={row} />,
  }
}

export const ariaSort = (sorted: false | "asc" | "desc") =>
  sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined

interface Hideable {
  id: string
  columnDef: { header?: unknown }
  getIsVisible: () => boolean
  toggleVisibility: (visible?: boolean) => void
}

/** What the columns menu needs from a hideable column. */
export const menuColumn = (column: Hideable) => ({
  id: column.id,
  label:
    typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : column.id,
  visible: column.getIsVisible(),
  toggle: (visible: boolean) => {
    column.toggleVisibility(visible)
  },
})
