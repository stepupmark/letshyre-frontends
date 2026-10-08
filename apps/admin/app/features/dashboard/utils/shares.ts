import type { Share } from "../schemas/dashboard.schema"

function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

/** Merges near-duplicates like "React" / "react" / "Reacts" and sorts by count. */
export function toShares(
  items: { name: string; count: number; percentage: number }[]
): Share[] {
  const merged = new Map<string, Share>()
  for (const item of items) {
    const key = item.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/s$/, "")
      .trim()
    const existing = merged.get(key)
    if (existing) {
      existing.count += item.count
      existing.percentage += item.percentage
    } else {
      merged.set(key, {
        label: titleCase(item.name),
        count: item.count,
        percentage: item.percentage,
      })
    }
  }
  return [...merged.values()]
    .map((share) => ({
      ...share,
      percentage: Math.round(share.percentage * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
}
