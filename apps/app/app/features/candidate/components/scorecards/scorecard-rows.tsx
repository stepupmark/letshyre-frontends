import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import * as m from "motion/react-m"
import { useId } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { duration, ease } from "@/lib/motion"

import { roleOf, takenOn } from "../../lib/scorecards"
import { ownScorecardQuery } from "../../queries/candidate.queries"
import type { ScorecardItem } from "../../schemas/candidate.schema"
import { ItemBand } from "./band"

export function ScorecardRows({
  items,
  enter,
}: {
  items: ScorecardItem[]
  enter: boolean
}) {
  const { t } = useTranslation("candidate")
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <h2
        id={titleId}
        className="text-base font-semibold tracking-tight text-balance"
      >
        {t("list.earlier")}
      </h2>
      <ul className="divide-y overflow-hidden rounded-lg border bg-card">
        {items.map((item, i) => (
          <m.li
            key={item.id}
            initial={enter ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.base,
              ease,
              delay: (Math.min(i, 5) + 1) * 0.03,
            }}
          >
            <Row item={item} />
          </m.li>
        ))}
      </ul>
    </section>
  )
}

function Row({ item }: { item: ScorecardItem }) {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  const client = useQueryClient()
  const date = takenOn(item, locale)
  const prefetch = () => {
    client.query(ownScorecardQuery(item.id)).catch(() => undefined)
  }

  return (
    <AppLink
      to={href("/employee/scorecards/:scorecardId", { scorecardId: item.id })}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      className="group flex min-h-14 items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:inset-ring-2 focus-visible:inset-ring-ring/50 sm:gap-4"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="min-w-0 truncate text-sm font-medium first-letter:uppercase sm:flex-1">
          {roleOf(item) ?? t("list.interview")}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums sm:w-28 sm:shrink-0 sm:text-sm">
          {date ?? (
            <>
              <span aria-hidden="true">–</span>
              <span className="sr-only">{t("list.noDate")}</span>
            </>
          )}
        </span>
      </span>
      <ItemBand item={item} />
      <ChevronRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 rtl:group-focus-visible:-translate-x-0.5"
      />
    </AppLink>
  )
}
