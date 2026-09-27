import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  flexRender,
  type RowData,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ErrorState } from "~/components/feedback/error-state";
import { Skeleton } from "~/components/ui/skeleton";
import { useHotkey } from "~/hooks/use-hotkey";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- must match the library's signature
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "right";
  }
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[] | undefined;
  getRowId?: (row: TData) => string;
  /** 1-based, matches the API. */
  page: number;
  pageCount: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty?: ReactNode;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
};

const SKELETON_ROWS = 8;

const alignClass = (meta?: { align?: "right" }) =>
  meta?.align === "right" ? "text-right tabular-nums" : undefined;

export function DataTable<TData>({
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
}: DataTableProps<TData>) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    enableRowSelection: Boolean(onRowSelectionChange),
    state: { rowSelection: rowSelection ?? {} },
    onRowSelectionChange,
  });

  const columnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const [activeRow, setActiveRow] = useState(-1);

  useEffect(() => setActiveRow(-1), [data]);
  useEffect(() => {
    bodyRef.current?.rows[activeRow]?.scrollIntoView({ block: "nearest" });
  }, [activeRow]);

  useHotkey(
    ["j", "k", "Enter"],
    (event) => {
      if (event.key === "Enter") {
        if (activeRow < 0 || (event.target as Element).closest("a, button"))
          return;
        bodyRef.current?.rows[activeRow]
          ?.querySelector<HTMLElement>("a[href]")
          ?.click();
        return;
      }
      event.preventDefault();
      const step = event.key === "j" ? 1 : -1;
      setActiveRow((index) =>
        Math.min(Math.max(index + step, 0), rows.length - 1),
      );
    },
    rows.length > 0,
  );

  if (error && !data)
    return (
      <ErrorState
        error={error}
        onRetry={onRetry}
        className="rounded-lg border"
      />
    );

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
                    className={alignClass(header.column.columnDef.meta)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody ref={bodyRef}>
            {isLoading && !data ? (
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
                  className="data-active:bg-muted data-active:shadow-[inset_2px_0_0_var(--primary)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={alignClass(cell.column.columnDef.meta)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="h-48 text-center">
                  {empty ?? (
                    <span className="text-muted-foreground">No results.</span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        page={page}
        pageCount={pageCount}
        totalCount={totalCount}
        rowCount={rows.length}
        onPageChange={onPageChange}
      />
    </div>
  );
}
