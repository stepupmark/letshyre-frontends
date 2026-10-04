import {
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
})

export type DataTableColumn<T extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  T
>
