import { useQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { EmptyState } from "~/components/feedback/empty-state"
import { ErrorState } from "~/components/feedback/error-state"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { Skeleton } from "~/components/ui/skeleton"
import { formatNumber } from "~/lib/format"
import { dashboardQueries } from "../queries/dashboard.queries"
import { RoleScoreChart } from "./lazy-charts"
import { DashboardSection } from "./section"

export function InterviewSection() {
  const insights = useQuery(dashboardQueries.interview())

  let content
  if (insights.isError)
    content = (
      <ErrorState
        error={insights.error}
        onRetry={() => void insights.refetch()}
        className="rounded-xl border"
      />
    )
  else if (!insights.data)
    content = (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  else {
    const { role_wise_performance: roles, pass_fail_ratio: ratio } =
      insights.data
    content = (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score by role</CardTitle>
            <CardDescription>
              Average AI interview score, out of 100.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roles.length ? (
              <Suspense fallback={<Skeleton className="aspect-[2/1] w-full" />}>
                <RoleScoreChart data={roles} />
              </Suspense>
            ) : (
              <EmptyState
                title="No interviews yet"
                description="Scores by role appear once candidates finish AI interviews."
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pass rate</CardTitle>
            <CardDescription>Across all AI interviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {ratio ? (
              <>
                <p className="text-4xl font-semibold tabular-nums">
                  {ratio.pass_percentage}%
                </p>
                <Progress value={ratio.pass_percentage} />
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Passed</dt>
                    <dd className="font-medium tabular-nums">
                      {formatNumber(ratio.pass_count)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Failed</dt>
                    <dd className="font-medium tabular-nums">
                      {formatNumber(ratio.fail_count)}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <EmptyState
                title="No results yet"
                description="Pass and fail counts appear after the first interviews are scored."
              />
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardSection
      title="AI interviews"
      description="How candidates perform in AI-led interviews."
    >
      {content}
    </DashboardSection>
  )
}
