import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DayWiseActivityData } from "../../../api/candidateActivity.api";
import { Activity, ChevronDown } from "lucide-react";

interface DayWiseActivityChartProps {
  data: DayWiseActivityData[];
  days: number;
  onDaysChange: (days: number) => void;
  isFetching?: boolean;
}

export default function DayWiseActivityChart({
  data,
  days,
  onDaysChange,
  isFetching,
}: DayWiseActivityChartProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
              Activity Trend
              {isFetching && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
              )}
            </h3>
          </div>
          <p className="ml-1 text-sm font-medium text-muted-foreground">
            Day-wise active candidates over the last {days} days
          </p>
        </div>

        <div className="relative shrink-0">
          <select
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className="cursor-pointer appearance-none rounded-xl border border-border bg-card py-2 pr-10 pl-4 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-accent focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days (1 Month)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-muted-foreground"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
              dy={10}
              tickFormatter={(val) => {
                try {
                  const d = new Date(val);
                  return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
                } catch {
                  return val;
                }
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              dx={-10}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="z-50 rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md">
                      <p className="mb-2 font-semibold text-foreground">
                        {label}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <span className="text-sm text-muted-foreground">
                          Active:{" "}
                          <strong className="ml-1 text-foreground">
                            {payload[0].value}
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="active_count"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActivity)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
