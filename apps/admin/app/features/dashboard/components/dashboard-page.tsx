import { PageHeader } from "@/components/page-header"
import { useSearchState } from "@/lib/search-params"
import { readDashboardParams } from "../search-params"
import { ActivitySection } from "./activity-section"
import { DistributionSection } from "./distribution-section"
import { InterviewSection } from "./interview-section"
import { RevenueSection } from "./revenue-section"

export function DashboardPage() {
  const [{ year, days }, setParams] = useSearchState(readDashboardParams)

  return (
    <>
      <PageHeader title="Dashboard" description="How LetsHyre is doing." />
      <div className="space-y-10">
        <RevenueSection
          year={year}
          onYearChange={(next) => {
            setParams({ year: next })
          }}
        />
        <ActivitySection
          days={days}
          onDaysChange={(next) => {
            setParams({ days: next })
          }}
        />
        <DistributionSection />
        <InterviewSection />
      </div>
    </>
  )
}
