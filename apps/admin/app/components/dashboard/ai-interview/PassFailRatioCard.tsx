import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
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
    <div className="bg-card rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-border flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10 transition-transform duration-500 hover:scale-110" />

      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Outcome Ratio
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Overall pass vs fail rate
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
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
                    <div className="bg-card p-3 rounded-lg shadow-xl border border-border z-50 flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{data.name}</span>
                        <span className="text-xs text-muted-foreground">{data.value} Candidates</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-foreground tracking-tight">
            {data.pass_percentage}%
          </span>
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
            Pass Rate
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100/50 dark:border-emerald-500/20">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium uppercase">Passed</p>
            <p className="text-lg font-bold text-foreground">{data.pass_count}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100/50 dark:border-rose-500/20">
          <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 font-medium uppercase">Failed</p>
            <p className="text-lg font-bold text-foreground">{data.fail_count}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
