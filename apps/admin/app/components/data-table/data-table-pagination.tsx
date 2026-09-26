import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "~/components/ui/button";

type DataTablePaginationProps = {
  page: number;
  pageCount: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
};

export function DataTablePagination({ page, pageCount, totalCount, onPageChange }: DataTablePaginationProps) {
  const lastPage = Math.max(pageCount, 1);
  const canGoBack = page > 1;
  const canGoForward = page < lastPage;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground">
        {totalCount !== undefined && `${totalCount.toLocaleString()} total · `}Page {page} of {lastPage}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" aria-label="First page" disabled={!canGoBack} onClick={() => onPageChange(1)}>
          <ChevronsLeft />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={!canGoBack} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Next page" disabled={!canGoForward} onClick={() => onPageChange(page + 1)}>
          <ChevronRight />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Last page" disabled={!canGoForward} onClick={() => onPageChange(lastPage)}>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
