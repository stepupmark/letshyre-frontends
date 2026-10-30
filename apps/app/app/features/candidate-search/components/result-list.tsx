import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { UseQueryResult } from "@tanstack/react-query"
import * as m from "motion/react-m"
import { useRef, type KeyboardEvent, type ReactNode } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { EmptyState } from "@/components/empty-state"
import { Pager } from "@/components/pager"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { duration, ease } from "@/lib/motion"

import { filterCount } from "../lib/params"
import { rowKey } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"
import type { SearchParams } from "../types"
import { ResultRow } from "./result-row"
import { ResultSkeleton } from "./result-skeleton"

interface Page {
  results: SearchResult[]
  count: number | null
  total_pages: number | null
}

const NEXT = new Set(["ArrowDown", "j"])
const PREVIOUS = new Set(["ArrowUp", "k"])

export function ResultList({
  query,
  params,
  selectedKey,
  preview,
  onSelect,
  onPage,
  onClearFilters,
}: {
  query: UseQueryResult<Page>
  params: SearchParams
  selectedKey: string | undefined
  preview: ReactNode
  onSelect: (row: SearchResult) => void
  onPage: (page: number) => void
  onClearFilters: () => void
}) {
  const { t } = useTranslation(["candidateSearch", "common"])
  const locale = useLocale()
  const heading = useRef<HTMLHeadingElement>(null)
  const skeleton = useDelayed(query.isPending)
  const rows = query.data?.results ?? []
  const total = query.data?.count ?? rows.length
  const pages = query.data?.total_pages ?? 1
  const settled = query.data !== undefined && !query.isPlaceholderData

  if (query.isError && !query.data)
    return (
      <LoadError
        title={t("errorTitle")}
        body={t("errorBody")}
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    )
  if (!query.data) return skeleton ? <ResultSkeleton /> : null

  if (settled && rows.length === 0)
    return (
      <EmptyState
        title={t("emptyTitle", { search: params.search })}
        description={
          filterCount(params) > 0 ? t("emptyFiltered") : t("emptyBody")
        }
        action={
          filterCount(params) > 0 && (
            <Button variant="outline" onClick={onClearFilters}>
              {t("filters.clear")}
            </Button>
          )
        }
      />
    )

  const move = (event: KeyboardEvent<HTMLButtonElement>, from: number) => {
    const step = NEXT.has(event.key) ? 1 : PREVIOUS.has(event.key) ? -1 : 0
    if (step === 0 || event.metaKey || event.ctrlKey || event.altKey) return
    const list = event.currentTarget.closest("ol")
    if (!list) return
    const buttons = [...list.querySelectorAll<HTMLButtonElement>("[data-row]")]
    const to = Math.min(buttons.length - 1, Math.max(0, from + step))
    const row = rows[to]
    event.preventDefault()
    buttons[to]?.focus()
    if (row) onSelect(row)
  }

  return (
    <section aria-labelledby="search-results" className="flex flex-col gap-4">
      <div
        aria-live="polite"
        className="flex items-baseline justify-between gap-3"
      >
        <h2
          ref={heading}
          id="search-results"
          tabIndex={-1}
          className="text-sm text-muted-foreground outline-none"
        >
          <Trans
            t={t}
            i18nKey="count"
            count={total}
            values={{ search: params.search }}
            components={{
              n: (
                <span className="text-base font-semibold text-brand-text">
                  <AnimatedNumber value={total} locale={locale} />
                </span>
              ),
            }}
          />
        </h2>
        {pages > 1 && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums max-sm:hidden">
            {t("common:table.pageOf", { page: params.page, total: pages })}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <ol
            aria-labelledby="search-results"
            aria-busy={query.isPlaceholderData}
            className={cn(
              "divide-y overflow-hidden rounded-xl border transition-opacity duration-200 motion-reduce:transition-none",
              query.isPlaceholderData && "opacity-60"
            )}
          >
            {rows.map((row, i) => (
              <m.li
                key={`${String(params.page)}:${rowKey(row)}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: duration.base,
                  ease,
                  delay: Math.min(i, 8) * 0.03,
                }}
              >
                <ResultRow
                  row={row}
                  search={params.search}
                  selected={rowKey(row) === selectedKey}
                  onSelect={() => {
                    onSelect(row)
                  }}
                  onKeyDown={(event) => {
                    move(event, i)
                  }}
                />
              </m.li>
            ))}
          </ol>
          <Pager
            page={params.page}
            pages={pages}
            onPage={(page) => {
              onPage(page)
              heading.current?.focus()
            }}
          />
        </div>
        {preview && (
          <aside className="sticky top-36 max-h-[calc(100svh-10rem)] overflow-y-auto rounded-xl border max-lg:hidden lg:col-span-3">
            {preview}
          </aside>
        )}
      </div>
    </section>
  )
}
