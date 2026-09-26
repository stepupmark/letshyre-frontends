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
  const barBackground = "#f3f4f6";
  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
      <div className="min-h-[350px] w-full flex-1">
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
              className="dark:stroke-muted-foreground"
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
                    <div className="z-50 min-w-[200px] rounded-xl border border-border bg-card p-4 shadow-xl">
                      <p className="mb-3 text-sm font-bold text-foreground">
                        {item.role}
                      </p>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-muted-foreground">
                            Avg Score:
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {item.avg_score}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1 font-medium text-muted-foreground">
                            Candidates:
                          </span>
                          <span className="font-bold text-foreground">
                            {item.total_candidates}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-muted-foreground">
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
              background={{ fill: barBackground, radius: 6 }}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
              <LabelList
                dataKey="avg_score"
                position="top"
                formatter={(value) => `${value}%`}
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
