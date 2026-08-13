import { CHART_COLORS } from "../config/chartColors";

export interface ChartSlice {
  label: string;
  /** Raw count from API */
  count: number;
  /** Percentage value (0–100) */
  percentage: number;
  /** Hex color for this slice */
  color: string;
  /** Whether this is the top (largest) slice */
  isTop: boolean;
}

function toTitleCase(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/s$/, "") // naïve singular form
    .trim();
}

export interface RawSkillPoint {
  skill: string;
  count: number;
  percentage: number;
}

export function transformSkillsData(raw: RawSkillPoint[]): ChartSlice[] {
  const merged = new Map<
    string,
    { label: string; count: number; percentage: number }
  >();

  for (const item of raw) {
    const key = normalizeKey(item.skill);
    const existing = merged.get(key);
    if (existing) {
      existing.count += item.count;
      existing.percentage += item.percentage;
    } else {
      merged.set(key, {
        label: toTitleCase(item.skill),
        count: item.count,
        percentage: item.percentage,
      });
    }
  }

  const entries = Array.from(merged.values()).sort((a, b) => b.count - a.count);
  const maxCount = entries[0]?.count ?? 0;

  return entries.map((entry, idx) => ({
    label: entry.label,
    count: entry.count,
    percentage: Math.round(entry.percentage),
    color: CHART_COLORS[idx % CHART_COLORS.length],
    isTop: entry.count === maxCount,
  }));
}

export interface RawTechnologyPoint {
  technology: string;
  count: number;
  percentage: number;
}

export function transformTechnologyData(
  raw: RawTechnologyPoint[],
): ChartSlice[] {
  const sorted = [...raw].sort((a, b) => b.count - a.count);
  const maxCount = sorted[0]?.count ?? 0;

  return sorted.map((item, idx) => ({
    label: toTitleCase(item.technology),
    count: item.count,
    percentage: Math.round(item.percentage * 10) / 10, // 1 decimal place
    color: CHART_COLORS[idx % CHART_COLORS.length],
    isTop: item.count === maxCount,
  }));
}
