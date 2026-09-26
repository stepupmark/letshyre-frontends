import { PieChart as PieChartIcon, Cpu } from "lucide-react";
import { useAnalyticsCharts } from "../../hooks/useAnalyticsCharts";
import ChartContainer from "../../components/charts/donut/ChartContainer";
import PieChartCard from "../../components/charts/donut/PieChartCard";
import DashboardGrid from "../../components/charts/donut/DashboardGrid";
import AnalyticsInsights from "../../components/charts/donut/AnalyticsInsights";
import RevenueSection from "../../components/dashboard/revenue/RevenueSection";
import AiInterviewInsightsSection from "../../components/dashboard/ai-interview/AiInterviewInsightsSection";
import CandidateActivitySection from "../../components/dashboard/candidate-activity/CandidateActivitySection";

function buildSkillsSubtitle(
  data: { label: string; percentage: number }[] | undefined,
) {
  if (!data || data.length === 0) return "No skills data available";
  const top = data[0];
  return `Top skill: ${top.label} (${top.percentage}%)`;
}

function buildTechSubtitle(
  data: { label: string; percentage: number }[] | undefined,
) {
  if (!data || data.length === 0) return "No technology data available";
  const top = data[0];
  return `Leading technology: ${top.label} (${top.percentage}%)`;
}

export default function Dashboard() {
  const { skills, technology, isAnyLoading } = useAnalyticsCharts();

  return (
    <div className="bg-muted/50">
      <RevenueSection />

      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Candidate skill and technology distribution at a glance.
        </p>
      </div>

      <DashboardGrid>
        <ChartContainer
          isLoading={skills.isLoading}
          isError={skills.isError}
          data={skills.data}
          emptyMessage="No skills data available"
        >
          {(data) => (
            <PieChartCard
              title="Skills Distribution"
              subtitle={buildSkillsSubtitle(data)}
              data={data}
              badge="Skills"
              icon={<PieChartIcon className="h-4 w-4" />}
            />
          )}
        </ChartContainer>

        <ChartContainer
          isLoading={technology.isLoading}
          isError={technology.isError}
          data={technology.data}
          emptyMessage="No technology data available"
        >
          {(data) => (
            <PieChartCard
              title="Technology Distribution"
              subtitle={buildTechSubtitle(data)}
              data={data}
              badge="Technology"
              icon={<Cpu className="h-4 w-4" />}
            />
          )}
        </ChartContainer>
      </DashboardGrid>

      {!isAnyLoading && (
        <AnalyticsInsights
          skillsData={skills.data ?? []}
          technologyData={technology.data ?? []}
        />
      )}

      <AiInterviewInsightsSection />

      <CandidateActivitySection />
    </div>
  );
}
