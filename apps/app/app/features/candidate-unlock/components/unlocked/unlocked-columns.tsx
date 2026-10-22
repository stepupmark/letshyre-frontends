import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useMemo, type ReactNode } from "react"

import type { DataTableColumn } from "@/lib/data-table-features"

import { placeOf, unlockedOn } from "../../lib/unlocked"
import type { Unlocked } from "../../schemas/candidate-unlock.schema"
import { Band, Blank, Experience, Pay } from "./facts"
import { Person } from "./person"
import { UnlockedActions } from "./unlocked-actions"

// the table needs stable columns, or it rebuilds every row on each render
export function useUnlockedColumns(share?: (row: Unlocked) => ReactNode) {
  const { t } = useTranslation("unlock")
  const locale = useLocale()
  return useMemo<DataTableColumn<Unlocked>[]>(
    () => [
      {
        id: "candidate",
        header: t("list.columns.candidate"),
        enableHiding: false,
        cell: ({ row }) => <Person row={row.original} />,
      },
      {
        id: "experience",
        header: t("list.columns.experience"),
        cell: ({ row }) => <Experience row={row.original} />,
      },
      {
        id: "place",
        header: t("list.columns.place"),
        cell: ({ row }) => {
          const place = placeOf(row.original)
          return place ? (
            <span className="block max-w-48 truncate text-muted-foreground">
              {place}
            </span>
          ) : (
            <Blank />
          )
        },
      },
      {
        id: "pay",
        header: t("list.columns.pay"),
        cell: ({ row }) => <Pay row={row.original} />,
      },
      {
        id: "notice",
        header: t("list.columns.notice"),
        cell: ({ row }) => {
          const days = row.original.candidate_notice_period
          return days == null ? (
            <Blank />
          ) : (
            <span className="tabular-nums">
              {t("list.days", { count: days })}
            </span>
          )
        },
      },
      {
        id: "interview",
        header: t("list.columns.interview"),
        cell: ({ row }) => <Band row={row.original} />,
      },
      {
        id: "unlocked",
        header: t("list.columns.unlocked"),
        cell: ({ row }) => {
          const date = unlockedOn(row.original, locale)
          return date ? (
            <span className="whitespace-nowrap text-muted-foreground tabular-nums">
              {date}
            </span>
          ) : (
            <Blank />
          )
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="sr-only">{t("list.columns.actions")}</span>
        ),
        enableHiding: false,
        cell: ({ row }) => <UnlockedActions row={row.original} share={share} />,
      },
    ],
    [t, locale, share]
  )
}
