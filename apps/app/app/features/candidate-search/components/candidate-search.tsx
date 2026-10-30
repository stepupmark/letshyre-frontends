import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { useLastDefined } from "@/hooks/use-last-defined"

import { useMedia } from "../hooks/use-media"
import { useSearchState } from "../hooks/use-search-state"
import { rowKey } from "../lib/result"
import { searchQuery } from "../queries/candidate-search.queries"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { PreviewSheet } from "./preview-sheet"
import { ResultList } from "./result-list"
import { ResultPreview } from "./result-preview"
import { StartState } from "./start-state"
import { Toolbar } from "./toolbar"

// Tailwind's lg, where the preview sits beside the list instead of in a sheet
const WIDE = "(min-width: 64rem)"

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
  const wide = useMedia(WIDE)
  const searching = params.search !== ""
  const settled = query.data !== undefined && !query.isPlaceholderData
  const rows = query.data?.results ?? []
  const picked = rows.find((row) => rowKey(row) === selected)
  const current = picked ?? (wide ? rows[0] : undefined)
  const sheetRow = useLastDefined(wide ? undefined : picked)

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
          selectedKey={current && rowKey(current)}
          preview={
            wide &&
            current && (
              <ResultPreview
                key={rowKey(current)}
                row={current}
                unlock={unlock(current)}
              />
            )
          }
          onSelect={(row) => {
            select(rowKey(row))
          }}
          onPage={(page) => {
            update({ page })
          }}
          onClearFilters={clearFilters}
        />
      ) : (
        <StartState />
      )}

      {!wide && (
        <PreviewSheet
          row={sheetRow}
          open={picked !== undefined}
          onClose={() => {
            select(null)
          }}
        >
          {sheetRow && (
            <ResultPreview row={sheetRow} unlock={unlock(sheetRow)} />
          )}
        </PreviewSheet>
      )}
    </div>
  )
}
