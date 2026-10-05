import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
      <span className="text-sm text-muted-foreground tabular-nums">
        {pages ? t("table.pageOf", { page, total: pages }) : null}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
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
          size="sm"
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
