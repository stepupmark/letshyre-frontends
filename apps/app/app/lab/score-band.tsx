import { StatusBadge } from "@/components/status-badge"
import { bandOf, toneOf } from "@/lib/score-band"

const label = {
  strong: "Strong match",
  partial: "Partial match",
  low: "Low match",
}

export function ScoreBand({ score }: { score: number }) {
  const band = bandOf(score)
  return <StatusBadge tone={toneOf[band]}>{label[band]}</StatusBadge>
}
