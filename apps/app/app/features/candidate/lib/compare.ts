import { isRecordId } from "./candidate"

export const MAX_COMPARE = 3

export const compareIds = (raw: string | null) =>
  [...new Set((raw ?? "").split(",").map((id) => id.trim()))]
    .filter(isRecordId)
    .slice(0, MAX_COMPARE)

// a lead needs someone to lead: one score among blanks isn't highlighted
export function leaders(values: (number | null | undefined)[]) {
  const known = values.filter((v): v is number => typeof v === "number")
  if (known.length < 2) return new Set<number>()
  const top = Math.max(...known)
  if (known.every((v) => v === top)) return new Set<number>()
  return new Set(values.flatMap((v, i) => (v === top ? [i] : [])))
}
