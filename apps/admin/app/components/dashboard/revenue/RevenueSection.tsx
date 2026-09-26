import { useState } from "react";
import {
  Banknote,
  Calendar,
  CalendarDays,
  CalendarClock,
  Activity,
  TrendingUp,
  Coins,
  Calendar as CalendarIcon,
  ChevronDown,
  Info,
  BarChart3,
  MoreVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRevenueAnalytics } from "../../../hooks/useRevenueAnalytics";
import RevenueStatCard from "./RevenueStatCard";
import RevenueBarChart from "./RevenueBarChart";

const currentYear = new Date().getFullYear();

const SparklineUp = ({ color }: { color: string }) => (
  <svg
    width="60"
    height="20"
    viewBox="0 0 60 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 18L18 8L32 14L58 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-xs"
    />
  </svg>
);

const SparklineFlat = ({ color }: { color: string }) => (
  <svg
    width="60"
    height="20"
    viewBox="0 0 60 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 10H58"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-xs"
    />
  </svg>
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-border bg-card p-5 shadow-xs">
    <div className="mb-4 flex items-start gap-4">
      <div className="h-12 w-12 rounded-xl bg-muted"></div>
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-4 w-24 rounded-sm bg-muted"></div>
        <div className="h-6 w-32 rounded-sm bg-muted"></div>
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div className="h-3 w-20 rounded-sm bg-muted"></div>
      <div className="h-6 w-16 rounded-sm bg-muted"></div>
    </div>
  </div>
);

export default function RevenueSection() {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const currency = "INR";
  const { summaryCards, monthlyRevenue, isLoading, isFetching, isError } =
    useRevenueAnalytics(selectedYear);

  const getConvertedValue = (val: number) => val;

  if (isLoading) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-sm bg-muted"></div>
            <div className="h-4 w-64 animate-pulse rounded-sm bg-muted"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 animate-pulse rounded-sm bg-muted"></div>
            <div className="h-10 w-32 animate-pulse rounded-sm bg-muted"></div>
          </div>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(7)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="flex h-[400px] animate-pulse items-center justify-center rounded-xl border border-border bg-muted/50 p-6">
          <p className="font-medium text-muted-foreground">
            Loading chart data...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mb-8 flex w-full items-center gap-3 rounded-2xl bg-red-50 p-6 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <Info className="h-5 w-5" />
        <p className="font-medium">
          Failed to load revenue analytics. Please try again later.
        </p>
      </div>
    );
  }

  const cardsData = summaryCards.data;
  const chartData = monthlyRevenue.data || [];

  const formattedChartData = chartData.map((d) => ({
    ...d,
    revenue: getConvertedValue(d.revenue),
  }));

  return (
    <div className="mb-8 overflow-hidden rounded-2xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              Revenue Analytics
              {isFetching && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of revenue for the current year
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardsData && (
          <>
            <RevenueStatCard
              index={0}
              title="Total Revenue"
              value={getConvertedValue(cardsData.total_revenue || 0)}
              isCurrency={true}
              currency={currency}
              subtitle="Lifetime revenue"
              icon={<Banknote className="h-6 w-6" />}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
              trendIndicator={<SparklineUp color="#3B82F6" />}
            />
            <RevenueStatCard
              index={1}
              title="Today Revenue"
              value={getConvertedValue(cardsData.today_revenue || 0)}
              isCurrency={true}
              currency={currency}
              subtitle="Revenue for today"
              icon={<Calendar className="h-6 w-6" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
              trendIndicator={<TrendingUp className="h-5 w-5 text-green-500" />}
            />
            <RevenueStatCard
              index={2}
              title="Weekly Revenue"
              value={getConvertedValue(cardsData.weekly_revenue || 0)}
              isCurrency={true}
              currency={currency}
              subtitle="This week's revenue"
              icon={<CalendarDays className="h-6 w-6" />}
              iconBgColor="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600 dark:text-orange-400"
              trendIndicator={<SparklineUp color="#F97316" />}
            />
            <RevenueStatCard
              index={3}
              title="Monthly Revenue"
              value={getConvertedValue(cardsData.monthly_revenue || 0)}
              isCurrency={true}
              currency={currency}
              subtitle="This month's revenue"
              icon={<CalendarClock className="h-6 w-6" />}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
              trendIndicator={<SparklineFlat color="#A855F7" />}
            />
            <RevenueStatCard
              index={4}
              title="Avg Order Value"
              value={getConvertedValue(cardsData.avg_order_value || 0)}
              isCurrency={true}
              currency={currency}
              subtitle="Per transaction"
              icon={<Activity className="h-6 w-6" />}
              iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor="text-indigo-600 dark:text-indigo-400"
              trendIndicator={<SparklineUp color="#6366F1" />}
            />
            <RevenueStatCard
              index={5}
              title="Total Transactions"
              value={cardsData.total_transactions || 0}
              isCurrency={false}
              subtitle="All-time transactions"
              icon={<TrendingUp className="h-6 w-6" />}
              iconBgColor="bg-pink-100 dark:bg-pink-900/30"
              iconColor="text-pink-600 dark:text-pink-400"
              trendIndicator={<SparklineUp color="#EC4899" />}
            />
            <RevenueStatCard
              index={6}
              title="Total Credits Sold"
              value={cardsData.total_credits_sold || 0}
              isCurrency={false}
              subtitle="All-time credits"
              icon={<Coins className="h-6 w-6" />}
              iconBgColor="bg-teal-100 dark:bg-teal-900/30"
              iconColor="text-teal-600 dark:text-teal-400"
              trendIndicator={<TrendingUp className="h-5 w-5 text-teal-500" />}
            />
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6 rounded-xl border border-border bg-card p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-md"
      >
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h3 className="text-lg font-semibold text-foreground">
            Monthly Revenue
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded-lg border border-border bg-card py-2 pr-10 pl-10 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {[
                  currentYear - 4,
                  currentYear - 3,
                  currentYear - 2,
                  currentYear - 1,
                  currentYear,
                ].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent active:scale-95">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Bar Chart</span>
              <ChevronDown className="ml-1 h-4 w-4 text-muted-foreground" />
            </button>
            <button className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-accent hover:text-muted-foreground active:scale-95">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <RevenueBarChart data={formattedChartData} currency={currency} />
      </motion.div>
    </div>
  );
}
