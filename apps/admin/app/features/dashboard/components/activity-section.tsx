import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CalendarDays, CalendarRange } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ErrorState } from "~/components/feedback/error-state";
import { StatCard } from "~/components/stat-card";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatNumber } from "~/lib/format";
import { dashboardQueries } from "../queries/dashboard.queries";
import {
  ACTIVITY_RANGES,
  type ActivityRange,
} from "../schemas/dashboard.schema";
import { DashboardSection } from "./section";

const chartConfig = {
  active_count: { label: "Active candidates", color: "var(--chart-2)" },
} satisfies ChartConfig;

const shortDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

export function ActivitySection({
  days,
  onDaysChange,
}: {
  days: ActivityRange;
  onDaysChange: (days: ActivityRange) => void;
}) {
  const summary = useQuery(dashboardQueries.activitySummary());
  const daily = useQuery(dashboardQueries.dailyActivity(Number(days)));
  const loading = summary.isPending;

  return (
    <DashboardSection
      title="Candidate activity"
      description="Candidates who used the platform."
    >
      {!summary.isError && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active today"
            icon={CalendarCheck}
            loading={loading}
            value={formatNumber(summary.data?.today_active)}
          />
          <StatCard
            label="This week"
            icon={CalendarDays}
            loading={loading}
            value={formatNumber(summary.data?.weekly_active)}
          />
          <StatCard
            label="This month"
            icon={CalendarRange}
            loading={loading}
            value={formatNumber(summary.data?.monthly_active)}
          />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Daily active candidates</CardTitle>
          <CardDescription>Over the last {days} days.</CardDescription>
          <CardAction>
            <Tabs
              value={days}
              onValueChange={(value) => onDaysChange(value as ActivityRange)}
            >
              <TabsList>
                {ACTIVITY_RANGES.map((range) => (
                  <TabsTrigger key={range} value={range}>
                    {range}d
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardAction>
        </CardHeader>
        <CardContent>
          {daily.isError ? (
            <ErrorState
              error={daily.error}
              onRetry={() => void daily.refetch()}
            />
          ) : !daily.data ? (
            <Skeleton className="aspect-[3/1] w-full" />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-[3/1] w-full"
            >
              <AreaChart data={daily.data} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tickFormatter={(date: string) =>
                    shortDate.format(new Date(date))
                  }
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
                      labelFormatter={(date) =>
                        shortDate.format(new Date(String(date)))
                      }
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
          )}
        </CardContent>
      </Card>
    </DashboardSection>
  );
}
