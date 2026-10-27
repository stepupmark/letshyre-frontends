import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

import { pageWindow } from "@/lib/pages"

export function Pager({
  page,
  pages,
  hasNext = pages !== undefined && page < pages,
  onPage,
}: {
  page: number
  pages?: number
  hasNext?: boolean
  onPage: (page: number) => void
}) {
  const { t } = useTranslation("common")
  if (page === 1 && !hasNext) return null
  return (
    <nav
      aria-label={t("table.pages")}
      className="flex items-center justify-between gap-3"
    >
      <span className="text-sm text-muted-foreground tabular-nums sm:hidden">
        {pages ? t("table.pageOf", { page, total: pages }) : null}
      </span>
      {pages ? (
        <ol className="flex items-center gap-1 max-sm:hidden">
          {pageWindow(page, pages).map((item, i) =>
            item === null ? (
              <li
                key={`gap-${String(i)}`}
                aria-hidden="true"
                className="w-6 text-center text-sm text-muted-foreground"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <Button
                  variant={item === page ? "secondary" : "ghost"}
                  size="icon"
                  aria-label={t("table.page", { page: item })}
                  aria-current={item === page ? "page" : undefined}
                  className={cn(
                    "tabular-nums",
                    item === page &&
                      "bg-brand-muted text-brand-text hover:bg-brand-muted"
                  )}
                  onClick={() => {
                    if (item !== page) onPage(item)
                  }}
                >
                  {item}
                </Button>
              </li>
            )
          )}
        </ol>
      ) : (
        <span />
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="max-sm:h-11"
          disabled={page <= 1}
          onClick={() => {
            onPage(page - 1)
          }}
        >
          <ChevronLeft className="rtl:-scale-x-100" />
          {t("table.previous")}
        </Button>
        <Button
          variant="outline"
          className="max-sm:h-11"
          disabled={!hasNext}
          onClick={() => {
            onPage(page + 1)
          }}
        >
          {t("table.next")}
          <ChevronRight className="rtl:-scale-x-100" />
        </Button>
      </div>
    </nav>
  )
}
