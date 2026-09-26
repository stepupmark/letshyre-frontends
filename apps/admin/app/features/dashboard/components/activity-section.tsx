import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CalendarDays, CalendarRange } from "lucide-react";
import { Suspense } from "react";
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
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatNumber } from "~/lib/format";
import { dashboardQueries } from "../queries/dashboard.queries";
import {
  ACTIVITY_RANGES,
  type ActivityRange,
} from "../schemas/dashboard.schema";
import { ActivityChart } from "./lazy-charts";
import { DashboardSection } from "./section";

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
            <Suspense fallback={<Skeleton className="aspect-[3/1] w-full" />}>
              <ActivityChart data={daily.data} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </DashboardSection>
  );
}
