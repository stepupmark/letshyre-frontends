import { Info } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import KpiSummaryCards from "../../components/dashboard/unlocks/KpiSummaryCards";
import EngagementInsights from "../../components/dashboard/unlocks/EngagementInsights";
import TopPerformer from "../../components/dashboard/unlocks/TopPerformer";
import UnlocksTable from "../../components/dashboard/unlocks/UnlocksTable";
import { useUnlocksDashboard } from "../../hooks/useUnlocks";
import PageMeta from "../../components/common/PageMeta";
import UnlocksDashboardSkeleton from "../../components/Skeletons/UnlocksDashboardSkeleton";

export default function Unlocks() {
  const { data: dashboardData, isLoading, isError } = useUnlocksDashboard();

  if (isLoading) {
    return <UnlocksDashboardSkeleton />        
  }

  if (isError || !dashboardData) {
    return (
      <div className="p-6">
        <PageMeta
          title="Unlocks Dashboard | LetsHyre Admin"
          description="Unlocks dashboard analytics"
        />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Unlocks Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Overview of all candidate Unlocks and engagement analytics.
          </p>
        </div>
        <div className="flex items-center gap-3 p-6 mt-6 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-2xl">
          <Info className="w-5 h-5" />
          <p className="font-medium">
            Failed to load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="Unlocks Dashboard | LetsHyre Admin"
        description="Unlocks dashboard analytics"
      />
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Unlocks
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of all candidate Unlocks and engagement analytics
        </p>
      </div>

      <div className="mt-6">
        {/* KPI Summary Cards */}
        <KpiSummaryCards summary={dashboardData.summary} />

        {/* Analytics & Insights Row */}
        <div className="grid grid-cols-1 gap-6 mb-8 xl:grid-cols-4">
          <div className="xl:col-span-3">
            <EngagementInsights engagement={dashboardData.engagement} />
          </div>
          <div className="xl:col-span-1">
            <TopPerformer topPerformer={dashboardData.top_performer} />
          </div>
        </div>

        {/* Data Table */}
        <UnlocksTable />
      </div>
    </div>
  );
}
