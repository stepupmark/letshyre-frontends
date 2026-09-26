import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CalendarRange,
  Coins,
  IndianRupee,
  Receipt,
  ShoppingCart,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency, formatNumber } from "~/lib/format";
import { dashboardQueries } from "../queries/dashboard.queries";
import { currentYear } from "../search-params";
import { RevenueChart } from "./lazy-charts";
import { DashboardSection } from "./section";

export function RevenueSection({
  year,
  onYearChange,
}: {
  year: number;
  onYearChange: (year: number) => void;
}) {
  const summary = useQuery(dashboardQueries.revenueSummary());
  const monthly = useQuery(dashboardQueries.monthlyRevenue(year));
  const data = summary.data;
  const loading = summary.isPending;
  const years = Array.from({ length: 5 }, (_, index) => currentYear() - index);

  return (
    <DashboardSection
      title="Revenue"
      description="Credit sales across the platform."
    >
      {summary.isError ? (
        <ErrorState
          error={summary.error}
          onRetry={() => void summary.refetch()}
          className="rounded-xl border"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total revenue"
            icon={IndianRupee}
            loading={loading}
            value={formatCurrency(data?.total_revenue)}
            hint={`${formatCurrency(data?.today_revenue)} today`}
          />
          <StatCard
            label="This week"
            icon={CalendarDays}
            loading={loading}
            value={formatCurrency(data?.weekly_revenue)}
          />
          <StatCard
            label="This month"
            icon={CalendarRange}
            loading={loading}
            value={formatCurrency(data?.monthly_revenue)}
          />
          <StatCard
            label="Transactions"
            icon={Receipt}
            loading={loading}
            value={formatNumber(data?.total_transactions)}
          />
          <StatCard
            label="Average order"
            icon={ShoppingCart}
            loading={loading}
            value={formatCurrency(data?.avg_order_value)}
          />
          <StatCard
            label="Credits sold"
            icon={Coins}
            loading={loading}
            value={formatNumber(data?.total_credits_sold)}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Monthly revenue</CardTitle>
          <CardDescription>Revenue for each month of {year}.</CardDescription>
          <CardAction>
            <Select
              value={String(year)}
              onValueChange={(value) => onYearChange(Number(value))}
            >
              <SelectTrigger aria-label="Year" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          {monthly.isError ? (
            <ErrorState
              error={monthly.error}
              onRetry={() => void monthly.refetch()}
            />
          ) : !monthly.data ? (
            <Skeleton className="aspect-[3/1] w-full" />
          ) : (
            <Suspense fallback={<Skeleton className="aspect-[3/1] w-full" />}>
              <RevenueChart data={monthly.data} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </DashboardSection>
  );
}
