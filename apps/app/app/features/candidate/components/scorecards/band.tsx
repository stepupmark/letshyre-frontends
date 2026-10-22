import { useTranslation } from "@workspace/i18n/react"

import { ScoreBand } from "@/components/score-band"
import { StatusBadge } from "@/components/status-badge"

import type { ScorecardItem } from "../../schemas/candidate.schema"

export function ItemBand({ item }: { item: ScorecardItem }) {
  const { t } = useTranslation("candidate")
  return item.overall_score == null ? (
    <StatusBadge tone="neutral">{t("list.notScored")}</StatusBadge>
  ) : (
    <ScoreBand score={item.overall_score} of="interview" />
  )
}
