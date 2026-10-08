import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/format"

// page size isn't passed in, so it's inferred from a full page; the last page counts back from the total
function rangeLabel(
  page: number,
  lastPage: number,
  rowCount: number,
  totalCount: number | undefined
) {
  if (totalCount === undefined) return `Page ${page} of ${lastPage}`
  if (!rowCount) return `${formatNumber(totalCount)} results`
  const end = page >= lastPage ? totalCount : (page - 1) * rowCount + rowCount
  const start =
    page >= lastPage ? totalCount - rowCount + 1 : end - rowCount + 1
  return `Showing ${formatNumber(start)}–${formatNumber(end)} of ${formatNumber(totalCount)}`
}

interface DataTablePaginationProps {
  page: number
  pageCount: number
  totalCount?: number
  rowCount: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page,
  pageCount,
  totalCount,
  rowCount,
  onPageChange,
}: DataTablePaginationProps) {
  const lastPage = Math.max(pageCount, 1)
  const canGoBack = page > 1
  const canGoForward = page < lastPage

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground tabular-nums">
        {rangeLabel(page, lastPage, rowCount, totalCount)}
      </p>
      <div className="flex items-center gap-1">
        <span className="me-2 hidden text-muted-foreground tabular-nums sm:inline">
          Page {page} of {lastPage}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="First page"
          disabled={!canGoBack}
          onClick={() => {
            onPageChange(1)
          }}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={!canGoBack}
          onClick={() => {
            onPageChange(page - 1)
          }}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={!canGoForward}
          onClick={() => {
            onPageChange(page + 1)
          }}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Last page"
          disabled={!canGoForward}
          onClick={() => {
            onPageChange(lastPage)
          }}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}
