import { useLocale, useTranslation } from "@workspace/i18n/react"
import type { ReactNode } from "react"

import { experienceOf, payOf, placeOf, unlockedOn } from "../../lib/unlocked"
import type { Unlocked } from "../../schemas/candidate-unlock.schema"
import { Band } from "./facts"
import { Person } from "./person"
import { UnlockedActions } from "./unlocked-actions"

export function UnlockedCard({
  row,
  select,
  share,
}: {
  row: Unlocked
  select: ReactNode
  share?: (row: Unlocked) => ReactNode
}) {
  const { t } = useTranslation("unlock")
  const locale = useLocale()
  const years = experienceOf(row.candidate_total_experience_years)
  const pay = payOf(row)
  const date = unlockedOn(row, locale)
  const facts = [
    years === null
      ? null
      : years === "under"
        ? t("list.underYear")
        : t("list.years", { count: years }),
    placeOf(row),
    pay && t("list.payShort", { now: pay.now ?? "—", next: pay.next ?? "—" }),
    date && t("list.unlockedOn", { date }),
  ].filter(Boolean)

  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        {select && <span className="flex h-10 items-center">{select}</span>}
        <span className="min-w-0 flex-1">
          <Person row={row} />
        </span>
        <Band row={row} />
      </div>
      {facts.length > 0 && (
        <p className="text-sm text-pretty text-muted-foreground tabular-nums">
          {facts.join(" · ")}
        </p>
      )}
      <UnlockedActions row={row} share={share} />
    </article>
  )
}
