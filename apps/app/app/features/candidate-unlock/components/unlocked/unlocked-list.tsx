import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { PAGE_SIZE, writeTableParams } from "@workspace/api/table-params"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { GuideLink } from "@/components/guide-link"
import { buttonLink } from "@/lib/button-link"

import { useUnlockedFilters } from "../../hooks/use-unlocked-filters"
import { filterCount, filterKey } from "../../lib/filters"
import { unlockedQuery } from "../../queries/candidate-unlock.queries"
import type { Unlocked } from "../../schemas/candidate-unlock.schema"
import { FilterBar } from "./filters/filter-bar"
import { NoMatches } from "./no-matches"
import { UnlockedCard } from "./unlocked-card"
import { useUnlockedColumns } from "./unlocked-columns"

const rowId = (row: Unlocked) => row.id
const rowLabel = (row: Unlocked) => row.candidate_name ?? row.id

export function UnlockedList({
  share,
  selected,
  note,
}: {
  share?: (row: Unlocked) => ReactNode
  selected?: (rows: Unlocked[], clear: () => void) => ReactNode
  note?: ReactNode
}) {
  const { t } = useTranslation("unlock")
  const locale = useLocale()
  const { filters, table, setSearch, update, clear } = useUnlockedFilters()
  const query = useQuery({
    ...unlockedQuery({ page: table.page, limit: PAGE_SIZE, filters }),
    placeholderData: keepPreviousData,
  })
  const columns = useUnlockedColumns(share)
  const rows = query.data?.results
  const total = query.data?.count ?? rows?.length ?? 0
  const filtered = filterCount(filters) > 0

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        filters={filters}
        total={query.isPlaceholderData || !query.data ? null : total}
        onChange={update}
        onClear={clear}
      />
      <DataTable
        columns={columns}
        data={rows}
        total={total}
        pageCount={query.data?.total_pages ?? undefined}
        getRowId={rowId}
        rowLabel={rowLabel}
        label={t("list.title")}
        filterKey={filterKey(filters)}
        bulkActions={
          selected &&
          ((ids, clear) =>
            selected(
              (rows ?? []).filter((row) => ids.includes(row.id)),
              clear
            ))
        }
        summary={
          <Trans
            t={t}
            i18nKey={filtered ? "filters.matching" : "filters.total"}
            count={total}
            components={{
              n: (
                <span className="font-semibold text-brand-text">
                  <AnimatedNumber value={total} locale={locale} />
                </span>
              ),
            }}
          />
        }
        note={note}
        params={table}
        onParams={(next) => {
          setSearch((prev) => writeTableParams(prev, next), {
            preventScrollReset: true,
          })
        }}
        pending={query.isFetching}
        error={query.isError}
        onRetry={() => void query.refetch()}
        loadError={{ title: t("list.errorTitle"), body: t("list.errorBody") }}
        empty={
          filtered ? (
            <NoMatches onClear={clear} />
          ) : (
            <EmptyState
              title={t("list.emptyTitle")}
              description={t("list.emptyBody")}
              action={
                <div className="flex flex-col items-center gap-3">
                  <AppLink
                    to={href("/employer/candidates")}
                    className={buttonLink({ variant: "outline" })}
                  >
                    {t("list.toPool")}
                  </AppLink>
                  <GuideLink chapter="unlock" />
                </div>
              }
            />
          )
        }
        mobileRow={(row, select) => (
          <UnlockedCard row={row} select={select} share={share} />
        )}
      />
    </div>
  )
}
