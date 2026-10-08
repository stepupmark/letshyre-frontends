import {
  columnVisibilityFeature,
  rowSelectionFeature,
  tableFeatures,
  type CellData,
  type Column,
  type ColumnDef,
  type Row,
  type RowData,
  type Table,
  type TableFeatures,
} from "@tanstack/react-table"
import type { CsvCell } from "@/lib/csv"

/* eslint-disable @typescript-eslint/no-unused-vars -- must match the library's signature */
declare module "@tanstack/react-table" {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    align?: "right"
    /** Fixed column width in px. */
    width?: number
    /** Column name for the view menu and CSV header when `header` isn't text. */
    label?: string
    /** CSV fields for this column, keyed by header; columns without it are left out. */
    csv?: (row: TData) => Record<string, CsvCell>
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export const dataTableFeatures = tableFeatures({
  rowSelectionFeature,
  columnVisibilityFeature,
})

type Features = typeof dataTableFeatures

export type DataTableColumn<T extends RowData> = ColumnDef<Features, T>
export type DataTableRow<T extends RowData> = Row<Features, T>
export type DataTableInstance<T extends RowData> = Table<Features, T>
export type DataTableColumnInstance<T extends RowData> = Column<Features, T>
