import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { useLastDefined } from "@/hooks/use-last-defined"

import { useSearchState } from "../hooks/use-search-state"
import { useViewed } from "../hooks/use-viewed"
import { neighbours } from "../lib/nav"
import { rowKey } from "../lib/result"
import { searchQuery } from "../queries/candidate-search.queries"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { CandidateDialog } from "./candidate-dialog/candidate-dialog"
import { CandidateProfile } from "./candidate-dialog/candidate-profile"
import { ResultList } from "./result-list"
import { StartState } from "./start-state"
import { Toolbar } from "./toolbar"

export function CandidateSearch({
  unlock,
}: {
  unlock: (row: SearchResult) => ReactNode
}) {
  const { params, selected, update, select, clearFilters } = useSearchState()
  const query = useQuery({
    ...searchQuery(params),
    placeholderData: keepPreviousData,
  })
  const searching = params.search !== ""
  const settled = query.data !== undefined && !query.isPlaceholderData
  const rows = query.data?.results ?? []
  const keys = rows.map(rowKey)
  const picked = rows.find((row) => rowKey(row) === selected)
  const shown = useLastDefined(picked)
  const nav = neighbours(keys, selected)
  const previous = nav?.previous
  const next = nav?.next
  const { viewed, markViewed } = useViewed()

  const open = (key: string) => {
    markViewed(key)
    select(key)
  }

  return (
    <div className="flex flex-col gap-4">
      <Toolbar
        params={params}
        busy={searching && query.isFetching}
        total={
          searching && settled
            ? (query.data.count ?? query.data.results.length)
            : null
        }
        onChange={update}
        onClear={clearFilters}
      />

      {searching ? (
        <ResultList
          query={query}
          params={params}
          openKey={picked ? selected : null}
          viewed={viewed}
          onOpen={(row) => {
            open(rowKey(row))
          }}
          onPage={(page) => {
            update({ page })
          }}
          onClearFilters={clearFilters}
        />
      ) : (
        <StartState />
      )}

      <CandidateDialog
        open={picked !== undefined}
        contentKey={shown && rowKey(shown)}
        position={nav && { current: nav.index + 1, total: keys.length }}
        onPrevious={
          previous
            ? () => {
                open(previous)
              }
            : null
        }
        onNext={
          next
            ? () => {
                open(next)
              }
            : null
        }
        onClose={() => {
          if (shown) markViewed(rowKey(shown))
          select(null)
        }}
        returnFocus={() =>
          shown
            ? document.querySelector<HTMLElement>(
                `[data-row="${CSS.escape(rowKey(shown))}"]`
              )
            : null
        }
      >
        {shown && <CandidateProfile row={shown} unlock={unlock(shown)} />}
      </CandidateDialog>
    </div>
  )
}
