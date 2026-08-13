import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { RoleWisePerformance } from "../../../api/aiInterview.api";

interface RolePerformanceChartProps {
  data: RoleWisePerformance[];
}

export default function RolePerformanceChart({
  data,
}: RolePerformanceChartProps) {
  const barBackground = "#f3f4f6"; // Tailwind gray-100
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]; // Purple, Blue, Emerald, Amber, Red

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 dark:border-gray-700/50 flex flex-col h-full relative overflow-hidden transition-all duration-300">
      <div className="flex-1 min-h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            barSize={40}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="role"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RoleWisePerformance;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 min-w-[200px]">
                      <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">
                        {item.role}
                      </p>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Avg Score:
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {item.avg_score}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            Candidates:
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {item.total_candidates}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Rating:
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {item.performance}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="avg_score"
              radius={[6, 6, 0, 0]}
              background={{ fill: barBackground, radius: [6, 6, 0, 0] }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
              <LabelList
                dataKey="avg_score"
                position="top"
                formatter={(value: number) => `${value}%`}
                style={{ fill: "#4b5563", fontSize: 12, fontWeight: 600 }}
                dy={-10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
