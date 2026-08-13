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

export default function DayWiseActivityChart({ data, days, onDaysChange, isFetching }: DayWiseActivityChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-gray-700/50 flex flex-col h-full relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 text-indigo-600 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              Activity Trend
              {isFetching && (
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h3>
          </div>
          <p className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Day-wise active candidates over the last {days} days
          </p>
        </div>

        <div className="relative shrink-0">
          <select
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className="py-2 pl-4 pr-10 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-200 shadow-sm appearance-none cursor-pointer rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days (1 Month)</option>
          </select>
          <ChevronDown className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
        </div>
      </div>

      <div className="w-full h-[300px] mt-4">
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
              dy={10}
              tickFormatter={(val) => {
                try {
                  const d = new Date(val);
                  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                } catch(e) {
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
                    <div className="z-50 p-4 border border-gray-100 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl dark:border-gray-700">
                      <p className="mb-2 font-semibold text-gray-900 dark:text-white">{label}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Active: <strong className="ml-1 text-gray-900 dark:text-white">{payload[0].value}</strong>
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
