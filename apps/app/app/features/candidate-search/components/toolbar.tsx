import { useStuck } from "../hooks/use-stuck"
import type { SearchChange, SearchParams } from "../types"
import { ActiveFilters, FilterBar } from "./filters/filter-bar"
import { SearchBar } from "./search-bar"

export function Toolbar({
  params,
  busy,
  total,
  onChange,
  onClear,
}: {
  params: SearchParams
  busy: boolean
  total: number | null
  onChange: (change: SearchChange) => void
  onClear: () => void
}) {
  const { sentinel, stuck } = useStuck()

  return (
    <>
      <div ref={sentinel} aria-hidden="true" />
      <div
        data-stuck={stuck || undefined}
        className="sticky top-14 z-10 -mx-4 flex flex-col gap-3 border-b border-transparent bg-background/95 px-4 py-3 backdrop-blur-sm transition-colors duration-200 data-stuck:border-border supports-backdrop-filter:bg-background/80 motion-reduce:transition-none md:-mx-8 md:px-8"
      >
        <div className="flex items-center gap-2">
          <SearchBar
            value={params.search}
            busy={busy}
            onSearch={(search) => {
              onChange({ search })
            }}
          />
          <FilterBar
            filters={params}
            total={total}
            onChange={onChange}
            onClear={onClear}
          />
        </div>
        <ActiveFilters filters={params} onChange={onChange} onClear={onClear} />
      </div>
    </>
  )
}
