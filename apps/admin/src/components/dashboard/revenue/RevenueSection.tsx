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
      className="drop-shadow-sm"
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
      className="drop-shadow-sm"
    />
  </svg>
);

const SkeletonCard = () => (
  <div className="p-5 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 animate-pulse">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
      <div className="flex-1 pt-1 space-y-3">
        <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="w-32 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div className="w-20 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
      <div className="w-16 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
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
      <div className="p-6 mb-8 bg-white border border-gray-200 dark:bg-gray-900 rounded-2xl dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-3">
            <div className="w-48 h-8 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
            <div className="w-64 h-4 bg-gray-100 rounded dark:bg-gray-800 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="w-32 h-10 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
            <div className="w-32 h-10 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(7)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 h-[400px] animate-pulse flex items-center justify-center">
          <p className="font-medium text-gray-400 dark:text-gray-500">
            Loading chart data...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center w-full gap-3 p-6 mb-8 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-2xl">
        <Info className="w-5 h-5" />
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
    <div className="mb-8 overflow-hidden rounded-2xl dark:border-gray-800">
      {/* Header & Controls */}
      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              Revenue Analytics
              {isFetching && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overview of revenue for the current year
            </p>
          </div>
        </motion.div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {cardsData && (
          <>
            <RevenueStatCard
              index={0}
              title="Total Revenue"
              value={getConvertedValue(cardsData.total_revenue || 0)}
              isCurrency={true}
              currency={currency}
              subtitle="Lifetime revenue"
              icon={<Banknote className="w-6 h-6" />}
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
              icon={<Calendar className="w-6 h-6" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
              trendIndicator={<TrendingUp className="w-5 h-5 text-green-500" />}
            />
            <RevenueStatCard
              index={2}
              title="Weekly Revenue"
              value={getConvertedValue(cardsData.weekly_revenue || 0)}
              isCurrency={true}
              currency={currency}
              subtitle="This week's revenue"
              icon={<CalendarDays className="w-6 h-6" />}
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
              icon={<CalendarClock className="w-6 h-6" />}
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
              icon={<Activity className="w-6 h-6" />}
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
              icon={<TrendingUp className="w-6 h-6" />}
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
              icon={<Coins className="w-6 h-6" />}
              iconBgColor="bg-teal-100 dark:bg-teal-900/30"
              iconColor="text-teal-600 dark:text-teal-400"
              trendIndicator={<TrendingUp className="w-5 h-5 text-teal-500" />}
            />
          </>
        )}
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800/50 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow duration-300 mb-6"
      >
        <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monthly Revenue
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="py-2 pl-10 pr-10 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              <CalendarIcon className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2" />
              <ChevronDown className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
            </div>

            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Bar Chart</span>
              <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all active:scale-95">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <RevenueBarChart data={formattedChartData} currency={currency} />
      </motion.div>

      {/* Footer Info */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex items-center gap-2 p-4 text-blue-600 border border-blue-100 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400"
      >
        <Info className="flex-shrink-0 w-5 h-5" />
        <p className="text-sm font-medium">
          Only paid transactions are included in revenue.
        </p>
      </motion.div> */}
    </div>
  );
}
