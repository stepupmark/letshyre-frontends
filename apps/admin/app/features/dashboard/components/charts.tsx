import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  formatCompactCurrency,
  formatCurrency,
  formatShortDate,
} from "~/lib/format";

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-2)" },
} satisfies ChartConfig;

const activityConfig = {
  active_count: { label: "Active candidates", color: "var(--chart-2)" },
} satisfies ChartConfig;

const scoreConfig = {
  avg_score: { label: "Average score", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <ChartContainer config={revenueConfig} className="aspect-[3/1] w-full">
      <BarChart data={data} margin={{ left: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickFormatter={(month: string) => month.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export function ActivityChart({
  data,
}: {
  data: { date: string; active_count: number }[];
}) {
  return (
    <ChartContainer config={activityConfig} className="aspect-[3/1] w-full">
      <AreaChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
          tickFormatter={(date: string) => formatShortDate(date)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(date) => formatShortDate(String(date))}
            />
          }
        />
        <Area
          dataKey="active_count"
          type="monotone"
          fill="var(--color-active_count)"
          fillOpacity={0.2}
          stroke="var(--color-active_count)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function RoleScoreChart({
  data,
}: {
  data: { role: string; avg_score: number }[];
}) {
  return (
    <ChartContainer config={scoreConfig} className="aspect-[2/1] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="role"
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="avg_score" fill="var(--color-avg_score)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
