import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { EmptyState } from "~/components/feedback/empty-state";
import { ErrorState } from "~/components/feedback/error-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";
import { formatNumber } from "~/lib/format";
import { dashboardQueries } from "../queries/dashboard.queries";
import type { Share } from "../schemas/dashboard.schema";
import { DashboardSection } from "./section";

const TOP = 8;

function ShareCard({
  title,
  query,
}: {
  title: string;
  query: UseQueryResult<Share[]>;
}) {
  const shares = query.data ?? [];
  const top = shares[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {top
            ? `${top.label} leads with ${top.percentage}% of candidates.`
            : "Share of candidates."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isError ? (
          <ErrorState
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : query.isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        ) : !shares.length ? (
          <EmptyState title="No data yet" />
        ) : (
          <ul className="space-y-3">
            {shares.slice(0, TOP).map((share) => (
              <li key={share.label} className="space-y-1.5">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="truncate">{share.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {share.percentage}% · {formatNumber(share.count)}
                  </span>
                </div>
                <Progress value={Math.min(share.percentage, 100)} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DistributionSection() {
  const skills = useQuery(dashboardQueries.skills());
  const technologies = useQuery(dashboardQueries.technologies());

  return (
    <DashboardSection
      title="Candidates"
      description="What candidates on the platform know and work with."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ShareCard title="Top skills" query={skills} />
        <ShareCard title="Top technologies" query={technologies} />
      </div>
    </DashboardSection>
  );
}
