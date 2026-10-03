import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useFormatters } from "@/i18n/format";
import { cn } from "@/lib/utils";

// Compact page list with ellipses (1 … 4 5 [6] 7 8 … 20): always first + last
// plus a window around the current page.
const getPageItems = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);
  for (let i = left; i <= right; i++) range.push(i);
  if (totalPages > 1) range.push(totalPages);

  const items = [];
  let prev = 0;
  for (const page of range) {
    if (page - prev > 1) items.push({ type: "ellipsis", key: `gap-${prev}` });
    items.push({ type: "page", value: page, key: `page-${page}` });
    prev = page;
  }
  return items;
};

// tabular-nums is load-bearing — without it the buttons resize as the digits
// change and the row reflows while paging. min-w-9 keeps a proper hit target.
const PAGE_BUTTON_CLASS =
  "h-9 min-w-9 gap-1 border border-input bg-card px-3 font-semibold tabular-nums text-text-body hover:border-brand-300 hover:bg-bg-subtle active:scale-95 motion-reduce:active:scale-100";

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  count,
  pageSize,
}) => {
  const { t } = useTranslation("common");
  const { formatNumber } = useFormatters();
  const hasSummary = count != null && pageSize != null && count > 0;
  const showControls = totalPages > 1;
  if (!showControls && !hasSummary) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, count);
  const items = showControls ? getPageItems(currentPage, totalPages) : [];

  return (
    <div className="mt-5 mb-2 flex flex-col items-center gap-2">
      {hasSummary && (
        <span className="text-sm tabular-nums text-neutral-500">
          {t("pagination.summary", {
            from: formatNumber(from),
            to: formatNumber(to),
            count: formatNumber(count),
          })}
        </span>
      )}

      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            className={PAGE_BUTTON_CLASS}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label={t("pagination.previousPage")}
          >
            <ChevronLeft /> {t("pagination.previous")}
          </Button>

          {items.map((item) =>
            item.type === "ellipsis" ? (
              <span
                key={item.key}
                className="px-1 font-semibold text-neutral-400 select-none"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={item.key}
                type="button"
                variant="outline"
                className={cn(
                  PAGE_BUTTON_CLASS,
                  currentPage === item.value &&
                    "border-primary bg-primary text-primary-foreground hover:border-primary hover:bg-primary",
                )}
                onClick={() => onPageChange(item.value)}
                aria-label={t("pagination.page", { page: item.value })}
                aria-current={currentPage === item.value ? "page" : undefined}
              >
                {item.value}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            className={PAGE_BUTTON_CLASS}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label={t("pagination.nextPage")}
          >
            {t("pagination.next")} <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
};
