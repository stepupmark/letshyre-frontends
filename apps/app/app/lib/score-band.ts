import type { Tone } from "@/components/status-badge"

export type Band = "strong" | "partial" | "low"

// same cut-offs as the legacy score rings, so bands match what employers saw
export const bandOf = (score: number): Band =>
  score >= 70 ? "strong" : score >= 40 ? "partial" : "low"

export const toneOf: Record<Band, Tone> = {
  strong: "success",
  partial: "warning",
  low: "neutral",
}
