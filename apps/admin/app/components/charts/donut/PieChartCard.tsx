import { useState, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
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

export default function PieChartCard({
  title,
  subtitle,
  data,
  icon,
  badge,
}: Props) {
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
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:shadow-lg">
      <div
        className="h-0.5 w-full"
        style={{
          background: topSlice
            ? `linear-gradient(90deg, ${topSlice.color}cc, ${data[1]?.color ?? topSlice.color}55)`
            : "transparent",
        }}
      />

      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {badge && (
              <span className="mb-2 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-indigo-600 uppercase dark:bg-indigo-900/30 dark:text-indigo-400">
                {badge}
              </span>
            )}
            <h3 className="text-[15px] leading-snug font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 dark:group-hover:bg-indigo-900/20">
              {icon}
            </div>
          )}
        </div>

        <div
          className="relative flex items-center justify-center"
          style={{ height: 210 }}
        >
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
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.4
                    }
                    // Cell forwards this to the slice, the recharts types just don't list it
                    {...{
                      outerRadius:
                        activeIndex === index ? HOVER_OUTER : OUTER_RADIUS,
                    }}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 0.18s ease, filter 0.18s ease",
                      filter:
                        activeIndex === index
                          ? `drop-shadow(0 0 6px ${entry.color}99)`
                          : "none",
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

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] leading-none font-bold text-foreground tabular-nums">
              {activeIndex !== null ? data[activeIndex].count : totalCount}
            </span>
            <span className="mt-1 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              {activeIndex !== null ? data[activeIndex].label : "Total"}
            </span>
          </div>
        </div>

        <div className="my-4 border-t border-border" />

        <div className="space-y-2.5">
          {data.map((entry, index) => (
            <div
              key={index}
              className="group/row cursor-default"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full transition-transform duration-150 group-hover/row:scale-[1.4]"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span
                    className={`truncate text-[13px] leading-tight transition-colors duration-150 ${
                      entry.isTop
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground group-hover/row:text-foreground"
                    }`}
                  >
                    {entry.label}
                    {entry.isTop && (
                      <span
                        className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase"
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
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {entry.count}
                  </span>
                  <span
                    className="w-9 text-right text-[12px] font-semibold tabular-nums"
                    style={{ color: entry.color }}
                  >
                    {entry.percentage}%
                  </span>
                </div>
              </div>

              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${entry.percentage}%`,
                    backgroundColor: entry.color,
                    opacity:
                      activeIndex === null || activeIndex === index ? 1 : 0.35,
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
