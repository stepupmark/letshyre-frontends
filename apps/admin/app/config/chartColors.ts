export const CHART_COLORS = [
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
] as const;

export type ChartColor = (typeof CHART_COLORS)[number];
