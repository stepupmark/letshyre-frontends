import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { PassFailRatio } from "../../../api/aiInterview.api";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface PassFailRatioCardProps {
  data: PassFailRatio;
}

export default function PassFailRatioCard({ data }: PassFailRatioCardProps) {
  const chartData = [
    { name: "Passed", value: data.pass_count, color: "#10b981" }, // Emerald 500
    { name: "Failed", value: data.fail_count, color: "#f43f5e" }, // Rose 500
  ];

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
      <div className="absolute top-0 right-0 -z-10 h-32 w-32 rounded-bl-full bg-emerald-50 transition-transform duration-500 hover:scale-110 dark:bg-emerald-900/10" />

      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Outcome Ratio
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Overall pass vs fail rate
          </p>
        </div>
      </div>

      <div className="relative flex min-h-[200px] flex-1 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="z-50 flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xl">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {data.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {data.value} Candidates
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-foreground">
            {data.pass_percentage}%
          </span>
          <span className="text-xs font-semibold tracking-wider text-emerald-500 uppercase">
            Pass Rate
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100/50 bg-emerald-50/50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-600/80 uppercase dark:text-emerald-400/80">
              Passed
            </p>
            <p className="text-lg font-bold text-foreground">
              {data.pass_count}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-rose-100/50 bg-rose-50/50 p-3 dark:border-rose-500/20 dark:bg-rose-500/10">
          <div className="rounded-lg bg-rose-100 p-2 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-rose-600/80 uppercase dark:text-rose-400/80">
              Failed
            </p>
            <p className="text-lg font-bold text-foreground">
              {data.fail_count}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
