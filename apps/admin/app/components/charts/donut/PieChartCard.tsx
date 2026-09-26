import { useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartSlice } from "../../../lib/chartTransformers";
import DonutTooltip from "./DonutTooltip";

interface Props {
  title: string;
  subtitle: string;
  data: ChartSlice[];
  icon?: React.ReactNode;
  badge?: string;
}

const INNER_RADIUS = 64;
const OUTER_RADIUS = 96;
const HOVER_OUTER = 103;

export default function PieChartCard({ title, subtitle, data, icon, badge }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const topSlice = data[0];

  const onSliceEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const onSliceLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div
        className="h-0.5 w-full"
        style={{
          background: topSlice
            ? `linear-gradient(90deg, ${topSlice.color}cc, ${data[1]?.color ?? topSlice.color}55)`
            : "transparent",
        }}
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            {badge && (
              <span className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-2">
                {badge}
              </span>
            )}
            <h3 className="text-[15px] font-semibold text-foreground tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          </div>
          {icon && (
            <div className="shrink-0 w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-500 transition-colors duration-200">
              {icon}
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-center" style={{ height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={INNER_RADIUS}
                outerRadius={OUTER_RADIUS}
                dataKey="count"
                nameKey="label"
                paddingAngle={2.5}
                onMouseEnter={onSliceEnter}
                onMouseLeave={onSliceLeave}
                strokeWidth={0}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    outerRadius={activeIndex === index ? HOVER_OUTER : OUTER_RADIUS}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 0.18s ease, filter 0.18s ease",
                      filter: activeIndex === index ? `drop-shadow(0 0 6px ${entry.color}99)` : "none",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<DonutTooltip />}
                wrapperStyle={{ outline: "none", zIndex: 50 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[26px] font-bold text-foreground leading-none tabular-nums">
              {activeIndex !== null ? data[activeIndex].count : totalCount}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-widest font-medium">
              {activeIndex !== null ? data[activeIndex].label : "Total"}
            </span>
          </div>
        </div>

        <div className="border-t border-border my-4" />

        <div className="space-y-2.5">
          {data.map((entry, index) => (
            <div
              key={index}
              className="group/row cursor-default"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 transition-transform duration-150 group-hover/row:scale-[1.4]"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span
                    className={`text-[13px] leading-tight truncate transition-colors duration-150 ${
                      entry.isTop
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground group-hover/row:text-foreground"
                    }`}
                  >
                    {entry.label}
                    {entry.isTop && (
                      <span
                        className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                        style={{
                          backgroundColor: `${entry.color}18`,
                          color: entry.color,
                        }}
                      >
                        #1
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {entry.count}
                  </span>
                  <span
                    className="text-[12px] font-semibold tabular-nums w-9 text-right"
                    style={{ color: entry.color }}
                  >
                    {entry.percentage}%
                  </span>
                </div>
              </div>

              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${entry.percentage}%`,
                    backgroundColor: entry.color,
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.35,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
