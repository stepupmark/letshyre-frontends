import { useTranslation } from "@workspace/i18n/react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

import { useLastDefined } from "@/hooks/use-last-defined"

import { useSearchState } from "../hooks/use-search-state"
import { rowKey } from "../lib/result"
import { searchQuery } from "../queries/candidate-search.queries"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { FilterBar } from "./filters/filter-bar"
import { IdleGuide } from "./idle-guide"
import { ResultList } from "./result-list"
import { SearchBar } from "./search-bar"
import { UnlockDialog } from "./unlock-dialog"

export function CandidateSearch({
  unlock,
}: {
  unlock: (row: SearchResult) => ReactNode
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
      <section
        aria-label={t("panel")}
        className="flex flex-col gap-4 rounded-2xl border bg-brand-muted/30 p-4 sm:p-6"
      >
        <SearchBar
          value={params.search}
          busy={searching && query.isFetching}
          onSearch={(search) => {
            update({ search })
          }}
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4">
          <span className="text-xs font-medium text-muted-foreground max-md:hidden">
            {t("narrowBy")}
          </span>
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
      </section>

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
        <IdleGuide />
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
