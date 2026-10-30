import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { UseQueryResult } from "@tanstack/react-query"
import * as m from "motion/react-m"
import { useRef } from "react"

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
import { ResultCard } from "./result-card"
import { ResultSkeleton } from "./result-skeleton"
import { SearchArt } from "./search-art"

interface Page {
  results: SearchResult[]
  count: number | null
  total_pages: number | null
}

export function ResultList({
  query,
  params,
  onPage,
  onUnlock,
  onClearFilters,
}: {
  query: UseQueryResult<Page>
  params: SearchParams
  onPage: (page: number) => void
  onUnlock: (row: SearchResult) => void
  onClearFilters: () => void
}) {
  const { t } = useTranslation("candidateSearch")
  const locale = useLocale()
  const heading = useRef<HTMLHeadingElement>(null)
  const skeleton = useDelayed(query.isPending)
  const rows = query.data?.results ?? []
  const total = query.data?.count ?? rows.length
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
        art={<SearchArt />}
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

  return (
    <section aria-labelledby="search-results" className="flex flex-col gap-4">
      <div aria-live="polite">
        <h2
          ref={heading}
          id="search-results"
          tabIndex={-1}
          className="text-base text-muted-foreground outline-none"
        >
          <Trans
            t={t}
            i18nKey="count"
            count={total}
            values={{ search: params.search }}
            components={{
              n: (
                <span className="font-semibold text-brand-text">
                  <AnimatedNumber value={total} locale={locale} />
                </span>
              ),
            }}
          />
        </h2>
      </div>
      <ol
        aria-busy={query.isPlaceholderData}
        className={cn(
          "flex flex-col gap-3 transition-opacity duration-200 motion-reduce:transition-none",
          query.isPlaceholderData && "opacity-60"
        )}
      >
        {rows.map((row, i) => (
          <m.li
            key={`${String(params.page)}:${rowKey(row)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.base,
              ease,
              delay: Math.min(i, 6) * 0.04,
            }}
          >
            <ResultCard
              row={row}
              search={params.search}
              onUnlock={() => {
                onUnlock(row)
              }}
            />
          </m.li>
        ))}
      </ol>
      <Pager
        page={params.page}
        pages={query.data.total_pages ?? undefined}
        onPage={(page) => {
          onPage(page)
          heading.current?.focus()
        }}
      />
    </section>
  )
}
