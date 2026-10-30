import { useTranslation } from "@workspace/i18n/react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

import { EmptyState } from "@/components/empty-state"
import { useLastDefined } from "@/hooks/use-last-defined"

import { useSearchState } from "../hooks/use-search-state"
import { rowKey } from "../lib/result"
import { searchQuery } from "../queries/candidate-search.queries"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { FilterBar } from "./filters/filter-bar"
import { ResultList } from "./result-list"
import { SearchArt } from "./search-art"
import { SearchBar } from "./search-bar"
import { UnlockDialog } from "./unlock-dialog"

export function CandidateSearch({
  unlock,
  suggestions = [],
}: {
  unlock: (row: SearchResult) => ReactNode
  suggestions?: string[]
}) {
  const { t } = useTranslation("candidateSearch")
  const { params, update, clearFilters } = useSearchState()
  const query = useQuery({
    ...searchQuery(params),
    placeholderData: keepPreviousData,
  })
  const [openKey, setOpenKey] = useState<string | null>(null)
  const open = query.data?.results.find((row) => rowKey(row) === openKey)
  const shown = useLastDefined(open)
  const searching = params.search !== ""
  const settled = query.data !== undefined && !query.isPlaceholderData

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <SearchBar
          value={params.search}
          busy={searching && query.isFetching}
          onSearch={(search) => {
            update({ search })
          }}
        />
        <FilterBar
          filters={params}
          total={
            searching && settled
              ? (query.data.count ?? query.data.results.length)
              : null
          }
          onChange={update}
          onClear={clearFilters}
        />
      </div>

      {searching ? (
        <ResultList
          query={query}
          params={params}
          onPage={(page) => {
            update({ page })
          }}
          onUnlock={(row) => {
            setOpenKey(rowKey(row))
          }}
          onClearFilters={clearFilters}
        />
      ) : (
        <EmptyState
          art={<SearchArt />}
          title={t("idle.title")}
          description={t("idle.body")}
          action={
            suggestions.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {t("idle.suggest")}
                </p>
                <ul className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((role) => (
                    <li key={role}>
                      <button
                        type="button"
                        onClick={() => {
                          update({ search: role })
                        }}
                        className="h-8 rounded-full border bg-background px-3 text-sm transition-colors outline-none hover:border-brand/40 hover:bg-brand-muted hover:text-brand-text focus-visible:ring-3 focus-visible:ring-ring/50 max-md:h-11"
                      >
                        {role}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }
        />
      )}

      <UnlockDialog
        row={shown}
        open={open !== undefined}
        onClose={() => {
          setOpenKey(null)
        }}
      >
        {shown && unlock(shown)}
      </UnlockDialog>
    </div>
  )
}
