import { useTranslation } from "@workspace/i18n/react"
import { readTableParams, writeTableParams } from "@workspace/api/table-params"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { href, useSearchParams } from "react-router"

import { AppLink } from "@/components/app-link"
import { DataTable } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { GuideLink } from "@/components/guide-link"
import { buttonLink } from "@/lib/button-link"

import { unlockedQuery } from "../../queries/candidate-unlock.queries"
import type { Unlocked } from "../../schemas/candidate-unlock.schema"
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
  const [search, setSearch] = useSearchParams()
  const table = readTableParams(search, { sortable: [] })
  const query = useQuery({
    ...unlockedQuery(table.page),
    placeholderData: keepPreviousData,
  })
  const columns = useUnlockedColumns(share)
  const rows = query.data?.results

  return (
    <DataTable
      columns={columns}
      data={rows}
      total={query.data?.count ?? rows?.length ?? 0}
      pageCount={query.data?.total_pages ?? undefined}
      getRowId={rowId}
      rowLabel={rowLabel}
      bulkActions={
        selected &&
        ((ids, clear) =>
          selected(
            (rows ?? []).filter((row) => ids.includes(row.id)),
            clear
          ))
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
      }
      mobileRow={(row, select) => (
        <UnlockedCard row={row} select={select} share={share} />
      )}
    />
  )
}
