import { useTranslation } from "@workspace/i18n/react"

import { StatusBadge } from "@/components/status-badge"
import { bandOf, toneOf } from "@/lib/score-band"

import { experienceOf, payOf } from "../../lib/unlocked"
import type { Unlocked } from "../../schemas/candidate-unlock.schema"

export function Blank() {
  return <span className="text-muted-foreground">—</span>
}

export function Experience({ row }: { row: Unlocked }) {
  const { t } = useTranslation("unlock")
  const years = experienceOf(row.candidate_total_experience_years)
  if (years === null) return <Blank />
  return (
    <span className="tabular-nums">
      {years === "under"
        ? t("list.underYear")
        : t("list.years", { count: years })}
    </span>
  )
}

export function Pay({ row }: { row: Unlocked }) {
  const { t } = useTranslation("unlock")
  const pay = payOf(row)
  if (!pay) return <Blank />
  return (
    <span className="whitespace-nowrap tabular-nums">
      <span aria-hidden="true" dir="ltr">
        {pay.now ?? "—"}
        <span className="mx-1 text-muted-foreground">→</span>
        {pay.next ?? "—"}
      </span>
      <span className="sr-only">
        {t("list.payRead", {
          now: pay.now ?? t("list.notShared"),
          next: pay.next ?? t("list.notShared"),
        })}
      </span>
    </span>
  )
}

export function Band({ row }: { row: Unlocked }) {
  const { t } = useTranslation("unlock")
  const score = row.ai_overall_score
  if (score == null) return <Blank />
  const band = bandOf(score)
  return <StatusBadge tone={toneOf[band]}>{t(`list.band.${band}`)}</StatusBadge>
}
