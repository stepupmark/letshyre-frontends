import { useTranslation } from "@workspace/i18n/react"

import { StatusBadge } from "@/components/status-badge"
import { bandOf, toneOf } from "@/lib/score-band"

/** AI scores as a band, never as a precise-looking number. */
export function ScoreBand({ score }: { score: number }) {
  const { t } = useTranslation("common")
  const band = bandOf(score)
  return <StatusBadge tone={toneOf[band]}>{t(`band.${band}`)}</StatusBadge>
}
