import { useTranslation } from "@workspace/i18n/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"
import {
  functionalUpdate,
  useTable,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { useMemo, useRef, useState, type ReactNode } from "react"

import { useDelayed } from "@/hooks/use-delayed"
import { useRowKeys } from "@/hooks/use-row-keys"
import {
  dataTableFeatures,
  type DataTableColumn,
} from "@/lib/data-table-features"
import { PAGE_SIZE, type TableParams } from "@workspace/api/table-params"

import {
  BulkBar,
  ColumnsMenu,
  RowCheckbox,
  SortButton,
  TableFooter,
} from "./data-table-controls"
import { ariaSort, menuColumn, selectionColumn } from "./data-table-columns"
import { TableSkeleton } from "./data-table-skeleton"
import { NoMatches } from "./empty-state"
import { LoadError, RefreshNote } from "./query-state"

export interface DataTableProps<T extends RowData> {
  columns: DataTableColumn<T>[]
  data: T[] | undefined
  total: number
  // when the API pages differently from PAGE_SIZE, or not at all
  pageCount?: number
  getRowId: (row: T) => string
  rowLabel: (row: T) => string
  // left out for a list that arrives whole: one page, no sorting
  params?: TableParams
  onParams?: (change: { page?: number; sort?: TableParams["sort"] }) => void
  pending: boolean
  error: boolean
  onRetry: () => void
  loadError?: { title: string; body: string }
  empty: ReactNode
  filtered?: boolean
  onClearFilters?: () => void
  // j/k move between rows' [data-row-open] targets, Enter follows them
  keyboard?: boolean
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode
  note?: ReactNode
  // cards below md; select is the row's checkbox when there are bulk actions
  mobileRow: (row: T, select: ReactNode) => ReactNode
}

const EMPTY: never[] = []
const WHOLE: TableParams = { page: 1, sort: null, q: "" }
const ignore = () => undefined

const stagger = (i: number) => `${Math.min(i, 6) * 30}ms`

export function DataTable<T extends RowData>({
  columns,
  data,
  total,
  pageCount,
  getRowId,
  rowLabel,
  params = WHOLE,
  onParams = ignore,
  pending,
  error,
  onRetry,
  loadError,
  empty,
  filtered = false,
  onClearFilters,
  keyboard = false,
  bulkActions,
  note,
  mobileRow,
}: DataTableProps<T>) {
  const { t } = useTranslation("common")
  // selection belongs to one page and sort; a new set of rows starts empty
  const scope = `${params.page}:${params.sort?.id ?? ""}:${String(params.sort?.desc)}`
  const [selection, setSelection] = useState<{
    scope: string
    rows: RowSelectionState
  }>({ scope, rows: {} })
  const rowSelection = selection.scope === scope ? selection.rows : {}
  const setRowSelection = (
    updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)
  ) => {
    setSelection({ scope, rows: functionalUpdate(updater, rowSelection) })
  }
  const [compact, setCompact] = useState(false)
  const body = useRef<HTMLTableSectionElement>(null)
  const showSkeleton = useDelayed(pending && !data)
  // rows rise in when they first arrive, not when cached data comes back
  const [enter] = useState(!data)

  const sorting = useMemo<SortingState>(
    () => (params.sort ? [{ id: params.sort.id, desc: params.sort.desc }] : []),
    [params.sort]
  )

  const selectColumn = useMemo(
    () =>
      selectionColumn<T>(t("table.selectAll"), (row) =>
        t("table.selectRow", { name: rowLabel(row) })
      ),
    [t, rowLabel]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns: useMemo(
      () => (bulkActions ? [selectColumn, ...columns] : columns),
      [bulkActions, selectColumn, columns]
    ),
    data: data ?? EMPTY,
    getRowId,
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
    state: {
      sorting,
      rowSelection,
      pagination: { pageIndex: params.page - 1, pageSize: PAGE_SIZE },
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting)[0]
      onParams({ sort: next ? { id: next.id, desc: next.desc } : null })
    },
    onRowSelectionChange: setRowSelection,
  })

  useRowKeys(keyboard, body)

  if (error && !data)
    return (
      <LoadError
        onRetry={onRetry}
        retrying={pending}
        title={loadError?.title}
        body={loadError?.body}
      />
    )
  if (!data)
    return showSkeleton ? (
      <TableSkeleton columns={table.getVisibleLeafColumns().length} />
    ) : null
  if (data.length === 0)
    return filtered && onClearFilters ? (
      <NoMatches onClear={onClearFilters} />
    ) : (
      empty
    )

  const pages = pageCount ?? Math.max(1, Math.ceil(total / PAGE_SIZE))
  const selected = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const clear = () => {
    setRowSelection({})
  }
  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide())

  return (
    <div className="flex flex-col gap-3">
      {error && <RefreshNote onRetry={onRetry} retrying={pending} />}
      <div className="flex min-h-7 items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground tabular-nums">
          {t("table.results", { count: total })}
          {note}
        </p>
        <ColumnsMenu
          columns={hideable.map(menuColumn)}
          compact={compact}
          onCompact={setCompact}
        />
      </div>

      <div
        className={cn(
          "hidden rounded-lg border transition-opacity md:block",
          pending && "opacity-60"
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={ariaSort(sorted)}
                      className={
                        header.column.id === "select" ? "w-10" : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <SortButton
                          sorted={sorted}
                          onSort={() => {
                            header.column.toggleSorting()
                          }}
                        >
                          <table.FlexRender header={header} />
                        </SortButton>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody ref={body}>
            {table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={cn(
                  "has-focus-visible:bg-muted/50 data-[state=selected]:bg-muted/50",
                  enter && "settle"
                )}
                style={enter ? { transitionDelay: stagger(i) } : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={compact ? "py-1.5" : "py-3"}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden">
        {table.getRowModel().rows.map((row, i) => (
          <li
            key={row.id}
            className={enter ? "settle" : undefined}
            style={enter ? { transitionDelay: stagger(i) } : undefined}
          >
            {mobileRow(
              row.original,
              bulkActions && (
                <RowCheckbox
                  label={t("table.selectRow", { name: rowLabel(row.original) })}
                  row={row}
                />
              )
            )}
          </li>
        ))}
      </ul>

      <TableFooter
        keyboard={keyboard}
        page={params.page}
        pages={pages}
        onPage={(page) => {
          onParams({ page })
        }}
      />

      {bulkActions && (
        <BulkBar count={selected.length} onClear={clear}>
          {bulkActions(selected, clear)}
        </BulkBar>
      )}
    </div>
  )
}
