import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { useReducedMotion } from "motion/react"
import { useId, useRef } from "react"

import { EmptyState } from "@/components/empty-state"
import { GuideLink } from "@/components/guide-link"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { useDetailParam } from "@/hooks/use-detail-param"
import { FilterChips } from "@/components/filter-chips"
import { Pager } from "@/components/pager"

import { useFilterChips } from "../hooks/use-filter-chips"
import { useJobSearch, useSavedSearches } from "../hooks/use-job-search"
import { filterCount } from "../lib/search"
import { findJobsQuery } from "../queries/candidate-jobs.queries"
import { FilterRail, FilterSheet } from "./filter-panel"
import { JobSheet } from "./job-sheet"
import { ResultsHeader } from "./results-header"
import { ResultsList, ResultsSkeleton } from "./results-list"
import { SavedSearches } from "./saved-searches"
import { SearchBar } from "./search-bar"

export function FindJobs() {
  const { t } = useTranslation(["candidateJobs", "common"])
  const { search, key, update, clear, clearAll, restore } = useJobSearch()
  const saved = useSavedSearches(key)
  const { chipsOf } = useFilterChips()
  const query = useQuery(findJobsQuery(search))
  const skeleton = useDelayed(query.isPending)
  const [openId, setOpenId] = useDetailParam("job")
  const reduceMotion = useReducedMotion()
  const heading = useRef<HTMLHeadingElement>(null)
  const headingId = useId()

  const jobs = query.data?.jobs
  const total = query.data?.total ?? null
  const chips = chipsOf(search)
  const count = filterCount(search)
  const stale = query.isFetching && query.isPlaceholderData
  const { q, location } = search
  const title =
    q && location
      ? t("find.titleIn", { q, location })
      : q
        ? t("find.titleFor", { q })
        : location
          ? t("find.titleWhere", { location })
          : t("find.title")

  const savedList = (
    <SavedSearches
      saved={saved.saved}
      active={key}
      onPick={restore}
      onRemove={saved.remove}
    />
  )
  const panel = {
    search,
    count,
    onChange: update,
    onClear: clear,
    saved: saved.saved.length > 0 ? savedList : null,
  }

  return (
    <div className="flex flex-col gap-6">
      <title>{`${title} · ${t("common:appName")}`}</title>
      <SearchBar search={search} busy={stale} onSearch={update} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <FilterRail {...panel} />

        <section
          aria-labelledby={headingId}
          className="flex min-w-0 flex-1 flex-col gap-4"
        >
          <ResultsHeader
            headingRef={heading}
            headingId={headingId}
            total={total}
            page={search.page}
            shown={jobs?.length ?? 0}
            sort={search.sort}
            onSort={(sort) => {
              update({ sort })
            }}
            saved={key ? saved.isSaved : null}
            onToggleSaved={saved.toggle}
            filters={<FilterSheet {...panel} total={total} />}
          />

          {chips.length > 0 && (
            <FilterChips
              chips={chips}
              onRemove={(chip) => {
                update(chip.remove)
              }}
              onClear={clearAll}
            />
          )}

          {query.isError && !query.data ? (
            <LoadError
              onRetry={() => void query.refetch()}
              retrying={query.isRefetching}
            />
          ) : !jobs ? (
            skeleton && <ResultsSkeleton />
          ) : jobs.length === 0 ? (
            key ? (
              <EmptyState
                title={t("empty.filteredTitle")}
                description={t("empty.filteredBody")}
                action={
                  <Button variant="outline" onClick={clearAll}>
                    {t("common:empty.clearFilters")}
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title={t("empty.title")}
                description={t("empty.body")}
                action={<GuideLink chapter="afterInterview" />}
              />
            )
          ) : (
            <ResultsList
              jobs={jobs}
              query={search.q}
              stale={stale}
              onOpen={setOpenId}
            />
          )}

          {query.data && (
            <Pager
              page={search.page}
              pages={query.data.pages}
              onPage={(page) => {
                update({ page })
                heading.current?.focus({ preventScroll: true })
                heading.current?.scrollIntoView({
                  block: "start",
                  behavior: reduceMotion ? "auto" : "smooth",
                })
              }}
            />
          )}
        </section>
      </div>

      <JobSheet
        jobs={jobs}
        openId={openId}
        query={search.q}
        onOpen={setOpenId}
      />
    </div>
  )
}
