import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Bookmark, BookmarkCheck } from "lucide-react"
import type { ReactNode, Ref } from "react"

import { AnimatedNumber } from "@/components/animated-number"

import { PAGE_SIZE, SORTS, type Sort } from "../lib/search"

export function ResultsHeader({
  headingRef,
  headingId,
  total,
  page,
  shown,
  sort,
  onSort,
  saved,
  onToggleSaved,
  filters,
}: {
  headingRef: Ref<HTMLHeadingElement>
  headingId: string
  total: number | null
  page: number
  shown: number
  sort: Sort
  onSort: (sort: Sort) => void
  saved: boolean | null
  onToggleSaved: () => void
  filters: ReactNode
}) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const from = (page - 1) * PAGE_SIZE + 1
  const sorts = SORTS.map((value) => ({ value, label: t(`sort.${value}`) }))

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h2
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className="text-base font-semibold tracking-tight outline-none"
        >
          {total === null ? (
            t("searching")
          ) : (
            <Trans
              t={t}
              i18nKey="results"
              count={total}
              components={{
                n: <AnimatedNumber value={total} locale={locale} />,
              }}
            />
          )}
        </h2>
        {total !== null && shown > 0 && total > shown && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {t("showing", { from, to: from + shown - 1 })}
          </p>
        )}
        <p aria-live="polite" className="sr-only">
          {total === null ? t("searching") : t("found", { count: total })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        <Select
          items={sorts}
          value={sort}
          onValueChange={(value) => {
            if (value) onSort(value)
          }}
        >
          <SelectTrigger aria-label={t("sort.label")} className="max-sm:h-11">
            <span className="text-muted-foreground">{t("sort.label")}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {sorts.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {saved !== null && (
          <Button
            variant="outline"
            className="max-sm:h-11"
            aria-pressed={saved}
            onClick={onToggleSaved}
          >
            {saved ? <BookmarkCheck /> : <Bookmark />}
            {saved ? t("saved.saved") : t("saved.save")}
          </Button>
        )}
      </div>
    </div>
  )
}
