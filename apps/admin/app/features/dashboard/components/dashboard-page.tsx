import { useQueryStates } from "nuqs"
import { PageHeader } from "~/components/page-header"
import { dashboardSearchParams } from "../search-params"
import { ActivitySection } from "./activity-section"
import { DistributionSection } from "./distribution-section"
import { InterviewSection } from "./interview-section"
import { RevenueSection } from "./revenue-section"

export function DashboardPage() {
  const [{ year, days }, setParams] = useQueryStates(dashboardSearchParams)

  return (
    <>
      <PageHeader title="Dashboard" description="How LetsHyre is doing." />
      <div className="space-y-10">
        <RevenueSection
          year={year}
          onYearChange={(next) => void setParams({ year: next })}
        />
        <ActivitySection
          days={days}
          onDaysChange={(next) => void setParams({ days: next })}
        />
        <DistributionSection />
        <InterviewSection />
      </div>
    </>
  )
}
