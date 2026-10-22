import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Kbd } from "@workspace/ui/components/kbd"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Settings2,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { useDelayed } from "@/hooks/use-delayed"
import {
  dataTableFeatures,
  type DataTableColumn,
} from "@/lib/data-table-features"
import { duration, ease } from "@/lib/motion"
import { PAGE_SIZE, type TableParams } from "@workspace/api/table-params"

import { NoMatches } from "./empty-state"
import { LoadError, RefreshNote } from "./query-state"

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

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

  const selectColumn = useMemo<DataTableColumn<T>>(
    () => ({
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          aria-label={t("table.selectAll")}
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(checked) => {
            table.toggleAllPageRowsSelected(checked)
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t("table.selectRow", { name: rowLabel(row.original) })}
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => {
            row.toggleSelected(checked)
          }}
        />
      ),
    }),
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

  useEffect(() => {
    if (!keyboard) return
    const onKey = (event: KeyboardEvent) => {
      if (typing(event.target) || event.metaKey || event.ctrlKey) return
      if (event.key !== "j" && event.key !== "k") return
      const targets = [
        ...(body.current?.querySelectorAll<HTMLElement>("[data-row-open]") ??
          []),
      ]
      if (!targets.length) return
      const current = targets.indexOf(document.activeElement as HTMLElement)
      const next =
        current === -1
          ? 0
          : Math.min(
              Math.max(current + (event.key === "j" ? 1 : -1), 0),
              targets.length - 1
            )
      targets[next]?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [keyboard])

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
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="max-md:hidden" />
            }
          >
            <Settings2 />
            {t("table.columns")}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {hideable.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("table.columns")}</DropdownMenuLabel>
                {hideable.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(visible) => {
                      column.toggleVisibility(visible)
                    }}
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={compact}
              onCheckedChange={setCompact}
            >
              {t("table.compact")}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={
                        header.column.id === "select" ? "w-10" : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ms-2"
                          onClick={() => {
                            header.column.toggleSorting()
                          }}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp />
                          ) : sorted === "desc" ? (
                            <ArrowDown />
                          ) : (
                            <ChevronsUpDown className="text-muted-foreground" />
                          )}
                        </Button>
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
                <Checkbox
                  aria-label={t("table.selectRow", {
                    name: rowLabel(row.original),
                  })}
                  checked={row.getIsSelected()}
                  onCheckedChange={(checked) => {
                    row.toggleSelected(checked)
                  }}
                />
              )
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3">
        {keyboard ? (
          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Kbd className="text-foreground">J</Kbd>
            <Kbd className="text-foreground">K</Kbd>
            {t("table.navigateHint")}
            <Kbd className="text-foreground">{t("table.enterKey")}</Kbd>
            {t("table.openHint")}
          </p>
        ) : (
          <span />
        )}
        {pages > 1 && (
          <nav
            aria-label={t("table.pageOf", { page: params.page, total: pages })}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-muted-foreground tabular-nums">
              {t("table.pageOf", { page: params.page, total: pages })}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t("table.previous")}
              disabled={params.page <= 1}
              onClick={() => {
                onParams({ page: params.page - 1 })
              }}
            >
              <ChevronLeft className="rtl:-scale-x-100" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t("table.next")}
              disabled={params.page >= pages}
              onClick={() => {
                onParams({ page: params.page + 1 })
              }}
            >
              <ChevronRight className="rtl:-scale-x-100" />
            </Button>
          </nav>
        )}
      </div>

      <AnimatePresence>
        {bulkActions && selected.length > 0 && (
          <m.div
            role="toolbar"
            aria-label={t("table.bulkActions")}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: duration.base, ease }}
            className="fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-md items-center gap-2 rounded-xl border bg-popover p-2 ps-4 text-sm shadow-lg"
          >
            <span className="me-auto tabular-nums">
              {t("table.selected", { count: selected.length })}
            </span>
            {bulkActions(selected, clear)}
            <Button size="sm" variant="ghost" onClick={clear}>
              {t("table.clearSelection")}
            </Button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TableSkeleton({ columns }: { columns: number }) {
  const { t } = useTranslation("common")
  const cells = Array.from({ length: Math.max(columns - 2, 0) }, (_, i) => i)
  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="flex flex-col gap-3"
    >
      <Skeleton className="my-1.5 h-4 w-24" />
      <div className="hidden divide-y rounded-lg border md:block">
        <div className="flex h-10 items-center gap-6 px-3">
          <Skeleton className="h-3 w-20" />
          {cells.map((i) => (
            <Skeleton key={i} className="h-3 max-w-16 flex-1" />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex items-center gap-6 px-3 py-3.5">
            <div className="flex w-48 shrink-0 items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            {cells.map((i) => (
              <Skeleton key={i} className="h-3.5 max-w-20 flex-1" />
            ))}
            <Skeleton className="ms-auto h-7 w-24" />
          </div>
        ))}
      </div>
      <ul className="flex flex-col gap-2 md:hidden">
        {[0, 1, 2].map((row) => (
          <li key={row} className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-11 w-full" />
          </li>
        ))}
      </ul>
    </div>
  )
}
