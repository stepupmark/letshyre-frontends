import { useEffect, useRef, useState, type ReactNode } from "react"
import { useLocation } from "react-router"
import {
  FlexRender,
  functionalUpdate,
  useTable,
  type OnChangeFn,
  type RowData,
  type RowSelectionState,
  type ColumnVisibilityState,
} from "@tanstack/react-table"
import { cn } from "@workspace/ui/lib/utils"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { useHotkey } from "@/hooks/use-hotkey"
import { useStoredState } from "@/hooks/use-stored-state"

import { DataTableCards } from "./data-table-cards"
import { DataTableExport, type ExportRows } from "./data-table-export"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions, type Density } from "./data-table-view-options"
import { dataTableFeatures, type DataTableColumn } from "./features"
import { SavedViews } from "./saved-views"

interface DataTableProps<TData extends RowData> {
  columns: DataTableColumn<TData>[]
  data: TData[] | undefined
  getRowId?: (row: TData) => string
  /** 1-based, matches the API. */
  page: number
  pageCount: number
  totalCount?: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  empty?: ReactNode
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** Search and filter controls; also turns on saved views. */
  filters?: ReactNode
  /** Shown between the toolbar and the table, e.g. bulk actions. */
  banner?: ReactNode
  /** CSV file name, without the date or extension. */
  exportName?: string
  /** Fetches every row matching the filters; defaults to the loaded page. */
  exportRows?: ExportRows<TData>
}

const SKELETON_ROWS = 8

const alignClass = (meta?: { align?: "right" }) =>
  meta?.align === "right" ? "text-right tabular-nums" : undefined

const EMPTY: never[] = []

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  page,
  pageCount,
  totalCount,
  onPageChange,
  isLoading = false,
  error,
  onRetry,
  empty,
  rowSelection,
  onRowSelectionChange,
  filters,
  banner,
  exportName,
  exportRows,
}: DataTableProps<TData>) {
  const { pathname } = useLocation()
  const isMobile = useIsMobile()
  const storageKey = `table:${pathname}:${columns.map((column) => column.id).join(",")}`
  const [columnVisibility, setColumnVisibility] =
    useStoredState<ColumnVisibilityState>(`${storageKey}:columns`, {})
  const [density, setDensity] = useStoredState<Density>(
    `${storageKey}:density`,
    "comfortable"
  )

  const table = useTable({
    features: dataTableFeatures,
    data: data ?? EMPTY,
    columns,
    ...(getRowId && { getRowId }),
    enableRowSelection: Boolean(onRowSelectionChange),
    state: { rowSelection: rowSelection ?? {}, columnVisibility },
    ...(onRowSelectionChange && { onRowSelectionChange }),
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility(functionalUpdate(updater, columnVisibility))
    },
  })

  const columnCount = table.getVisibleLeafColumns().length
  const rows = table.getRowModel().rows
  const bodyRef = useRef<HTMLTableSectionElement>(null)
  // the j/k cursor belongs to one set of rows
  const [cursor, setCursor] = useState({ data, index: -1 })
  const activeRow = cursor.data === data ? cursor.index : -1

  useEffect(() => {
    bodyRef.current?.rows[activeRow]?.scrollIntoView({ block: "nearest" })
  }, [activeRow])

  useHotkey(
    ["j", "k", "Enter"],
    (event) => {
      if (event.key === "Enter") {
        if (activeRow < 0 || (event.target as Element).closest("a, button"))
          return
        bodyRef.current?.rows[activeRow]
          ?.querySelector<HTMLElement>("a[href]")
          ?.click()
        return
      }
      event.preventDefault()
      const step = event.key === "j" ? 1 : -1
      setCursor({
        data,
        index: Math.min(Math.max(activeRow + step, 0), rows.length - 1),
      })
    },
    rows.length > 0 && !isMobile
  )

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      {filters}
      <div className="ms-auto flex items-center gap-2">
        {filters && <SavedViews />}
        {exportName && (
          <DataTableExport
            table={table}
            filename={exportName}
            exportRows={exportRows}
          />
        )}
        {!isMobile && (
          <DataTableViewOptions
            table={table}
            density={density}
            onDensityChange={setDensity}
          />
        )}
      </div>
    </div>
  )

  if (error && !data)
    return (
      <div className="space-y-3">
        {toolbar}
        <ErrorState
          error={error}
          onRetry={onRetry}
          className="rounded-lg border"
        />
      </div>
    )

  const emptyState = empty ?? (
    <EmptyState
      title="No results"
      description="Nothing matches this view right now."
    />
  )

  const loading = isLoading && !data

  return (
    <div className="space-y-3">
      {toolbar}
      {banner}
      <div className="overflow-hidden rounded-lg border">
        {isMobile ? (
          loading ? (
            <div className="divide-y">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2 p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : rows.length ? (
            <DataTableCards rows={rows} />
          ) : (
            <div className="py-12 text-center">{emptyState}</div>
          )
        ) : (
          <Table
            className={cn(
              density === "compact" && "text-[13px] [&_td]:py-1 [&_th]:h-8"
            )}
          >
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.column.columnDef.meta?.width }}
                      className={alignClass(header.column.columnDef.meta)}
                    >
                      {header.isPlaceholder ? null : (
                        <FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody ref={bodyRef}>
              {loading ? (
                Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: columnCount }, (_, cell) => (
                      <TableCell key={cell}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    data-active={index === activeRow || undefined}
                    className="data-active:bg-brand-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={alignClass(cell.column.columnDef.meta)}
                      >
                        <FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columnCount} className="h-48 text-center">
                    {emptyState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <DataTablePagination
        page={page}
        pageCount={pageCount}
        totalCount={totalCount}
        rowCount={rows.length}
        onPageChange={onPageChange}
      />
    </div>
  )
}
